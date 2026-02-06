import { useState } from 'react';
import { getSession, logout } from '../api/endpoints';
import AcudienteSidebar from './AcudienteSidebar';
import { IconMenu, IconLogout } from './ui/Icons';
import { useNavigate } from 'react-router-dom';

export default function AcudienteLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = getSession();
  const user = session?.user;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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
                <div className="text-xs text-slate-500">Portal Acudientes</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex text-sm text-slate-600">{user?.nombre || 'Acudiente'}</div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <IconLogout size={18} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[18rem,1fr] gap-6">
        {/* Sidebar */}
        <AcudienteSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Content */}
        <main className="min-h-[60vh]">{children}</main>
      </div>
    </div>
  );
}
