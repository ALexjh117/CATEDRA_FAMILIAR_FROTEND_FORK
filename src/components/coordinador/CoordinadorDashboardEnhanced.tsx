import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSession, getMiInstitucion, getEstadisticasCoordinador, getCursosCoordinador, getOrientadoresCoordinador } from '../../api/endpoints';
import apiClient from '../../api/apiClient';
import DashboardLayout from '../DashboardLayout';
import { PageLoading, StatsCardSkeleton, ButtonLoading } from '../ui/LoadingStates';
import { ErrorState, EmptyState } from '../ui/ErrorStates';
import {
  IconUsers,
  IconTrendingUp,
  IconClipboard,
  IconBook,
  IconGraduationCap,
  IconArrowRight,
  IconAlertTriangle,
  IconCheck,
  IconInfo,
  IconTarget,
  IconFilter,
  IconCheckCircle,
  IconClock,
  IconBarChart
} from '../ui/Icons';

interface QuickStats {
  totalOrientadores: number;
  orientadoresActivos: number;
  totalEstudiantes: number;
  totalCursos: number;
  totalGrados: number;
  tareasActivas: number;
  tareasCompletadas: number;
  tareasPendientes: number;
  tareasVencidas: number;
  tasaCumplimiento: number;
  orientadoresConTareas: number;
  totalDocentes: number; // Solo para visualización, no gestión directa
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed' | 'overdue';
  dueDate?: string;
  action?: string;
  actionLink?: string;
}

interface InstitutionInfo {
  nombre: string;
  municipio?: string;
  departamento?: string;
  codigoDane?: string;
}

export default function CoordinadorDashboardEnhanced() {
  const session = getSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<QuickStats>({
    totalOrientadores: 0,
    orientadoresActivos: 0,
    totalEstudiantes: 0,
    totalCursos: 0,
    totalGrados: 0,
    tareasActivas: 0,
    tareasCompletadas: 0,
    tareasPendientes: 0,
    tareasVencidas: 0,
    tasaCumplimiento: 0,
    orientadoresConTareas: 0,
    totalDocentes: 0
  });
  const [miInstitucion, setMiInstitucion] = useState<InstitutionInfo | null>(null);
  const [orientadores, setOrientadores] = useState<any[]>([]);
  const [tareas, setTareas] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<TaskItem[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validar sesión
      if (!session || !user) {
        throw new Error('Sesión no válida o expirada');
      }

      // Cargar la institución del coordinador primero
      let institucionCoordinador: InstitutionInfo | null = null;
      
      if (user?.institucionId) {
        try {
          // Usar el endpoint correcto para coordinador
          const instData = await getMiInstitucion();
          if (instData) {
            institucionCoordinador = {
              nombre: instData.nombre || 'Institución',
              municipio: instData.municipio?.nombre || instData.municipio,
              departamento: instData.departamento?.nombre || instData.departamento,
              codigoDane: instData.codigoDane
            };
          }
        } catch (instError) {
          console.warn('Error cargando institución con getMiInstitucion:', instError);
          // Intentar con el endpoint alternativo
          try {
            const instRes = await apiClient.getInstitucionById(user.institucionId);
            if (instRes.success && instRes.data) {
              institucionCoordinador = {
                nombre: instRes.data.nombre || 'Institución',
                municipio: instRes.data.municipio?.nombre || instRes.data.municipio,
                departamento: instRes.data.departamento?.nombre || instRes.data.departamento,
                codigoDane: instRes.data.codigoDane
              };
            }
          } catch (fallbackError) {
            console.warn('Error cargando institución con getInstitucionById:', fallbackError);
          }
        }
        
        // Validar que la institución se cargó correctamente
        if (!institucionCoordinador) {
          throw new Error('No se pudo cargar la información de la institución');
        }
        
        setMiInstitucion(institucionCoordinador);
      } else {
        throw new Error('El coordinador debe estar asignado a una institución');
      }

      // Usar endpoints específicos del coordinador
      const [
        estadisticasData,
        orientadoresRes,
        cursosRes,
        tareasRes,
        estudiantesRes,
        docentesRes // Solo para visualización
      ] = await Promise.all([
        getEstadisticasCoordinador(),
        getOrientadoresCoordinador(),
        getCursosCoordinador(),
        apiClient.getTareas(),
        apiClient.getEstudiantes(),
        apiClient.getDocentesCoordinador() // Solo para visualización
      ]);

      // Procesar estadísticas
      let processedStats: QuickStats = {
        totalOrientadores: 0,
        orientadoresActivos: 0,
        totalEstudiantes: 0,
        totalCursos: 0,
        totalGrados: 0,
        tareasActivas: 0,
        tareasCompletadas: 0,
        tareasPendientes: 0,
        tareasVencidas: 0,
        tasaCumplimiento: 0,
        orientadoresConTareas: 0,
        totalDocentes: 0
      };

      // Usar datos del backend si están disponibles
      if (estadisticasData) {
        processedStats = {
          totalOrientadores: estadisticasData.totalOrientadores || 0,
          orientadoresActivos: estadisticasData.orientadoresActivos || 0,
          totalEstudiantes: estadisticasData.totalEstudiantes || 0,
          totalCursos: estadisticasData.totalCursos || 0,
          totalGrados: estadisticasData.totalGrados || 0,
          tareasActivas: estadisticasData.tareasCreadas || 0,
          tareasCompletadas: estadisticasData.tareasCalificadas || 0,
          tareasPendientes: estadisticasData.tareasPendientes || 0,
          tareasVencidas: 0, // Calcular localmente
          tasaCumplimiento: estadisticasData.tareasCreadas > 0 
            ? Math.round((estadisticasData.tareasCalificadas / estadisticasData.tareasCreadas) * 100) 
            : 0,
          orientadoresConTareas: 0, // Calcular localmente
          totalDocentes: 0 // Obtener de docentesRes
        };
      }

      // Procesar orientadores
      const orientadoresArray = Array.isArray(orientadoresRes) ? orientadoresRes : [];
      setOrientadores(orientadoresArray);
      
      // Procesar docentes (solo para visualización)
      const docentesArray = Array.isArray(docentesRes) ? docentesRes : [];
      processedStats.totalDocentes = docentesArray.length;
      
      // Procesar tareas
      const tareasArray = Array.isArray(tareasRes) ? tareasRes : [];
      setTareas(tareasArray);

      // Calcular valores locales si no vienen del backend
      if (tareasArray.length > 0) {
        const tareasVencidas = tareasArray.filter(t => {
          if (!t.fechaLimite) return false;
          return new Date(t.fechaLimite) < new Date() && t.estado !== 'completada';
        }).length;
        
        processedStats.tareasVencidas = tareasVencidas;
        // Para orientadores, usamos orientadorId en vez de docenteId
        processedStats.orientadoresConTareas = [...new Set(tareasArray.map(t => t.orientadorId || t.docenteId).filter(Boolean))].length;
      }

      // Actualizar estudiantes si no viene del backend
      if (!estadisticasData?.totalEstudiantes && Array.isArray(estudiantesRes?.data)) {
        processedStats.totalEstudiantes = estudiantesRes.data.length;
      }

      // Actualizar cursos si no viene del backend
      if (!estadisticasData?.totalCursos && Array.isArray(cursosRes)) {
        processedStats.totalCursos = cursosRes.length;
      }

      setStats(processedStats);

      // Generar tareas pendientes basadas en los datos
      const tasks: TaskItem[] = [];
      
      if (processedStats.totalOrientadores === 0) {
        tasks.push({
          id: '1',
          title: 'Asignar Orientadores Académicos',
          description: 'Tu institución no tiene orientadores asignados. Los orientadores son clave para el seguimiento vocacional y emocional de los estudiantes.',
          priority: 'high',
          status: 'pending',
          action: 'Asignar Orientadores',
          actionLink: '/orientadores'
        });
      }

      if (processedStats.totalCursos === 0) {
        tasks.push({
          id: '2',
          title: 'Configurar Cursos',
          description: 'Es necesario configurar los cursos para organizar a los estudiantes y facilitar la gestión de los orientadores.',
          priority: 'high',
          status: 'pending',
          action: 'Configurar Cursos',
          actionLink: '/cursos'
        });
      }

      if (processedStats.totalEstudiantes === 0) {
        tasks.push({
          id: '3',
          title: 'Registrar Estudiantes',
          description: 'Debes registrar los estudiantes para asignarlos a los cursos y que los orientadores puedan hacer seguimiento.',
          priority: 'high',
          status: 'pending',
          action: 'Registrar Estudiantes',
          actionLink: '/estudiantes'
        });
      }

      if (processedStats.tareasVencidas > 0) {
        tasks.push({
          id: '4',
          title: 'Revisar Seguimiento Académico',
          description: `Hay ${processedStats.tareasVencidas} actividad(es) académica(s) con retraso que requieren atención de los orientadores.`,
          priority: 'high',
          status: 'pending',
          action: 'Ver Seguimiento',
          actionLink: '/seguimiento'
        });
      }

      if (processedStats.tasaCumplimiento < 60 && processedStats.tareasActivas > 0) {
        tasks.push({
          id: '5',
          title: 'Mejorar Seguimiento de Orientadores',
          description: `La tasa de seguimiento es del ${processedStats.tasaCumplimiento}%. Considera reunirte con los orientadores para mejorar el acompañamiento.`,
          priority: 'medium',
          status: 'pending',
          action: 'Ver Orientadores',
          actionLink: '/orientadores'
        });
      }

      if (processedStats.orientadoresConTareas < processedStats.orientadoresActivos && processedStats.orientadoresActivos > 0) {
        tasks.push({
          id: '6',
          title: 'Fomentar Seguimiento Estudiantil',
          description: `${processedStats.orientadoresActivos - processedStats.orientadoresConTareas} orientador(es) no están haciendo seguimiento. Motívalos a participar.`,
          priority: 'medium',
          status: 'pending',
          action: 'Ver Orientadores',
          actionLink: '/orientadores'
        });
      }

      tasks.push({
        id: '7',
        title: 'Generar Reporte de Orientación',
        description: 'Revisa las estadísticas de orientación para monitorear el acompañamiento estudiantil y tomar decisiones informadas.',
        priority: 'low',
        status: 'pending',
        action: 'Ver Reportes',
        actionLink: '/reportes/coordinador'
      });

      setPendingTasks(tasks);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = () => {
    loadDashboardData();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <IconCheck className="w-4 h-4 text-green-500" />;
      case 'overdue': return <IconAlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <IconInfo className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Cargando panel de coordinación..." />
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Principal */}
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-700 rounded-2xl p-8 text-white shadow-xl">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-400/15 to-transparent rounded-full translate-y-1/2 -translate-x-1/3" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/40 ring-4 ring-white/10">
                <IconClipboard className="text-white" size={32} />
              </div>
              <div>
                <p className="text-teal-200 text-sm font-semibold uppercase tracking-wider mb-1">
                  Coordinación Académica
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Bienvenido, {user?.nombre || 'Coordinador'}
                </h1>
                <p className="text-teal-100 mt-1">
                  {miInstitucion ? (
                    <>
                      <span className="font-semibold">{miInstitucion.nombre}</span>
                      {miInstitucion.municipio && <span className="text-teal-200"> • {miInstitucion.municipio}</span>}
                    </>
                  ) : (
                    'Gestión académica y seguimiento docente'
                  )}
                </p>
              </div>
            </div>
            
            {/* Indicador de cumplimiento */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.tasaCumplimiento || 0}%</div>
                <div className="text-sm text-teal-100">Cumplimiento</div>
              </div>
            </div>
            
            {/* Botón de Guía */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium transition-all border border-white/20"
            >
              <IconInfo size={16} />
              {showGuide ? 'Ocultar Guía' : 'Mostrar Guía'}
            </button>
          </div>
        </div>

        {/* Guía Rápida */}
        {showGuide && (
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <IconTarget className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-teal-900 mb-2">🎯 Guía Rápida para Coordinadores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="bg-white rounded-lg p-3 border border-teal-100">
                    <h4 className="font-medium text-teal-800 mb-1">1. Gestionar Orientadores</h4>
                    <p className="text-sm text-gray-600">Asigna y supervisa orientadores para seguimiento estudiantil.</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-teal-100">
                    <h4 className="font-medium text-teal-800 mb-1">2. Organizar Cursos</h4>
                    <p className="text-sm text-gray-600">Configura cursos para facilitar el trabajo de los orientadores.</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-teal-100">
                    <h4 className="font-medium text-teal-800 mb-1">3. Monitorear Seguimiento</h4>
                    <p className="text-sm text-gray-600">Revisa el acompañamiento y rendimiento académico.</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-teal-100">
                    <h4 className="font-medium text-teal-800 mb-1">4. Generar Reportes</h4>
                    <p className="text-sm text-gray-600">Analiza estadísticas de orientación académica.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <IconUsers className="text-indigo-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalOrientadores || 0}</div>
                <div className="text-sm text-slate-500">Orientadores</div>
                <div className="text-xs text-green-600 font-medium">
                  {stats.orientadoresActivos || 0} activos
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <IconGraduationCap className="text-blue-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalEstudiantes || 0}</div>
                <div className="text-sm text-slate-500">Estudiantes</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <IconFilter className="text-purple-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.totalCursos || 0}</div>
                <div className="text-sm text-slate-500">Cursos</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <IconClipboard className="text-teal-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stats.tareasActivas || 0}</div>
                <div className="text-sm text-slate-500">Seguimientos Activos</div>
                <div className="text-xs text-green-600 font-medium">
                  {stats.tasaCumplimiento || 0}% completados
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta de Seguimientos Vencidos */}
        {stats.tareasVencidas > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <IconAlertTriangle className="text-red-600" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Atención Requerida</h3>
                <p className="text-sm text-red-700">
                  Hay {stats.tareasVencidas} seguimiento(s) académico(s) vencido(s) que requieren atención inmediata.
                </p>
              </div>
              <Link
                to="/seguimiento"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Ver Seguimientos
              </Link>
            </div>
          </div>
        )}

        {/* Tareas Pendientes */}
        {pendingTasks.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">📋 Tareas Pendientes</h3>
              <span className="text-sm text-slate-500">{pendingTasks.length} acciones requeridas</span>
            </div>
            
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className={`border rounded-lg p-4 ${getPriorityColor(task.priority)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      {task.actionLink && (
                        <Link
                          to={task.actionLink}
                          className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          {task.action}
                          <IconArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {pendingTasks.length > 5 && (
              <div className="mt-4 text-center">
                <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
                  Ver {pendingTasks.length - 5} tareas más →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/orientadores"
            className="group bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <IconUsers size={32} />
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <IconArrowRight size={20} />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Gestión de Orientadores</h3>
            <p className="text-indigo-100 text-sm">Administra orientadores académicos y su desempeño</p>
          </Link>

          <Link
            to="/cursos"
            className="group bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <IconFilter size={32} />
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <IconArrowRight size={20} />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Configuración de Cursos</h3>
            <p className="text-teal-100 text-sm">Organiza cursos para seguimiento estudiantil</p>
          </Link>

          <Link
            to="/reportes/coordinador"
            className="group bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <IconBarChart size={32} />
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <IconArrowRight size={20} />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Reportes de Orientación</h3>
            <p className="text-emerald-100 text-sm">Análisis de seguimiento académico y estudiantil</p>
          </Link>
        </div>

        {/* Métricas Adicionales */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">📊 Métricas de Orientación Detalladas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800">{stats.tareasCompletadas || 0}</div>
              <div className="text-sm text-slate-500">Seguimientos Completados</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800">{stats.tareasPendientes || 0}</div>
              <div className="text-sm text-slate-500">Seguimientos Pendientes</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800">{stats.orientadoresConTareas || 0}</div>
              <div className="text-sm text-slate-500">Orientadores Activos</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800">{stats.totalGrados || 0}</div>
              <div className="text-sm text-slate-500">Grados Configurados</div>
            </div>
          </div>
          
          {/* Métrica de Docentes (solo visualización) */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Docentes en la institución (solo visualización)</span>
              <span className="font-bold text-slate-800">{stats.totalDocentes || 0}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">La gestión de docentes es responsabilidad de los orientadores académicos</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
