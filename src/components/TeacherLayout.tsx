import { useState, useEffect } from 'react';
import { getSession, logout } from '../api/endpoints';
import TeacherSidebar from './TeacherSidebar';
import HelpAssistant from '../components/ui/HelpAssistant';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { IconMenu, IconLogout } from './ui/Icons';
import { useNavigate } from 'react-router-dom';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const session = getSession();
  const user = session?.user;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await handleLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    // Debug: verificar datos del usuario en layout docente
    // eslint-disable-next-line no-console
    console.log('TeacherLayout user:', user);
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <IconMenu size={22} />
            </button>
            <div className="flex items-center gap-3 cursor-default">
              <img src="/src/assets/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
              <div className="hidden sm:block">
                <div className="font-display font-bold text-slate-800">Cátedra de Familia</div>
                <div className="text-xs text-slate-500">{user?.institucion || 'Parchando Juntos'}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-2">
                {/* Foto de perfil para Alex Jhoan */}
                {(user?.nombre?.toLowerCase().includes('alex') && user?.apellidos?.toLowerCase().includes('jhoan')) ? (
                  <img 
                    src="/src/assets/img_familias/foto-git-3.png" 
                    alt="Foto de Alex Jhoan"
                    className="w-8 h-8 rounded-full object-cover border-2 border-teal-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user?.nombre?.charAt(0) || 'D'}
                  </div>
                )}
                <div className="text-sm font-medium text-slate-700">{
                  (user?.nombre && user?.nombre !== 'Usuario')
                    ? `${user?.nombre} ${user?.apellidos || ''}`.trim()
                    : (user?.correo ? String(user.correo).split('@')[0] : 'Docente')
                }</div>
              </div>
              <div className="mt-0.5">
                <span className="px-2 py-0.5 rounded-lg text-[11px] bg-teal-50 text-teal-700 border border-teal-200">
                  Rol: {(((user?.rol || 'docente') as string) === 'docente_aula' ? 'docente' : ((user?.rol || 'docente') as string).replace('_',' '))}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <IconLogout size={18} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar fijo en escritorio y overlay en móvil */}
      <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenido con padding a la izquierda en lg para no superponerse con sidebar (w-72) */}
      <div className="px-4 py-6 lg:pl-72">
        <main className="min-h-[60vh] max-w-7xl mx-auto">{children}</main>
      </div>

      {/* Ayuda flotante para docentes */}
      <HelpAssistant />

      {/* Modal de confirmación de logout */}
      <Modal
        isOpen={showLogoutModal}
        onClose={cancelLogout}
        title="¿Estás seguro de que quieres salir?"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            ¿Estás seguro de que quieres cerrar sesión? Si tienes cambios sin guardar, se perderán.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={cancelLogout}
              className="flex-1 sm:flex-none"
            >
              No, cancelar
            </Button>
            <Button
              onClick={confirmLogout}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
            >
              Sí, salir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
