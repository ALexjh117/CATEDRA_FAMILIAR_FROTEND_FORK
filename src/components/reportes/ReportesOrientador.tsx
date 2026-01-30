import { useState, useEffect } from 'react';
import { getSession } from '../../api/endpoints';
import apiClient from '../../api/apiClient';
import DashboardLayout from '../DashboardLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import { exportToExcel, exportEstadisticasToPDF } from '../../utils/exportUtils';
import {
  IconDownload,
  IconBarChart,
  IconUsers,
  IconHeart,
  IconGraduationCap,
  IconAlert
} from '../ui/Icons';

type TipoReporte = 'casos' | 'estudiantes' | 'participacion' | 'alertas';

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

  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('2026-1');
  const [reporteSeleccionado, setReporteSeleccionado] = useState<TipoReporte | null>(null);

  const tiposReporte: ReporteConfig[] = [
    {
      id: 'casos',
      nombre: 'Casos de Acompañamiento',
      descripcion: 'Registro y seguimiento de casos de acompañamiento familiar y estudiantil.',
      icono: IconHeart,
      color: 'rose'
    },
    {
      id: 'estudiantes',
      nombre: 'Estudiantes Atendidos',
      descripcion: 'Listado de estudiantes con seguimiento y atención personalizada.',
      icono: IconUsers,
      color: 'blue'
    },
    {
      id: 'participacion',
      nombre: 'Participación Familiar',
      descripcion: 'Nivel de participación de las familias en actividades del programa.',
      icono: IconGraduationCap,
      color: 'purple'
    },
    {
      id: 'alertas',
      nombre: 'Alertas Académicas',
      descripcion: 'Estudiantes que requieren atención prioritaria por bajo rendimiento.',
      icono: IconAlert,
      color: 'amber'
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

  const generarReporteCasos = async () => {
    setGenerando(true);
    try {
      const stats = {
        'Orientador': `${user?.nombre} ${user?.apellidos || ''}`,
        'Período': periodoSeleccionado,
        'Fecha del Reporte': new Date().toLocaleDateString('es-CO'),
        '': '',
        'CASOS DE ACOMPAÑAMIENTO': '',
        'Total Casos Activos': 'Pendiente de API',
        'Casos Cerrados': 'Pendiente de API',
        'Casos Críticos': 'Pendiente de API',
        ' ': '',
        'SEGUIMIENTO': '',
        'Estudiantes en Seguimiento': 'Pendiente de API',
        'Familias Contactadas': 'Pendiente de API',
        'Reuniones Realizadas': 'Pendiente de API'
      };

      exportEstadisticasToPDF(
        stats,
        `Reporte_Casos_Orientador_${periodoSeleccionado}`,
        'Reporte de Casos de Acompañamiento - Orientación'
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteEstudiantes = async () => {
    setGenerando(true);
    try {
      // TODO: Obtener datos reales del backend
      const data = [
        {
          'Estudiante': 'Pendiente de API',
          'Grado': '-',
          'Tipo de Atención': '-',
          'Estado': '-',
          'Última Sesión': '-'
        }
      ];

      exportToExcel(
        data,
        `Reporte_Estudiantes_Orientador_${periodoSeleccionado}`,
        'Estudiantes Atendidos'
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteParticipacion = async () => {
    setGenerando(true);
    try {
      const stats = {
        'Orientador': `${user?.nombre} ${user?.apellidos || ''}`,
        'Período': periodoSeleccionado,
        'Fecha del Reporte': new Date().toLocaleDateString('es-CO'),
        '': '',
        'PARTICIPACIÓN FAMILIAR': '',
        'Familias Contactadas': 'Pendiente de API',
        'Familias Activas': 'Pendiente de API',
        'Tasa de Respuesta': 'Pendiente de API',
        ' ': '',
        'ACTIVIDADES': '',
        'Talleres Realizados': 'Pendiente de API',
        'Asistencia Promedio': 'Pendiente de API',
        'Satisfacción': 'Pendiente de API'
      };

      exportEstadisticasToPDF(
        stats,
        `Reporte_Participacion_Orientador_${periodoSeleccionado}`,
        'Reporte de Participación Familiar - Orientación'
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteAlertas = async () => {
    setGenerando(true);
    try {
      // TODO: Obtener datos reales del backend
      const data = [
        {
          'Estudiante': 'Pendiente de API',
          'Grado': '-',
          'Tipo de Alerta': '-',
          'Nivel': '-',
          'Acciones Tomadas': '-'
        }
      ];

      exportToExcel(
        data,
        `Reporte_Alertas_Orientador_${periodoSeleccionado}`,
        'Alertas Académicas'
      );
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarReporte = async (tipo: TipoReporte) => {
    setReporteSeleccionado(tipo);
    switch (tipo) {
      case 'casos':
        await generarReporteCasos();
        break;
      case 'estudiantes':
        await generarReporteEstudiantes();
        break;
      case 'participacion':
        await generarReporteParticipacion();
        break;
      case 'alertas':
        await generarReporteAlertas();
        break;
    }
    setReporteSeleccionado(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 animate-pulse">Cargando reportes de orientación...</p>
        </div>
      </DashboardLayout>
    );
  }

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    rose: { bg: 'from-rose-50 to-rose-100/50', border: 'border-rose-200 hover:border-rose-400', text: 'text-rose-600', icon: 'bg-rose-500' },
    blue: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600', icon: 'bg-blue-500' },
    purple: { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600', icon: 'bg-purple-500' },
    amber: { bg: 'from-amber-50 to-amber-100/50', border: 'border-amber-200 hover:border-amber-400', text: 'text-amber-600', icon: 'bg-amber-500' }
  };

  return (
    <DashboardLayout>
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
                <p className="text-rose-100 mt-1">
                  Seguimiento y acompañamiento familiar
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={periodoSeleccionado}
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-xl font-medium border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
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
              <div className="p-2 bg-rose-100 rounded-lg">
                <IconHeart className="text-rose-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">-</p>
                <p className="text-xs text-slate-500">Casos Activos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconUsers className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">-</p>
                <p className="text-xs text-slate-500">Estudiantes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IconGraduationCap className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">-</p>
                <p className="text-xs text-slate-500">Familias</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <IconAlert className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">-</p>
                <p className="text-xs text-slate-500">Alertas</p>
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

        {/* Nota sobre endpoints pendientes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <IconAlert className="text-amber-600 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900">Endpoints en desarrollo</h3>
              <p className="text-sm text-amber-700 mt-1">
                Los reportes de orientador están listos en el frontend. Los endpoints del backend están pendientes de implementación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
