import { useNavigate } from 'react-router-dom';
import { logout, getSession } from '../../api/endpoints';
import SidebarOrientador from './SidebarOrientador';
import { IconLogout } from '../ui/Icons';

export default function OrientadorLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const session = getSession();
  const user = session?.user;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-default">
            <img src="/src/assets/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
            <div className="hidden sm:block">
              <div className="font-display font-bold text-slate-800">Cátedra de Familia</div>
              <div className="text-xs text-slate-500">{user?.institucion || 'Parchando Juntos'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-800">{user?.nombre} {user?.apellidos}</div>
              <div className="text-xs text-slate-500">Orientador</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Cerrar sesión"
            >
              <IconLogout size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <SidebarOrientador />
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-61px)] bg-slate-50">{children}</main>
      </div>
    </div>
  );
}
