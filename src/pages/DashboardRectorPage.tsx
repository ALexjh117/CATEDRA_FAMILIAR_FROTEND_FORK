import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, getEstadisticasRector, getMiInstitucion, getInstitucionById } from '../api/endpoints';
import apiClient from '../api/apiClient';
import { type Usuario, type Institucion } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PageLoading, StatsCardSkeleton, ButtonLoading } from '../components/ui/LoadingStates';
import { ErrorState, EmptyState } from '../components/ui/ErrorStates';
import { exportToExcel, exportToPDF, exportEstadisticasToPDF } from '../utils/exportUtils';
import RectorDashboardEnhanced from '../components/rector/RectorDashboardEnhanced';
import {
  IconUsers,
  IconTrendingUp,
  IconDownload,
  IconInstitution,
  IconShield,
  IconBarChart,
  IconArrowRight,
  IconBook,
  IconGraduationCap,
  IconRefresh,
  IconInfo
} from '../components/ui/Icons';

export default function DashboardRectorPage() {
  const session = getSession();
  const user = session?.user;
  const navigate = useNavigate();
  
  const [useEnhanced, setUseEnhanced] = useState(true); // Por defecto usar versión mejorada

  // Si useEnhanced es true, mostrar el dashboard mejorado
  if (useEnhanced) {
    return <RectorDashboardEnhanced />;
  }
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [miInstitucion, setMiInstitucion] = useState<Institucion | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validar sesión
      if (!session || !user) {
        throw new Error('Sesión no válida o expirada');
      }

      // Cargar la institución del rector primero
      let institucionRector: Institucion | null = null;
      
      if (user?.institucionId) {
        try {
          institucionRector = await getMiInstitucion();
          if (!institucionRector) {
            institucionRector = await getInstitucionById(user.institucionId);
          }
          
          // Validar que la institución se cargó correctamente
          if (!institucionRector) {
            throw new Error('No se pudo cargar la información de la institución');
          }
          
          setMiInstitucion(institucionRector);
        } catch (instError) {
          console.error('Error cargando institución:', instError);
          throw new Error('Error al cargar datos de la institución');
        }
      } else {
        throw new Error('El rector debe estar asignado a una institución');
      }

      // Usar endpoints específicos del rector
      const [estadisticasData, coordinadoresRes, orientadoresRes, docentesRes, cursosRes] = await Promise.all([
        getEstadisticasRector(),
        apiClient.getCoordinadoresRector(),
        apiClient.getOrientadoresRector(),
        apiClient.getDocentesRector(),
        apiClient.getCursosRector()
      ]);

      // Validar y procesar estadísticas
      if (!estadisticasData) {
        throw new Error('No se pudieron cargar las estadísticas');
      }
      setEstadisticas(estadisticasData);
      
      // Procesar usuarios con validación
      const todosUsuarios: Usuario[] = [];
      
      if (coordinadoresRes?.success && Array.isArray(coordinadoresRes.data)) {
        coordinadoresRes.data.forEach((c: any) => {
          if (c && typeof c === 'object') {
            todosUsuarios.push({
              id: c.usuarioId || c.id || Math.random().toString(),
              nombre: c.nombre || '',
              apellidos: c.apellido || '',
              correo: c.correo || '',
              telefono: c.telefono || '',
              rol: 'coordinador',
              activo: c.estaActivo ?? false,
              institucionId: c.institucionId
            } as Usuario);
          }
        });
      }
      
      if (orientadoresRes?.success && Array.isArray(orientadoresRes.data)) {
        orientadoresRes.data.forEach((o: any) => {
          if (o && typeof o === 'object') {
            todosUsuarios.push({
              id: o.usuarioId || o.id || Math.random().toString(),
              nombre: o.nombre || '',
              apellidos: o.apellido || '',
              correo: o.correo || '',
              telefono: o.telefono || '',
              rol: 'orientador',
              activo: o.estaActivo ?? false,
              institucionId: o.institucionId
            } as Usuario);
          }
        });
      }
      
      if (docentesRes?.success && Array.isArray(docentesRes.data)) {
        docentesRes.data.forEach((d: any) => {
          if (d && typeof d === 'object') {
            todosUsuarios.push({
              id: d.usuarioId || d.id || Math.random().toString(),
              nombre: d.nombres || d.nombre || '',
              apellidos: d.apellidos || d.apellido || '',
              correo: d.correo || '',
              telefono: d.telefono || '',
              rol: 'docente_aula',
              activo: d.estaActivo ?? false,
              institucionId: d.institucionId
            } as Usuario);
          }
        });
      }
      
      setUsuarios(todosUsuarios);
      
      // Establecer la institución del rector
      if (institucionRector) {
        setInstituciones([institucionRector]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = () => {
    loadData();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Cargando panel de rectoría..." />
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

  // Estadísticas - Ahora usando datos del backend
  const stats = {
    totalInstituciones: instituciones.length,
    institucionesActivas: instituciones.filter(i => i.activo).length,
    
    // Personal directivo (datos del backend)
    totalCoordinadores: estadisticas?.totalCoordinadores ?? usuarios.filter(u => u.rol === 'coordinador').length,
    coordinadoresActivos: estadisticas?.coordinadoresActivos ?? usuarios.filter(u => u.rol === 'coordinador' && u.activo).length,
    totalOrientadores: estadisticas?.totalOrientadores ?? usuarios.filter(u => u.rol === 'orientador').length,
    orientadoresActivos: estadisticas?.orientadoresActivos ?? usuarios.filter(u => u.rol === 'orientador' && u.activo).length,
    totalDocentes: estadisticas?.totalDocentes ?? usuarios.filter(u => u.rol === 'docente_aula').length,
    docentesActivos: estadisticas?.docentesActivos ?? usuarios.filter(u => u.rol === 'docente_aula' && u.activo).length,
    
    // Académicos (nuevos del backend)
    totalCursos: estadisticas?.totalCursos ?? 0,
    totalEstudiantes: estadisticas?.totalEstudiantes ?? 0,
    
    // Totales calculados
    totalDirectivos: (estadisticas?.totalCoordinadores ?? 0) + (estadisticas?.totalOrientadores ?? 0) || 
                     usuarios.filter(u => ['coordinador', 'orientador'].includes(u.rol)).length,
    directivosActivos: (estadisticas?.coordinadoresActivos ?? 0) + (estadisticas?.orientadoresActivos ?? 0) ||
                       usuarios.filter(u => ['coordinador', 'orientador'].includes(u.rol) && u.activo).length,
    
    tasaActivacion: estadisticas?.tasaActivacion ?? (
      usuarios.filter(u => ['coordinador', 'orientador'].includes(u.rol)).length > 0 
        ? Math.round((usuarios.filter(u => ['coordinador', 'orientador'].includes(u.rol) && u.activo).length / 
                     usuarios.filter(u => ['coordinador', 'orientador'].includes(u.rol)).length) * 100) 
        : 0
    ),
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header con diseño distintivo de Rectoría */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 rounded-2xl p-8 text-white shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-500/15 to-transparent rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/40 ring-4 ring-white/10">
                <IconShield className="text-white" size={32} />
              </div>
              <div>
                <p className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-1">
                  Panel de Rectoría
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Bienvenido, {user?.nombre}
                </h1>
                <p className="text-indigo-200 mt-1">
                  {miInstitucion ? (
                    <>
                      <span className="font-semibold">{miInstitucion.nombre}</span>
                      {miInstitucion.municipio && <span className="text-indigo-300"> • {miInstitucion.municipio}</span>}
                    </>
                  ) : (
                    'Gestión estratégica de directivos e instituciones'
                  )}
                </p>
              </div>
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/directivos')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center gap-2 backdrop-blur-sm border border-white/10"
              >
                <IconUsers size={18} />
                Ver Directivos
              </button>
              <button 
                onClick={() => exportEstadisticasToPDF(
                  stats,
                  `Reporte_Rectoria_${new Date().toISOString().split('T')[0]}`,
                  'Reporte Ejecutivo - Rectoría'
                )}
                className="px-4 py-2.5 bg-purple-500/50 hover:bg-purple-500/70 text-white rounded-xl font-medium transition-all flex items-center gap-2 backdrop-blur-sm border border-purple-400/30"
              >
                <IconDownload size={18} />
                Reporte Ejecutivo
              </button>
            </div>
          </div>
        </div>

        {/* Stats principales - Solo directivos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-indigo-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform">
                <IconInstitution className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                {stats.institucionesActivas} activas
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats.totalInstituciones}</div>
            <div className="text-sm text-slate-500 font-medium">Instituciones</div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-purple-300 cursor-pointer" onClick={() => navigate('/directivos')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200/50 group-hover:scale-110 transition-transform">
                <IconShield className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                {stats.totalCoordinadores} coord.
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats.totalDirectivos}</div>
            <div className="text-sm text-slate-500 font-medium">Directivos Totales</div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-teal-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:scale-110 transition-transform">
                <IconUsers className="text-white" size={22} />
              </div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                {stats.totalOrientadores} orient.
              </span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats.directivosActivos}</div>
            <div className="text-sm text-slate-500 font-medium">Directivos Activos</div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-slate-100 hover:border-emerald-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform">
                <IconTrendingUp className="text-white" size={22} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800 mb-1">{stats.tasaActivacion}%</div>
            <div className="text-sm text-slate-500 font-medium">Tasa Activación</div>
          </div>
        </div>

        {/* Stats secundarios - Docentes, Cursos y Estudiantes */}
        <div className="grid grid-cols-3 gap-4">
          <div className="group bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-5 border border-orange-200 hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200/50">
                <IconUsers className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalDocentes}</div>
                <div className="text-sm text-slate-500 font-medium">Docentes</div>
              </div>
              <div className="ml-auto text-xs font-semibold text-orange-600 bg-white/60 px-2 py-1 rounded-full">
                {stats.docentesActivos} activos
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200 hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
                <IconBook className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalCursos}</div>
                <div className="text-sm text-slate-500 font-medium">Cursos</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl p-5 border border-pink-200 hover:shadow-lg transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-200/50">
                <IconGraduationCap className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalEstudiantes}</div>
                <div className="text-sm text-slate-500 font-medium">Estudiantes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Panel de Directivos */}
          <div 
            onClick={() => navigate('/directivos')}
            className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <IconShield className="text-white" size={24} />
              </div>
              <IconArrowRight className="text-purple-400 group-hover:translate-x-1 transition-transform" size={20} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Gestión de Directivos</h3>
            <p className="text-sm text-gray-600 mb-4">Administra coordinadores y orientadores de tu institución</p>
            <div className="flex gap-4 text-sm">
              <div className="bg-white/60 rounded-lg px-3 py-2">
                <span className="font-bold text-purple-600">{stats.totalCoordinadores}</span>
                <span className="text-gray-500 ml-1">Coordinadores</span>
              </div>
              <div className="bg-white/60 rounded-lg px-3 py-2">
                <span className="font-bold text-teal-600">{stats.totalOrientadores}</span>
                <span className="text-gray-500 ml-1">Orientadores</span>
              </div>
            </div>
          </div>

          {/* Panel de Reportes */}
          <div 
            className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <IconBarChart className="text-white" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Reportes Ejecutivos</h3>
            <p className="text-sm text-gray-600 mb-4">Genera informes de gestión institucional</p>
            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  exportEstadisticasToPDF(stats, 'Reporte_Ejecutivo', 'Reporte Ejecutivo de Rectoría');
                }}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
              >
                <IconDownload size={14} />
                PDF
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const data = instituciones.map(inst => ({
                    'Institución': inst.nombre,
                    'Código DANE': inst.codigo_dane || '-',
                    'Coordinadores': usuarios.filter(u => u.institucionId === inst.id && u.rol === 'coordinador').length,
                    'Orientadores': usuarios.filter(u => u.institucionId === inst.id && u.rol === 'orientador').length,
                    'Estado': inst.activo ? 'Activa' : 'Inactiva'
                  }));
                  exportToExcel(data, 'Reporte_Instituciones', 'Instituciones');
                }}
                className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-1"
              >
                <IconDownload size={14} />
                Excel
              </button>
            </div>
          </div>

          {/* Panel de Instituciones */}
          <div 
            className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-600 rounded-xl">
                <IconInstitution className="text-white" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Instituciones</h3>
            <p className="text-sm text-gray-600 mb-4">Vista general de instituciones bajo supervisión</p>
            <div className="bg-white/60 rounded-lg px-3 py-2 text-sm">
              <span className="font-bold text-slate-600">{stats.institucionesActivas}</span>
              <span className="text-gray-500 ml-1">de {stats.totalInstituciones} activas</span>
            </div>
          </div>
        </div>

        {/* Listado de Instituciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Instituciones Bajo Supervisión</h3>
              <p className="text-sm text-slate-500 mt-1">Vista general de directivos por institución</p>
            </div>
            <button
              onClick={() => {
                const data = instituciones.map(inst => ({
                  'Código DANE': inst.codigo_dane || '-',
                  'Institución': inst.nombre,
                  'Naturaleza': inst.naturaleza,
                  'Coordinadores': usuarios.filter(u => u.institucionId === inst.id && u.rol === 'coordinador').length,
                  'Orientadores': usuarios.filter(u => u.institucionId === inst.id && u.rol === 'orientador').length,
                  'Estado': inst.activo ? 'Activa' : 'Inactiva'
                }));
                exportToExcel(data, 'Instituciones_Rectoria', 'Instituciones');
              }}
              className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2"
            >
              <IconDownload size={14} />
              Exportar
            </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {instituciones.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <IconInstitution className="mx-auto mb-3 text-slate-300" size={48} />
                <p>No hay instituciones registradas</p>
              </div>
            ) : (
              instituciones.map(inst => {
                const coordinadores = usuarios.filter(u => u.institucionId === inst.id && u.rol === 'coordinador');
                const orientadores = usuarios.filter(u => u.institucionId === inst.id && u.rol === 'orientador');
                
                return (
                  <div key={inst.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-800">{inst.nombre}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            inst.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {inst.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Código DANE: {inst.codigo_dane || 'N/A'}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-purple-600">{coordinadores.length}</div>
                          <div className="text-gray-500 text-xs">Coordinadores</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-teal-600">{orientadores.length}</div>
                          <div className="text-gray-500 text-xs">Orientadores</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-slate-700">{coordinadores.length + orientadores.length}</div>
                          <div className="text-gray-500 text-xs">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}