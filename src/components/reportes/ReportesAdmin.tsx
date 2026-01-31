import { useState, useEffect } from 'react';
import { getSession } from '../../api/endpoints';
import apiClient from '../../api/apiClient';
import DashboardLayout from '../DashboardLayout';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { PageLoading, StatsCardSkeleton, ChartSkeleton, ButtonLoading } from '../ui/LoadingStates';
import { ErrorState, EmptyState } from '../ui/ErrorStates';
import { exportToExcel, exportEstadisticasToPDF } from '../../utils/exportUtils';
import DashboardCharts from '../charts/DashboardCharts';
import {
  IconDownload,
  IconBarChart,
  IconInstitution,
  IconUsers,
  IconTrendingUp,
  IconFileText,
  IconRefresh
} from '../ui/Icons';

type TipoReporte = 'sistema' | 'instituciones' | 'usuarios' | 'actividad';

interface ReporteConfig {
  id: TipoReporte;
  nombre: string;
  descripcion: string;
  icono: React.ComponentType<any>;
  color: string;
}

export default function ReportesAdmin() {
  const session = getSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generando, setGenerando] = useState<string | null>(null);
  const [instituciones, setInstituciones] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('2026-1');
  const [reporteSeleccionado, setReporteSeleccionado] = useState<TipoReporte | null>(null);

  const tiposReporte: ReporteConfig[] = [
    {
      id: 'sistema',
      nombre: 'Reporte Global del Sistema',
      descripcion: 'Estadísticas generales de toda la plataforma Cátedra de Familia.',
      icono: IconBarChart,
      color: 'indigo'
    },
    {
      id: 'instituciones',
      nombre: 'Reporte de Instituciones',
      descripcion: 'Estado y métricas de todas las instituciones registradas.',
      icono: IconInstitution,
      color: 'blue'
    },
    {
      id: 'usuarios',
      nombre: 'Reporte de Usuarios por Rol',
      descripcion: 'Distribución y estado de usuarios según su rol en el sistema.',
      icono: IconUsers,
      color: 'purple'
    },
    {
      id: 'actividad',
      nombre: 'Reporte de Actividad del Sistema',
      descripcion: 'Análisis de uso y actividad de la plataforma.',
      icono: IconTrendingUp,
      color: 'emerald'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [instRes, usersRes] = await Promise.all([
        apiClient.getInstituciones(),
        apiClient.getUsuarios()
      ]);

      if (instRes.success && instRes.data) {
        setInstituciones(Array.isArray(instRes.data) ? instRes.data : []);
      } else {
        throw new Error('Error al cargar instituciones');
      }

      if (usersRes.success && usersRes.data) {
        setUsuarios(Array.isArray(usersRes.data) ? usersRes.data : []);
      } else {
        throw new Error('Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = () => {
    loadData();
  };

  const generarReporteSistema = async () => {
    setGenerando('sistema');
    try {
      const stats = {
        'PLATAFORMA CÁTEDRA DE FAMILIA': '',
        'Fecha del Reporte': new Date().toLocaleDateString('es-CO'),
        'Período': periodoSeleccionado,
        '': '',
        'INSTITUCIONES': '',
        'Total Instituciones': instituciones.length,
        'Instituciones Activas': instituciones.filter(i => i.activa).length,
        'Instituciones Pendientes': instituciones.filter(i => !i.activa).length,
        ' ': '',
        'USUARIOS': '',
        'Total Usuarios': usuarios.length,
        'Usuarios Activos': usuarios.filter(u => u.activo).length,
        'Rectores': usuarios.filter(u => u.rol === 'rector').length,
        'Coordinadores': usuarios.filter(u => u.rol === 'coordinador').length,
        'Orientadores': usuarios.filter(u => u.rol === 'orientador').length,
        'Docentes': usuarios.filter(u => u.rol === 'docente_aula' || u.rol === 'docente').length,
        '  ': '',
        'COBERTURA': '',
        'Departamentos': new Set(instituciones.map(i => i.departamentoId)).size,
        'Municipios': new Set(instituciones.map(i => i.municipioId)).size
      };

      exportEstadisticasToPDF(
        stats,
        `Reporte_Global_Sistema_${periodoSeleccionado}`,
        'Reporte Global del Sistema - Cátedra de Familia'
      );
    } finally {
      setGenerando(null);
    }
  };

  const generarReporteInstituciones = async () => {
    setGenerando('instituciones');
    try {
      const data = instituciones.map(inst => ({
        'Nombre': inst.nombre,
        'Código DANE': inst.codigoDane || 'N/A',
        'Departamento': inst.departamento?.nombre || 'N/A',
        'Municipio': inst.municipio?.nombre || 'N/A',
        'Rector': inst.rector ? `${inst.rector.nombre} ${inst.rector.apellidos}` : 'Sin asignar',
        'Estado': inst.activa ? 'Activa' : 'Inactiva',
        'Fecha Registro': inst.fechaCreacion ? new Date(inst.fechaCreacion).toLocaleDateString('es-CO') : 'N/A'
      }));

      if (data.length === 0) {
        data.push({
          'Nombre': 'Sin instituciones registradas',
          'Código DANE': '-',
          'Departamento': '-',
          'Municipio': '-',
          'Rector': '-',
          'Estado': '-',
          'Fecha Registro': '-'
        });
      }

      exportToExcel(
        data,
        `Reporte_Instituciones_Admin_${periodoSeleccionado}`,
        'Instituciones'
      );
    } finally {
      setGenerando(null);
    }
  };

  const generarReporteUsuarios = async () => {
    setGenerando('usuarios');
    try {
      const data = usuarios.map(user => ({
        'Nombre': `${user.nombre} ${user.apellidos || ''}`,
        'Correo': user.correo,
        'Rol': user.rol === 'admin_sistema' ? 'Admin Sistema' :
               user.rol === 'rector' ? 'Rector' :
               user.rol === 'coordinador' ? 'Coordinador' :
               user.rol === 'orientador' ? 'Orientador' :
               user.rol === 'docente_aula' || user.rol === 'docente' ? 'Docente' :
               user.rol === 'acudiente' ? 'Acudiente' : user.rol,
        'Institución': user.institucionId || 'N/A',
        'Estado': user.activo ? 'Activo' : 'Inactivo',
        'Debe Cambiar Contraseña': user.debe_cambiar_contrasena ? 'Sí' : 'No'
      }));

      if (data.length === 0) {
        data.push({
          'Nombre': 'Sin usuarios registrados',
          'Correo': '-',
          'Rol': '-',
          'Institución': '-',
          'Estado': '-',
          'Debe Cambiar Contraseña': '-'
        });
      }

      exportToExcel(
        data,
        `Reporte_Usuarios_Admin_${periodoSeleccionado}`,
        'Usuarios por Rol'
      );
    } finally {
      setGenerando(null);
    }
  };

  const generarReporteActividad = async () => {
    setGenerando('actividad');
    try {
      const stats = {
        'ACTIVIDAD DEL SISTEMA': '',
        'Fecha del Reporte': new Date().toLocaleDateString('es-CO'),
        'Período': periodoSeleccionado,
        '': '',
        'USUARIOS ACTIVOS': '',
        'Total Usuarios Activos': usuarios.filter(u => u.activo).length,
        'Usuarios Inactivos': usuarios.filter(u => !u.activo).length,
        'Tasa de Activación': usuarios.length > 0 
          ? `${((usuarios.filter(u => u.activo).length / usuarios.length) * 100).toFixed(1)}%`
          : 'N/A',
        ' ': '',
        'DISTRIBUCIÓN POR ROL': '',
        'Administradores': usuarios.filter(u => u.rol === 'admin_sistema' || u.rol === 'admin').length,
        'Rectores': usuarios.filter(u => u.rol === 'rector').length,
        'Coordinadores': usuarios.filter(u => u.rol === 'coordinador').length,
        'Orientadores': usuarios.filter(u => u.rol === 'orientador').length,
        'Docentes': usuarios.filter(u => u.rol === 'docente_aula' || u.rol === 'docente').length,
        'Acudientes': usuarios.filter(u => u.rol === 'acudiente').length,
        '  ': '',
        'INSTITUCIONES': '',
        'Instituciones Activas': instituciones.filter(i => i.activa).length,
        'Instituciones Pendientes': instituciones.filter(i => !i.activa).length
      };

      exportEstadisticasToPDF(
        stats,
        `Reporte_Actividad_Sistema_${periodoSeleccionado}`,
        'Reporte de Actividad del Sistema'
      );
    } finally {
      setGenerando(null);
    }
  };

  const handleGenerarReporte = async (tipo: TipoReporte) => {
    setReporteSeleccionado(tipo);
    switch (tipo) {
      case 'sistema':
        await generarReporteSistema();
        break;
      case 'instituciones':
        await generarReporteInstituciones();
        break;
      case 'usuarios':
        await generarReporteUsuarios();
        break;
      case 'actividad':
        await generarReporteActividad();
        break;
    }
    setReporteSeleccionado(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Cargando reportes del sistema..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState message={error} onRetry={retryLoad} />
      </DashboardLayout>
    );
  }

  const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    indigo: { bg: 'from-indigo-50 to-indigo-100/50', border: 'border-indigo-200 hover:border-indigo-400', text: 'text-indigo-600', icon: 'bg-indigo-500' },
    blue: { bg: 'from-blue-50 to-blue-100/50', border: 'border-blue-200 hover:border-blue-400', text: 'text-blue-600', icon: 'bg-blue-500' },
    purple: { bg: 'from-purple-50 to-purple-100/50', border: 'border-purple-200 hover:border-purple-400', text: 'text-purple-600', icon: 'bg-purple-500' },
    emerald: { bg: 'from-emerald-50 to-emerald-100/50', border: 'border-emerald-200 hover:border-emerald-400', text: 'text-emerald-600', icon: 'bg-emerald-500' }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 ring-4 ring-white/10">
                <IconBarChart className="text-white" size={32} />
              </div>
              <div>
                <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-1">
                  Administración del Sistema
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Reportes Globales
                </h1>
                <p className="text-indigo-100 mt-1">
                  Estadísticas y análisis de toda la plataforma
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={periodoSeleccionado}
                onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-xl font-medium border border-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))
          ) : (
            <>
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <IconInstitution className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{instituciones.length}</p>
                    <p className="text-xs text-slate-500">Instituciones</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconUsers className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{usuarios.length}</p>
                    <p className="text-xs text-slate-500">Usuarios</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <IconTrendingUp className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {usuarios.filter(u => u.activo).length}
                    </p>
                    <p className="text-xs text-slate-500">Activos</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <IconFileText className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {new Set(instituciones.map(i => i.departamentoId)).size}
                    </p>
                    <p className="text-xs text-slate-500">Departamentos</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts Estadísticos */}
        <ErrorBoundary>
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <ChartSkeleton key={index} />
              ))}
            </div>
          ) : (
            <DashboardCharts instituciones={instituciones} usuarios={usuarios} />
          )}
        </ErrorBoundary>

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
                    <ButtonLoading
                      loading={generando === reporte.id}
                      className={`px-3 py-1.5 ${colors.icon} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50`}
                    >
                      <IconDownload size={14} />
                      {generando === reporte.id ? 'Generando...' : 'Generar'}
                    </ButtonLoading>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
