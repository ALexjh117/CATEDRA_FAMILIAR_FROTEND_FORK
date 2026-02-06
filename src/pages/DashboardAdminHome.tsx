import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getInstituciones, getSession } from '../api/endpoints';
import { PageLoading, StatsCardSkeleton, ButtonLoading } from '../components/ui/LoadingStates';
import { ErrorState } from '../components/ui/ErrorStates';
import { IconUsers, IconBuilding, IconSettings, IconRefresh } from '../components/ui/Icons';

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
    { icono: '🏫', titulo: 'Gestionar Instituciones', desc: 'Crear, editar, aprobar y eliminar instituciones educativas del sistema.' },
    { icono: '👥', titulo: 'Administrar Usuarios', desc: 'Crear rectores, coordinadores y gestionar todos los usuarios del sistema.' },
    { icono: '✅', titulo: 'Aprobar Solicitudes', desc: 'Revisar y aprobar instituciones pendientes de verificación.' },
    { icono: '⚙️', titulo: 'Configurar Sistema', desc: 'Acceder a configuraciones avanzadas y parámetros del sistema.' },
    { icono: '📊', titulo: 'Ver Reportes', desc: 'Acceso completo a estadísticas y reportes de toda la plataforma.' },
    { icono: '🔐', titulo: 'Control Total', desc: 'Máximo nivel de acceso y permisos en toda la plataforma.' },
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
                  Bienvenido, {session?.user?.nombre || 'Administrador'} 👋
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
              <span className="text-2xl">⚡</span> Tus Poderes como Administrador
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
            <div className="hidden md:flex w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl items-center justify-center text-white text-3xl shadow-lg shadow-amber-500/25">
              🤝
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
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
                    🤝
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
