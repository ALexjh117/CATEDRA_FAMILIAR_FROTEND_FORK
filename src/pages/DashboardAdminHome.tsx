import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getInstituciones, getSession } from '../api/endpoints';
import { PageLoading, StatsCardSkeleton } from '../components/ui/LoadingStates';
import { ErrorState } from '../components/ui/ErrorStates';
import { IconUsers, IconSettings } from '../components/ui/Icons';
import { FaSchool, FaUserShield, FaUserCog, FaChartLine, FaLock, FaRocket, FaBuilding, FaServer, FaGraduationCap } from 'react-icons/fa';

export default function DashboardAdminHome() {
  const session = getSession();
  const [counts, setCounts] = useState({ instituciones: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const instituciones = await getInstituciones();
      // Validar que sea un array
      if (!Array.isArray(instituciones)) {
        throw new Error('Datos de instituciones inválidos');
      }
      // El backend solo tiene /admin/instituciones/pendientes por ahora
      setCounts({ 
        instituciones: instituciones.length, 
        pendientes: instituciones.filter(i => !i.aprobada).length 
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar datos');
    } finally { 
      setLoading(false); 
    }
  };

  const retryLoad = () => {
    load();
  };

  

  const poderes = [
    { icono: <FaSchool className="text-teal-600" />, titulo: 'Gestionar Instituciones', desc: 'Crear, editar y eliminar instituciones educativas del sistema.' },
    { icono: <FaUserShield className="text-blue-600" />, titulo: 'Administrar Usuarios', desc: 'Crear rectores, coordinadores y gestionar todos los usuarios del sistema.' },
    { icono: <FaUserCog className="text-purple-600" />, titulo: 'Configurar Roles', desc: 'Asignar permisos y roles específicos para cada tipo de usuario.' },
    { icono: <FaChartLine className="text-orange-600" />, titulo: 'Ver Estadísticas', desc: 'Acceder a reportes y métricas del sistema completo.' },
    { icono: <FaServer className="text-indigo-600" />, titulo: 'Gestión de Datos', desc: 'Administrar respaldos, exportación y migración de información.' },
    { icono: <FaLock className="text-slate-600" />, titulo: 'Seguridad', desc: 'Controlar accesos, auditorías y políticas de seguridad.' },
    { icono: <FaGraduationCap className="text-cyan-600" />, titulo: 'Gestionar Cursos', desc: 'Crear, editar y administrar cursos académicos por grado y jornada.' },
    
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoading message="Cargando panel administrativo..." />
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
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero Principal */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-10 text-white">
          {/* Patrón de fondo decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-4">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>Sesión activa</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Bienvenido, {session?.user?.nombre || 'Administrador'} <FaUserShield className="inline-block text-teal-400" />
                </h1>
                
                <p className="text-slate-300 text-lg max-w-xl mb-6">
                  Tienes el control total de la plataforma <span className="text-teal-400 font-semibold">Cátedra de Familia</span>. 
                  Gestiona instituciones, usuarios y configura el sistema según las necesidades.
                </p>

                <div className="flex items-center gap-3">
                  <Link 
                    to="/dashboard/admin/manage?tab=instituciones" 
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/25"
                  >
                    <FaBuilding size={18} /> Ver Instituciones
                  </Link>
                  <Link 
                    to="/dashboard/admin/manage?tab=usuarios" 
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-medium transition-all border border-white/20"
                  >
                    <IconUsers size={18} /> Ver Usuarios
                  </Link>
                </div>
              </div>

              {/* Badge de Rol */}
              <div className="hidden lg:block text-right">
                <div className="inline-flex flex-col items-end bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Tu Rol</div>
                  <div className="text-2xl font-bold text-teal-400 mb-3">Administrador</div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Nivel Máximo</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 1 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <FaBuilding size={24} className="text-teal-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{counts.instituciones}</div>
                  <div className="text-sm text-slate-500">Instituciones Registradas</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Poderes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FaRocket className="text-teal-600" /> Tus Poderes como Administrador
            </h2>
            <p className="text-sm text-slate-500 mt-1">Como administrador del sistema, tienes acceso a las siguientes capacidades</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {poderes.map((poder, idx) => (
                <div key={idx} className="group p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{poder.icono}</div>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">{poder.titulo}</h3>
                      <p className="text-sm text-slate-500 mt-1">{poder.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/admin/manage?tab=instituciones" 
            className="group bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Instituciones</h3>
                <p className="text-teal-100 text-sm">Gestionar instituciones educativas</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <FaBuilding size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-teal-100">
              <span>Ver todas</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link 
            to="/dashboard/admin/manage?tab=usuarios" 
            className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Usuarios</h3>
                <p className="text-blue-100 text-sm">Administrar cuentas y permisos</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <IconUsers size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
              <span>Ver todos</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link 
            to="/dashboard/admin/manage?tab=configuracion" 
            className="group bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 text-white hover:shadow-lg hover:shadow-slate-500/25 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Sistema</h3>
                <p className="text-slate-300 text-sm">Configuración avanzada</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <IconSettings size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
              <span>Configurar</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Sección de invitación a admin removida por política de seguridad */}

      </div>

      {/* Modal de invitación eliminado */}
    </DashboardLayout>
  );
}
