import { useState, useEffect } from 'react';
import { getSession } from '../../api/endpoints';
import httpService from '../../api/httpService';
import DashboardLayout from '../DashboardLayout';
import OrientadorLayout from '../orientador-acudiente/OrientadorLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';
import { exportToExcel } from '../../utils/exportUtils';
import {
  IconDownload,
  IconBarChart,
  IconUsers,
  IconHeart,
  IconGraduationCap,
  IconAlert
} from '../ui/Icons';

type TipoReporte = 'estudiantesPorCurso' | 'cumplimientoEntregas' | 'alertasAcademicas' | 'sinCalificaciones';

interface ReporteConfig {
  id: TipoReporte;
  nombre: string;
  descripcion: string;
  icono: React.ComponentType<any>;
  color: string;
}

export default function ReportesOrientador() {
  const session = getSession();
  const user = session?.user;

  const Layout = user?.rol === 'orientador' ? OrientadorLayout : DashboardLayout;

  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('20261');
  const [reporteSeleccionado, setReporteSeleccionado] = useState<TipoReporte | null>(null);
  const [cursoId, setCursoId] = useState('');
  const [gradoId, setGradoId] = useState('');
  const [jornada, setJornada] = useState('');
  const [umbral, setUmbral] = useState('3.0');

  const tiposReporte: ReporteConfig[] = [
    {
      id: 'estudiantesPorCurso',
      nombre: 'Estudiantes por Curso/Grado/Jornada',
      descripcion: 'Totales por curso y resumen por grado y jornada.',
      icono: IconUsers,
      color: 'blue'
    },
    {
      id: 'cumplimientoEntregas',
      nombre: 'Cumplimiento de Entregas por Curso',
      descripcion: 'Tareas asignadas, entregadas y cumplimiento por estudiante y resumen.',
      icono: IconBarChart,
      color: 'indigo'
    },
    {
      id: 'alertasAcademicas',
      nombre: 'Alertas Académicas',
      descripcion: 'Estudiantes con notas bajo el umbral, agrupados por curso.',
      icono: IconAlert,
      color: 'amber'
    },
    {
      id: 'sinCalificaciones',
      nombre: 'Estudiantes sin Calificaciones',
      descripcion: 'Estudiantes sin calificaciones en el período, agrupados por curso.',
      icono: IconGraduationCap,
      color: 'purple'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Cargar datos específicos del orientador cuando el backend esté listo
      // await apiClient.getEstadisticasOrientador();
      // await apiClient.getCasosOrientador();
      // await apiClient.getEstudiantesOrientador();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeToRows = (payload: any): any[] => {
    if (!payload) return [];
    const data = payload.data ?? payload;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.list)) return data.list;
    if (Array.isArray(data?.alertas)) return data.alertas;
    if (Array.isArray(data?.estudiantes)) return data.estudiantes;
    if (Array.isArray(data?.cursos)) return data.cursos;
    return [data];
  };

  const generarEstudiantesPorCurso = async () => {
    setGenerando(true);
    try {
      const query: string[] = [];
      if (gradoId) query.push(`gradoId=${encodeURIComponent(Number(gradoId))}`);
      if (jornada) query.push(`jornada=${encodeURIComponent(jornada)}`);
      const qs = query.length ? `?${query.join('&')}` : '';
      const res = await httpService.get(`/reportes/institucion/estudiantes-por-curso${qs}`);
      const rows = normalizeToRows(res.data);
      exportToExcel(rows, `Estudiantes_por_Curso_${new Date().toISOString().slice(0,10)}`, 'Estudiantes por Curso');
    } finally {
      setGenerando(false);
    }
  };

  const generarCumplimientoEntregas = async () => {
    setGenerando(true);
    try {
      if (!cursoId) throw new Error('Selecciona un cursoId');
      const qs = periodoSeleccionado ? `?periodoId=${encodeURIComponent(Number(periodoSeleccionado))}` : '';
      const res = await httpService.get(`/reportes/cursos/${encodeURIComponent(Number(cursoId))}/entregas${qs}`);
      const rows = normalizeToRows(res.data);
      exportToExcel(rows, `Cumplimiento_Entregas_Curso_${cursoId}_${periodoSeleccionado || 'all'}`, 'Cumplimiento Entregas');
    } finally {
      setGenerando(false);
    }
  };

  const generarAlertasAcademicas = async () => {
    setGenerando(true);
    try {
      const query: string[] = [];
      if (umbral) query.push(`umbral=${encodeURIComponent(Number(umbral))}`);
      if (periodoSeleccionado) query.push(`periodoId=${encodeURIComponent(Number(periodoSeleccionado))}`);
      if (cursoId) query.push(`cursoId=${encodeURIComponent(Number(cursoId))}`);
      const qs = query.length ? `?${query.join('&')}` : '';
      const res = await httpService.get(`/reportes/institucion/alertas-academicas${qs}`);
      const rows = normalizeToRows(res.data);
      exportToExcel(rows, `Alertas_Academicas_${periodoSeleccionado || 'general'}`, 'Alertas Académicas');
    } finally {
      setGenerando(false);
    }
  };

  const generarSinCalificaciones = async () => {
    setGenerando(true);
    try {
      const query: string[] = [];
      if (periodoSeleccionado) query.push(`periodoId=${encodeURIComponent(Number(periodoSeleccionado))}`);
      if (cursoId) query.push(`cursoId=${encodeURIComponent(Number(cursoId))}`);
      const qs = query.length ? `?${query.join('&')}` : '';
      const res = await httpService.get(`/reportes/institucion/sin-calificaciones${qs}`);
      const rows = normalizeToRows(res.data);
      exportToExcel(rows, `Sin_Calificaciones_${periodoSeleccionado || 'general'}`, 'Sin Calificaciones');
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarReporte = (tipo: TipoReporte) => {
    setReporteSeleccionado(tipo);
  };

  const confirmarGenerar = async () => {
    if (!reporteSeleccionado) return;
    switch (reporteSeleccionado) {
      case 'estudiantesPorCurso':
        await generarEstudiantesPorCurso();
        break;
      case 'cumplimientoEntregas':
        await generarCumplimientoEntregas();
        break;
      case 'alertasAcademicas':
        await generarAlertasAcademicas();
        break;
      case 'sinCalificaciones':
        await generarSinCalificaciones();
        break;
    }
    setReporteSeleccionado(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 animate-pulse">Cargando reportes de orientación...</p>
        </div>
      </Layout>
    );
  }

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    rose: { bg: 'from-rose-50 to-rose-100/50', border: 'border-rose-200 hover:border-rose-400', text: 'text-rose-600', icon: 'bg-rose-500' },
    blue: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600', icon: 'bg-blue-500' },
    indigo: { bg: 'from-indigo-50 to-indigo-100/50', border: 'border-indigo-200 hover:border-indigo-400', text: 'text-indigo-600', icon: 'bg-indigo-500' },
    purple: { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600', icon: 'bg-purple-500' },
    amber: { bg: 'from-amber-50 to-amber-100/50', border: 'border-amber-200 hover:border-amber-400', text: 'text-amber-600', icon: 'bg-amber-500' }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-pink-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/40 ring-4 ring-white/10">
                <IconHeart className="text-white" size={32} />
              </div>
              <div>
                <p className="text-rose-200 text-sm font-semibold uppercase tracking-wider mb-1">
                  Centro de Reportes
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Reportes de Orientación
                </h1>
                <p className="text-rose-100 mt-1">Centro de reportes institucionales para Orientación</p>
              </div>
            </div>
            
            {/* Filtros ahora se solicitan en un modal al generar */
            }
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <IconHeart className="text-rose-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Casos Activos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconUsers className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Estudiantes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IconGraduationCap className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Familias</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <IconAlert className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Alertas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tipos de reporte */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Reportes Disponibles</h2>
            <p className="text-sm text-slate-500 mt-1">Selecciona el tipo de informe que necesitas generar</p>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-4">
            {tiposReporte.map((reporte) => {
              const colors = colorClasses[reporte.color];
              const IconComponent = reporte.icono;
              
              return (
                <div
                  key={reporte.id}
                  className={`relative bg-gradient-to-br ${colors.bg} rounded-xl p-5 border ${colors.border} transition-all cursor-pointer group hover:shadow-lg`}
                  onClick={() => handleGenerarReporte(reporte.id)}
                >
                  {generando && reporteSeleccionado === reporte.id && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                      <LoadingSpinner size="md" />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 ${colors.icon} rounded-xl shadow-lg`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">{reporte.nombre}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{reporte.descripcion}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${colors.text} bg-white/60 px-2 py-1 rounded-full`}>
                      Disponible
                    </span>
                    <button
                      disabled={generando}
                      className={`px-3 py-1.5 ${colors.icon} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50`}
                    >
                      <IconDownload size={14} />
                      Generar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal para seleccionar parámetros del reporte */}
        <Modal
          isOpen={!!reporteSeleccionado}
          onClose={() => setReporteSeleccionado(null)}
          title={
            reporteSeleccionado === 'estudiantesPorCurso' ? 'Estudiantes por Curso/Grado/Jornada' :
            reporteSeleccionado === 'cumplimientoEntregas' ? 'Cumplimiento de Entregas por Curso' :
            reporteSeleccionado === 'alertasAcademicas' ? 'Alertas Académicas' :
            reporteSeleccionado === 'sinCalificaciones' ? 'Estudiantes sin Calificaciones' : 'Generar reporte'
          }
          size="md"
        >
          <div className="space-y-4">
            {reporteSeleccionado === 'estudiantesPorCurso' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Grado (opcional)</label>
                  <input
                    type="number"
                    value={gradoId}
                    onChange={(e) => setGradoId(e.target.value)}
                    placeholder="Número de grado"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Jornada</label>
                  <select
                    value={jornada}
                    onChange={(e) => setJornada(e.target.value)}
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    <option value="">Todas</option>
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                </div>
              </div>
            )}

            {reporteSeleccionado === 'cumplimientoEntregas' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Curso</label>
                  <input
                    type="number"
                    value={cursoId}
                    onChange={(e) => setCursoId(e.target.value)}
                    placeholder="Número de curso"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Período (opcional)</label>
                  <input
                    value={periodoSeleccionado}
                    onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                    placeholder="Ej: 20261"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            )}

            {reporteSeleccionado === 'alertasAcademicas' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Umbral (nota mínima)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={umbral}
                    onChange={(e) => setUmbral(e.target.value)}
                    placeholder="3.0"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Período (opcional)</label>
                  <input
                    value={periodoSeleccionado}
                    onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                    placeholder="Ej: 20261"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Curso (opcional)</label>
                  <input
                    type="number"
                    value={cursoId}
                    onChange={(e) => setCursoId(e.target.value)}
                    placeholder="Número de curso"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            )}

            {reporteSeleccionado === 'sinCalificaciones' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Período</label>
                  <input
                    value={periodoSeleccionado}
                    onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                    placeholder="Ej: 20261"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-700">Curso (opcional)</label>
                  <input
                    type="number"
                    value={cursoId}
                    onChange={(e) => setCursoId(e.target.value)}
                    placeholder="Número de curso"
                    className="px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReporteSeleccionado(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarGenerar}
                disabled={generando}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {generando ? 'Generando...' : 'Generar Reporte'}
              </button>
            </div>
          </div>
        </Modal>

        {/* Nota removida: endpoints ya disponibles en backend */}
      </div>
    </Layout>
  );
}
