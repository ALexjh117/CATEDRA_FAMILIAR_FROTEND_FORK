import { useState, useEffect } from 'react';
import { getSession, getTareas, getEntregas, getCursos } from '../../api/endpoints';
import { listarCursos, type CursoBackend } from '../../api/docentes';
import { type Tarea, type Entrega } from '../../mocks/data';
import TeacherLayout from '../TeacherLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import { exportToExcel, exportEstadisticasToPDF } from '../../utils/exportUtils';
import {
  IconDownload,
  IconBarChart,
  IconClipboard,
  IconBook,
  IconCheckCircle
} from '../ui/Icons';

type TipoReporte = 'tareas' | 'cursos' | 'entregas' | 'calificaciones';

interface ReporteConfig {
  id: TipoReporte;
  nombre: string;
  descripcion: string;
  icono: React.ComponentType<any>;
  color: string;
}

export default function ReportesDocente() {
  const session = getSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cursos, setCursos] = useState<CursoBackend[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('2026-1');
  const [reporteSeleccionado, setReporteSeleccionado] = useState<TipoReporte | null>(null);

  const tiposReporte: ReporteConfig[] = [
    {
      id: 'tareas',
      nombre: 'Mis Tareas Creadas',
      descripcion: 'Listado completo de las tareas que has creado para tus cursos.',
      icono: IconClipboard,
      color: 'blue'
    },
    {
      id: 'cursos',
      nombre: 'Mis Cursos',
      descripcion: 'Resumen de los cursos que tienes asignados y su estado.',
      icono: IconBook,
      color: 'purple'
    },
    {
      id: 'entregas',
      nombre: 'Entregas de Estudiantes',
      descripcion: 'Estado de las entregas realizadas por tus estudiantes.',
      icono: IconCheckCircle,
      color: 'emerald'
    },
    {
      id: 'calificaciones',
      nombre: 'Reporte de Calificaciones',
      descripcion: 'Análisis de calificaciones y rendimiento de tus estudiantes.',
      icono: IconBarChart,
      color: 'amber'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tareasData, entregasData] = await Promise.all([
        getTareas(),
        getEntregas()
      ]);

      const misTareas = Array.isArray(tareasData) 
        ? tareasData.filter(t => t.docenteId === user?.id) 
        : [];
      
      setTareas(misTareas);
      
      const misEntregas = Array.isArray(entregasData)
        ? entregasData.filter(e => misTareas.some(t => t.id === e.tareaId))
        : [];
      
      setEntregas(misEntregas);
      
      // Cursos: intentar endpoints.getCursos primero, luego fallback a docentes.listarCursos
      let cursosReal: any = [];
      try {
        const resCursos = await getCursos() as any;
        const body = resCursos?.data || resCursos;
        if (Array.isArray(body?.cursos)) cursosReal = body.cursos;
        else if (Array.isArray(body?.data?.data)) cursosReal = body.data.data;
        else if (Array.isArray(body?.data)) cursosReal = body.data;
        else if (Array.isArray(body?.items)) cursosReal = body.items;
        else if (Array.isArray(body)) cursosReal = body;
      } catch {}
      if (!Array.isArray(cursosReal) || cursosReal.length === 0) {
        try { cursosReal = await listarCursos(); } catch { cursosReal = []; }
      }
      setCursos(Array.isArray(cursosReal) ? cursosReal : []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarReporteTareas = async () => {
    setGenerando(true);
    try {
      const data = tareas.map(tarea => {
        const curso = cursos.find(c => c.id === tarea.cursoId);
        const entregasTarea = entregas.filter(e => e.tareaId === tarea.id);
        
        return {
          'Título': tarea.titulo,
          'Curso': curso?.nombre || 'N/A',
          'Grado': curso?.grado || 'N/A',
          'Fecha Creación': new Date(tarea.fechaCreacion).toLocaleDateString('es-CO'),
          'Fecha Límite': new Date(tarea.fechaLimite).toLocaleDateString('es-CO'),
          'Estado': tarea.estado === 'activa' ? 'Activa' : tarea.estado === 'completada' ? 'Completada' : 'Cerrada',
          'Entregas Recibidas': entregasTarea.length,
          'Promedio Calificación': entregasTarea.length > 0
            ? (entregasTarea.reduce((sum, e) => sum + Number(e.calificacion || 0), 0) / entregasTarea.length).toFixed(1)
            : 'N/A'
        };
      });

      if (data.length === 0) {
        data.push({
          'Título': 'Sin tareas creadas',
          'Curso': '-',
          'Grado': '-',
          'Fecha Creación': '-',
          'Fecha Límite': '-',
          'Estado': '-',
          'Entregas Recibidas': '-',
          'Promedio Calificación': '-'
        });
      }

      exportToExcel(
        data,
        `Reporte_Tareas_Docente_${periodoSeleccionado}`,
        'Mis Tareas'
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteCursos = async () => {
    setGenerando(true);
    try {
      // Reutilizar misma estrategia de carga de cursos para exportar
      let cursosExport: any = [];
      try {
        const resCursos = await getCursos() as any;
        const body = resCursos?.data || resCursos;
        if (Array.isArray(body?.cursos)) cursosExport = body.cursos;
        else if (Array.isArray(body?.data?.data)) cursosExport = body.data.data;
        else if (Array.isArray(body?.data)) cursosExport = body.data;
        else if (Array.isArray(body?.items)) cursosExport = body.items;
        else if (Array.isArray(body)) cursosExport = body;
      } catch {}
      if (!Array.isArray(cursosExport) || cursosExport.length === 0) {
        try { cursosExport = await listarCursos(); } catch { cursosExport = []; }
      }

      const data = (cursosExport || []).map((curso: any) => ({
        'Curso': curso.nombre || `Curso #${curso.id}`,
        'GradoId': curso.gradoId ?? '-',
        'Jornada': curso.jornada ?? '-',
        'InstitucionId': curso.institucionId ?? '-',
      }));

      exportToExcel(
        data.length > 0 ? data : [{ 'Curso': 'Sin cursos asignados', 'GradoId': '-', 'Jornada': '-', 'InstitucionId': '-' }],
        `Reporte_Cursos_Docente_${periodoSeleccionado}`,
        'Mis Cursos'
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteEntregas = async () => {
    setGenerando(true);
    try {
      const data = entregas.map(entrega => {
        const tarea = tareas.find(t => t.id === entrega.tareaId);
        const curso = cursos.find(c => c.id === tarea?.cursoId);
        
        return {
          'Estudiante': `Estudiante #${entrega.estudianteId}`,
          'Tarea': tarea?.titulo || 'N/A',
          'Curso': curso?.nombre || 'N/A',
          'Fecha Entrega': new Date(entrega.fechaEntrega).toLocaleDateString('es-CO'),
          'Calificación': entrega.calificacion || 'Pendiente',
          'Estado': entrega.estado === 'entregada' ? 'Entregada' : entrega.estado === 'calificada' ? 'Calificada' : 'Pendiente'
        };
      });

      if (data.length === 0) {
        data.push({
          'Estudiante': 'Sin entregas',
          'Tarea': '-',
          'Curso': '-',
          'Fecha Entrega': '-',
          'Calificación': '-',
          'Estado': '-'
        });
      }

      exportToExcel(
        data,
        `Reporte_Entregas_Docente_${periodoSeleccionado}`,
        'Entregas de Estudiantes'
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteCalificaciones = async () => {
    setGenerando(true);
    try {
      const stats = {
        'Docente': `${user?.nombre} ${user?.apellidos || ''}`,
        'Período': periodoSeleccionado,
        'Fecha del Reporte': new Date().toLocaleDateString('es-CO'),
        '': '',
        'RESUMEN GENERAL': '',
        'Total Tareas Creadas': tareas.length,
        'Total Entregas Recibidas': entregas.length,
        'Entregas Calificadas': entregas.filter(e => e.calificacion).length,
        'Entregas Pendientes': entregas.filter(e => !e.calificacion).length,
        ' ': '',
        'CALIFICACIONES': '',
        'Promedio General': entregas.length > 0
          ? (entregas.reduce((sum, e) => sum + Number(e.calificacion || 0), 0) / entregas.length).toFixed(1)
          : 'N/A',
        'Calificación Más Alta': entregas.length > 0
          ? Math.max(...entregas.map(e => Number(e.calificacion || 0)))
          : 'N/A',
        'Calificación Más Baja': entregas.length > 0
          ? Math.min(...entregas.filter(e => e.calificacion).map(e => Number(e.calificacion || 0)))
          : 'N/A',
        '  ': '',
        'CURSOS': '',
        'Total Cursos Asignados': cursos.length,
        'Cursos con Tareas Activas': cursos.filter(c => tareas.some(t => t.cursoId === c.id && t.estado === 'activa')).length
      };

      exportEstadisticasToPDF(
        stats,
        `Reporte_Calificaciones_Docente_${periodoSeleccionado}`,
        'Reporte de Calificaciones - Docente'
      );
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarReporte = async (tipo: TipoReporte) => {
    setReporteSeleccionado(tipo);
    switch (tipo) {
      case 'tareas':
        await generarReporteTareas();
        break;
      case 'cursos':
        await generarReporteCursos();
        break;
      case 'entregas':
        await generarReporteEntregas();
        break;
      case 'calificaciones':
        await generarReporteCalificaciones();
        break;
    }
    setReporteSeleccionado(null);
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 animate-pulse">Cargando tus reportes...</p>
        </div>
      </TeacherLayout>
    );
  }

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    blue: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600', icon: 'bg-blue-500' },
    purple: { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600', icon: 'bg-purple-500' },
    emerald: { bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200 hover:border-emerald-400', text: 'text-emerald-600', icon: 'bg-emerald-500' },
    amber: { bg: 'from-amber-50 to-amber-100/50', border: 'border-amber-200 hover:border-amber-400', text: 'text-amber-600', icon: 'bg-amber-500' }
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-teal-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/40 ring-4 ring-white/10">
                <IconBarChart className="text-white" size={32} />
              </div>
              <div>
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-1">
                  Centro de Reportes
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Mis Reportes Académicos
                </h1>
                <p className="text-blue-100 mt-1">
                  Seguimiento de tareas y rendimiento estudiantil
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={periodoSeleccionado}
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-xl font-medium border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="2026-1" className="text-gray-900">Período 2026-1</option>
                <option value="2025-2" className="text-gray-900">Período 2025-2</option>
                <option value="2025-1" className="text-gray-900">Período 2025-1</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconClipboard className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{tareas.length}</p>
                <p className="text-xs text-slate-500">Tareas Creadas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IconBook className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{cursos.length}</p>
                <p className="text-xs text-slate-500">Cursos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <IconCheckCircle className="text-emerald-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{entregas.length}</p>
                <p className="text-xs text-slate-500">Entregas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <IconBarChart className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {entregas.length > 0
                    ? (entregas.reduce((sum, e) => sum + Number(e.calificacion || 0), 0) / entregas.length).toFixed(1)
                    : '-'}
                </p>
                <p className="text-xs text-slate-500">Promedio</p>
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
      </div>
    </TeacherLayout>
  );
}
