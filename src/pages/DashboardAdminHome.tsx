import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getInstituciones, getSession } from '../api/endpoints';
import { PageLoading, StatsCardSkeleton, ButtonLoading } from '../components/ui/LoadingStates';
import { ErrorState } from '../components/ui/ErrorStates';
import { IconUsers, IconBuilding, IconSettings, IconRefresh } from '../components/ui/Icons';

// Iconos SVG inline para los "poderes"
const IconSchool = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
);

const IconUserGroup = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const IconCheckBadge = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const IconCog6 = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconChartBar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const IconShieldCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

// Icono para el handshake del modal/card de invitar
const IconHandshake = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
  </svg>
);

// Icono de rayo para "Poderes"
const IconBolt = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

export default function DashboardAdminHome() {
  const session = getSession();
  const [counts, setCounts] = useState({ instituciones: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const instituciones = await getInstituciones();
      if (!Array.isArray(instituciones)) {
        throw new Error('Datos de instituciones inválidos');
      }
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

  const retryLoad = () => { load(); };

  const handleInviteAdmin = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) return;
    setInviteLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Invitación enviada a:', inviteEmail);
      setInviteSuccess(true);
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const poderes = [
    { 
      icono: <IconSchool />, 
      color: 'bg-teal-100 text-teal-600',
      titulo: 'Gestionar Instituciones', 
      desc: 'Crear, editar, aprobar y eliminar instituciones educativas del sistema.' 
    },
    { 
      icono: <IconUserGroup />, 
      color: 'bg-blue-100 text-blue-600',
      titulo: 'Administrar Usuarios', 
      desc: 'Crear rectores, coordinadores y gestionar todos los usuarios del sistema.' 
    },
    { 
      icono: <IconCheckBadge />, 
      color: 'bg-green-100 text-green-600',
      titulo: 'Aprobar Solicitudes', 
      desc: 'Revisar y aprobar instituciones pendientes de verificación.' 
    },
    { 
      icono: <IconCog6 />, 
      color: 'bg-slate-100 text-slate-600',
      titulo: 'Configurar Sistema', 
      desc: 'Acceder a configuraciones avanzadas y parámetros del sistema.' 
    },
    { 
      icono: <IconChartBar />, 
      color: 'bg-purple-100 text-purple-600',
      titulo: 'Ver Reportes', 
      desc: 'Acceso completo a estadísticas y reportes de toda la plataforma.' 
    },
    { 
      icono: <IconShieldCheck />, 
      color: 'bg-amber-100 text-amber-600',
      titulo: 'Control Total', 
      desc: 'Máximo nivel de acceso y permisos en toda la plataforma.' 
    },
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
                
                <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
                  Bienvenido, {session?.user?.nombre || 'Administrador'}
                  <span className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0h3.15M10.05 4.575v6.525M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 0013.5 0V9.75a1.575 1.575 0 00-3.15 0v1.5m0 0V9.75m0 1.5v6.375M6.9 7.575V14.1" />
                    </svg>
                  </span>
                </h1>
                
                <p className="text-slate-300 text-lg max-w-xl mb-6">
                  Tienes el control total de la plataforma <span className="text-teal-400 font-semibold">Cátedra de Familia</span>. 
                  Gestiona instituciones, usuarios y configura el sistema según las necesidades.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Link 
                    to="/dashboard/admin/manage?tab=instituciones" 
                    className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-teal-500/25"
                  >
                    <IconBuilding size={18} /> Ver Instituciones
                  </Link>
                  <Link 
                    to="/dashboard/admin/manage?tab=usuarios" 
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-medium transition-all border border-white/20"
                  >
                    <IconUsers size={18} /> Ver Usuarios
                  </Link>
                  <ButtonLoading
                    loading={inviteLoading}
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/25"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    {inviteLoading ? 'Enviando...' : 'Invitar Admin'}
                  </ButtonLoading>
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
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <StatsCardSkeleton key={index} />
            ))
          ) : (
            <>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <IconBuilding size={24} className="text-teal-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{counts.instituciones}</div>
                    <div className="text-sm text-slate-500">Instituciones Registradas</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{counts.pendientes}</div>
                    <div className="text-sm text-slate-500">Pendientes de Aprobación</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sección de Poderes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {/* Icono de rayo reemplazando el emoji ⚡ */}
              <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500">
                <IconBolt />
              </span>
              Tus Poderes como Administrador
            </h2>
            <p className="text-sm text-slate-500 mt-1">Como administrador del sistema, tienes acceso a las siguientes capacidades</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {poderes.map((poder, idx) => (
                <div key={idx} className="group p-4 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all">
                  <div className="flex items-start gap-3">
                    {/* Icono SVG con fondo coloreado reemplazando el emoji */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${poder.color}`}>
                      {poder.icono}
                    </div>
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
                <IconBuilding size={24} />
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

        {/* Card de Invitar Admin */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-center gap-6">
            {/* Icono SVG reemplazando el emoji 🤝 */}
            <div className="hidden md:flex w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl items-center justify-center text-white shadow-lg shadow-amber-500/25">
              <IconHandshake />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-1">¿Necesitas ayuda administrando?</h3>
              <p className="text-slate-600 text-sm">Invita a otro administrador para compartir las responsabilidades de gestión de la plataforma.</p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-amber-500/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invitar Admin
            </button>
          </div>
        </div>

      </div>

      {/* Modal Invitar Admin */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !inviteLoading && setShowInviteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            {inviteSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">¡Invitación Enviada!</h3>
                <p className="text-slate-600 text-sm">
                  Se ha enviado un correo a <span className="font-medium">{inviteEmail}</span> con las instrucciones.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {/* Icono SVG reemplazando el emoji 🤝 del modal */}
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                    <IconHandshake />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Invitar Administrador</h3>
                    <p className="text-sm text-slate-500">Envía una invitación por correo</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm mb-4">
                  Ingresa el correo electrónico de la persona que deseas invitar como administrador del sistema.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="admin@educacion.gov.co"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                      disabled={inviteLoading}
                    />
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex gap-2">
                      <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-amber-800">
                        El nuevo administrador tendrá acceso completo al sistema. Asegúrate de que sea una persona autorizada.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    disabled={inviteLoading}
                    className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleInviteAdmin}
                    disabled={inviteLoading || !inviteEmail || !inviteEmail.includes('@')}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-medium hover:from-amber-600 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {inviteLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Enviar Invitación</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}