import { useState, useEffect } from 'react';
import { getSession, getMiInstitucion, getDirectivosInstitucion } from '../../api/endpoints';
import apiClient from '../../api/apiClient';
import { type Institucion } from '../../mocks/data';
import DashboardLayout from '../DashboardLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import { exportToExcel, exportToPDF, exportEstadisticasToPDF } from '../../utils/exportUtils';
import {
  IconDownload,
  IconBarChart,
  IconUsers,
  IconShield,
  IconBook,
  IconGraduationCap,
  IconFileText,
  IconCheckCircle,
  IconTrendingUp
} from '../ui/Icons';

type TipoReporte = 'ejecutivo' | 'directivos' | 'docentes' | 'academico' | 'participacion';

interface ReporteConfig {
  id: TipoReporte;
  nombre: string;
  descripcion: string;
  icono: React.ComponentType<any>;
  color: string;
}

export default function ReportesRector() {
  const session = getSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [directivos, setDirectivos] = useState<{ coordinadores: any[]; orientadores: any[] }>({ coordinadores: [], orientadores: [] });
  const [docentes, setDocentes] = useState<any[]>([]);
  
  const [fechaInicio, setFechaInicio] = useState(() => {
    const y = new Date().getFullYear();
    const d = new Date(y, 0, 1);
    return d.toISOString().slice(0, 10);
  });
  const [fechaFin, setFechaFin] = useState(() => {
    const y = new Date().getFullYear();
    const d = new Date(y, 11, 31);
    return d.toISOString().slice(0, 10);
  });
  const [reporteSeleccionado, setReporteSeleccionado] = useState<TipoReporte | null>(null);

  const tiposReporte: ReporteConfig[] = [
    {
      id: 'ejecutivo',
      nombre: 'Reporte Ejecutivo',
      descripcion: 'Resumen general de la gestión institucional con indicadores clave de rendimiento.',
      icono: IconBarChart,
      color: 'indigo'
    },
    {
      id: 'directivos',
      nombre: 'Reporte de Directivos',
      descripcion: 'Estado y gestión de coordinadores y orientadores de la institución.',
      icono: IconShield,
      color: 'purple'
    },
    {
      id: 'docentes',
      nombre: 'Reporte de Docentes',
      descripcion: 'Desempeño del cuerpo docente, asignación de tareas y seguimiento.',
      icono: IconUsers,
      color: 'teal'
    },
    {
      id: 'academico',
      nombre: 'Reporte Académico',
      descripcion: 'Rendimiento académico por cursos, grados y áreas de conocimiento.',
      icono: IconBook,
      color: 'blue'
    },
    {
      id: 'participacion',
      nombre: 'Reporte de Participación',
      descripcion: 'Participación de familias en las actividades del programa Cátedra de Familia.',
      icono: IconGraduationCap,
      color: 'pink'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [estadisticasRes, inst] = await Promise.all([
        apiClient.getEstadisticasRector(),
        getMiInstitucion()
      ]);

      if (estadisticasRes.success) {
        setEstadisticas(estadisticasRes.data);
      }

      setInstitucion(inst);
      
      if (inst?.id) {
        const [directivosData, docentesRes] = await Promise.all([
          getDirectivosInstitucion(inst.id),
          apiClient.getDocentesRector()
        ]);
        
        setDirectivos(directivosData || { coordinadores: [], orientadores: [] });
        
        if (docentesRes.success && docentesRes.data) {
          setDocentes(docentesRes.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarReporteEjecutivo = async () => {
    setGenerando(true);
    try {
      const stats = {
        'Institución': institucion?.nombre || 'N/A',
        'Rango del Reporte': `${fechaInicio} a ${fechaFin}`,
        'Fecha del Reporte': new Date().toLocaleDateString('es-CO'),
        '': '',
        'PERSONAL DIRECTIVO': '',
        'Total Coordinadores': estadisticas?.totalCoordinadores || 0,
        'Coordinadores Activos': estadisticas?.coordinadoresActivos || 0,
        'Total Orientadores': estadisticas?.totalOrientadores || 0,
        'Orientadores Activos': estadisticas?.orientadoresActivos || 0,
        ' ': '',
        'PLANTA DOCENTE': '',
        'Total Docentes': estadisticas?.totalDocentes || 0,
        'Docentes Activos': estadisticas?.docentesActivos || 0,
        '  ': '',
        'DATOS ACADÉMICOS': '',
        'Total Cursos': estadisticas?.totalCursos || 0,
        'Total Estudiantes': estadisticas?.totalEstudiantes || 0,
        '   ': '',
        'INDICADORES': '',
        'Tasa de Activación (%)': estadisticas?.tasaActivacion || 0
      };

      exportEstadisticasToPDF(
        stats,
        `Reporte_Ejecutivo_Rector_${institucion?.nombre?.replace(/\s+/g, '_') || 'Institucion'}_${fechaInicio}_a_${fechaFin}`,
        `Reporte Ejecutivo - ${institucion?.nombre || 'Institución'}`
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteDirectivos = async () => {
    setGenerando(true);
    try {
      const coordinadoresArray = Array.isArray(directivos?.coordinadores) ? directivos.coordinadores : [];
      const orientadoresArray = Array.isArray(directivos?.orientadores) ? directivos.orientadores : [];
      
      const coordinadoresData = coordinadoresArray.map(c => ({
        'Tipo': 'Coordinador',
        'Nombre': `${c.nombre} ${c.apellido}`,
        'Teléfono': c.telefono || 'N/A',
        'Estado': c.activo ? 'Activo' : 'Inactivo'
      }));

      const orientadoresData = orientadoresArray.map(o => ({
        'Tipo': 'Orientador',
        'Nombre': `${o.nombre} ${o.apellido}`,
        'Teléfono': o.telefono || 'N/A',
        'Estado': o.activo ? 'Activo' : 'Inactivo'
      }));

      const data = [...coordinadoresData, ...orientadoresData];

      if (data.length === 0) {
        data.push({
          'Tipo': '-',
          'Nombre': 'Sin directivos registrados',
          'Teléfono': '-',
          'Estado': '-'
        });
      }

      exportToExcel(
        data,
        `Reporte_Directivos_Rector_${institucion?.nombre?.replace(/\s+/g, '_') || 'Institucion'}_${fechaInicio}_a_${fechaFin}`,
        'Directivos'
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteDocentes = async () => {
    setGenerando(true);
    try {
      const data = docentes.map(d => ({
        'Nombre': `${d.nombres || d.nombre} ${d.apellidos || d.apellido}`,
        'Correo': d.correo,
        'Teléfono': d.telefono || 'N/A',
        'Estado': d.estaActivo ? 'Activo' : 'Inactivo',
        'Perfil Completo': d.tienePerfilCompleto ? 'Sí' : 'No'
      }));

      if (data.length === 0) {
        data.push({
          'Nombre': 'Sin docentes registrados',
          'Correo': '-',
          'Teléfono': '-',
          'Estado': '-',
          'Perfil Completo': '-'
        });
      }

      exportToExcel(
        data,
        `Reporte_Docentes_Rector_${institucion?.nombre?.replace(/\s+/g, '_') || 'Institucion'}_${fechaInicio}_a_${fechaFin}`,
        'Docentes'
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteAcademico = async () => {
    setGenerando(true);
    try {
      const stats = {
        'Institución': institucion?.nombre || 'N/A',
        'Período Académico': periodoSeleccionado,
        'Fecha Generación': new Date().toLocaleDateString('es-CO'),
        '': '',
        'RESUMEN ACADÉMICO': '',
        'Total Cursos Activos': estadisticas?.totalCursos || 0,
        'Total Estudiantes Matriculados': estadisticas?.totalEstudiantes || 0,
        'Docentes Asignados': estadisticas?.totalDocentes || 0,
        ' ': '',
        'PROGRAMA CÁTEDRA DE FAMILIA': '',
        'Tareas Asignadas': 'Pendiente de API',
        'Promedio de Entregas': 'Pendiente de API',
        'Familias Participantes': 'Pendiente de API'
      };

      exportEstadisticasToPDF(
        stats,
        `Reporte_Academico_Rector_${institucion?.nombre?.replace(/\s+/g, '_') || 'Institucion'}_${fechaInicio}_a_${fechaFin}`,
        `Reporte Académico - ${institucion?.nombre || 'Institución'}`
      );
    } finally {
      setGenerando(false);
    }
  };

  const generarReporteParticipacion = async () => {
    setGenerando(true);
    try {
      const stats = {
        'Institución': institucion?.nombre || 'N/A',
        'Período': periodoSeleccionado,
        'Rango de Fechas': `${fechaInicio} a ${fechaFin}`,
        '': '',
        'PARTICIPACIÓN FAMILIAR': '',
        'Total Estudiantes': estadisticas?.totalEstudiantes || 0,
        'Familias Registradas': 'Pendiente de API',
        'Familias Activas': 'Pendiente de API',
        'Tasa de Participación': 'Pendiente de API',
        ' ': '',
        'ENTREGAS Y ACTIVIDADES': '',
        'Tareas Enviadas': 'Pendiente de API',
        'Entregas Recibidas': 'Pendiente de API',
        'Promedio de Cumplimiento': 'Pendiente de API'
      };

      exportEstadisticasToPDF(
        stats,
        `Reporte_Participacion_Rector_${institucion?.nombre?.replace(/\s+/g, '_') || 'Institucion'}_${fechaInicio}_a_${fechaFin}`,
        `Reporte de Participación Familiar - ${institucion?.nombre || 'Institución'}`
      );
    } finally {
      setGenerando(false);
    }
  };

  const handleGenerarReporte = async (tipo: TipoReporte) => {
    switch (tipo) {
      case 'ejecutivo':
        await generarReporteEjecutivo();
        break;
      case 'directivos':
        await generarReporteDirectivos();
        break;
      case 'docentes':
        await generarReporteDocentes();
        break;
      case 'academico':
        await generarReporteAcademico();
        break;
      case 'participacion':
        await generarReporteParticipacion();
        break;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 animate-pulse">Cargando reportes del rector...</p>
        </div>
      </DashboardLayout>
    );
  }

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    indigo: { bg: 'from-indigo-50 to-indigo-100/50', border: 'border-indigo-200 hover:border-indigo-400', text: 'text-indigo-600', icon: 'bg-indigo-500' },
    purple: { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600', icon: 'bg-purple-500' },
    teal: { bg: 'from-teal-50 to-teal-100/50', border: 'border-teal-200 hover:border-teal-400', text: 'text-teal-600', icon: 'bg-teal-500' },
    blue: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600', icon: 'bg-blue-500' },
    pink: { bg: 'from-pink-50 to-pink-100/50', border: 'border-pink-200 hover:border-pink-400', text: 'text-pink-600', icon: 'bg-pink-500' }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 rounded-2xl p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/40 ring-4 ring-white/10">
                <IconBarChart className="text-white" size={32} />
              </div>
              <div>
                <p className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-1">
                  Centro de Reportes
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Reportes Institucionales
                </h1>
                {institucion && (
                  <p className="text-indigo-200 mt-1">
                    <span className="font-semibold">{institucion.nombre}</span>
                  </p>
                )}
              </div>
            </div>
            
            
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IconShield className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {(estadisticas?.totalCoordinadores || 0) + (estadisticas?.totalOrientadores || 0)}
                </p>
                <p className="text-xs text-slate-500">Directivos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <IconUsers className="text-teal-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{estadisticas?.totalDocentes || 0}</p>
                <p className="text-xs text-slate-500">Docentes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <IconBook className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{estadisticas?.totalCursos || 0}</p>
                <p className="text-xs text-slate-500">Cursos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <IconGraduationCap className="text-pink-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{estadisticas?.totalEstudiantes || 0}</p>
                <p className="text-xs text-slate-500">Estudiantes</p>
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

          <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* Reportes sugeridos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Reportes Sugeridos</h2>
            <p className="text-sm text-slate-500 mt-1">Informes recomendados para la gestión institucional</p>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              {
                titulo: 'Informe de Gestión Semestral',
                descripcion: 'Consolidado de indicadores para presentar a la Secretaría de Educación',
                icono: IconFileText,
                frecuencia: 'Semestral',
                color: 'indigo'
              },
              {
                titulo: 'Seguimiento a Directivos',
                descripcion: 'Evaluación del desempeño de coordinadores y orientadores',
                icono: IconShield,
                frecuencia: 'Trimestral',
                color: 'purple'
              },
              {
                titulo: 'Cobertura del Programa',
                descripcion: 'Porcentaje de familias participando en Cátedra de Familia',
                icono: IconGraduationCap,
                frecuencia: 'Mensual',
                color: 'pink'
              },
              {
                titulo: 'Cumplimiento de Metas',
                descripcion: 'Estado de los objetivos institucionales del período',
                icono: IconCheckCircle,
                frecuencia: 'Mensual',
                color: 'emerald'
              },
              {
                titulo: 'Análisis de Resultados',
                descripcion: 'Comparativo de rendimiento entre períodos académicos',
                icono: IconTrendingUp,
                frecuencia: 'Anual',
                color: 'blue'
              }
            ].map((item, index) => {
              const IconComponent = item.icono;
              return (
                <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                  <div className={`p-2 bg-${item.color}-100 rounded-lg`}>
                    <IconComponent className={`text-${item.color}-600`} size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.titulo}</h4>
                    <p className="text-sm text-gray-500">{item.descripcion}</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    {item.frecuencia}
                  </span>
                  <button className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-200 transition-all">
                    Generar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
