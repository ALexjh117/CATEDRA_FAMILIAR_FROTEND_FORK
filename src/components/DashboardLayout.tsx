import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getSession, setPreviewRole } from '../api/endpoints';
import { usuariosMock, type RolUsuario } from '../mocks/data';
import { useState } from 'react';
import {
  IconHome,
  IconBarChart,
  IconClipboard,
  IconPlus,
  IconInbox,
  IconUsers,
  IconTrendingUp,
  IconTeacher,
  IconGraduationCap,
  IconSettings,
  IconBuilding,
  IconLogout,
  IconMenu,
  IconX
} from './ui/Icons';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Mapeo de iconos para navegación
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  home: IconHome,
  dashboard: IconBarChart,
  tasks: IconClipboard,
  plus: IconPlus,
  inbox: IconInbox,
  users: IconUsers,
  reports: IconTrendingUp,
  teachers: IconTeacher,
  courses: IconGraduationCap,
  settings: IconSettings,
  institutions: IconBuilding,
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const user = session?.user;
  const isPreview = session?.isPreview;
  
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSwitchRole = (role: string) => {
    setPreviewRole(role);
    setShowRoleSwitcher(false);
    
    // Redirigir al dashboard correspondiente (solo roles web)
    const roleRoutes: Record<string, string> = {
      docente: '/dashboard/docente',
      docente_aula: '/dashboard/docente',
      orientador: '/dashboard/orientador',
      coordinador: '/dashboard/coordinador',
      rector: '/dashboard/rector',
      admin: '/dashboard/admin',
    };
    navigate(roleRoutes[role] || '/dashboard/docente');
  };

  const getNavItems = () => {
    const rol = user?.rol;
    
    const commonItems = [
      { path: '/dashboard', label: 'Inicio', icon: 'home' },
    ];

    switch (rol) {
      case 'docente_aula':
        return [
          ...commonItems,
          { path: '/dashboard/docente', label: 'Mi Panel', icon: 'dashboard' },
          { path: '/tareas', label: 'Tareas', icon: 'tasks' },
          { path: '/tareas/crear', label: 'Crear Tarea', icon: 'plus' },
          { path: '/entregas', label: 'Entregas', icon: 'inbox' },
          { path: '/estudiantes', label: 'Estudiantes', icon: 'users' },
        ];
      case 'orientador':
        return [
          ...commonItems,
          { path: '/dashboard/orientador', label: 'Mi Panel', icon: 'dashboard' },
          { path: '/estudiantes', label: 'Seguimiento', icon: 'users' },
          { path: '/reportes', label: 'Reportes', icon: 'reports' },
        ];
      case 'coordinador':
        return [
          ...commonItems,
          { path: '/dashboard/coordinador', label: 'Mi Panel', icon: 'dashboard' },
          { path: '/docentes', label: 'Docentes', icon: 'teachers' },
          { path: '/cursos', label: 'Cursos', icon: 'courses' },
          { path: '/reportes', label: 'Reportes', icon: 'reports' },
        ];
      case 'rector':
        return [
          ...commonItems,
          { path: '/dashboard/rector', label: 'Mi Panel', icon: 'dashboard' },
          { path: '/docentes', label: 'Docentes', icon: 'teachers' },
          { path: '/reportes', label: 'Reportes', icon: 'reports' },
          { path: '/configuracion', label: 'Configuración', icon: 'settings' },
        ];
      case 'admin':
        return [
          ...commonItems,
          { path: '/dashboard/admin', label: 'Mi Panel', icon: 'dashboard' },
          { path: '/instituciones', label: 'Instituciones', icon: 'institutions' },
          { path: '/usuarios', label: 'Usuarios', icon: 'users' },
          { path: '/configuracion', label: 'Sistema', icon: 'settings' },
        ];
      default:
        return commonItems;
    }
  };

  const getRolLabel = (rol: RolUsuario) => {
    const labels: Record<RolUsuario, string> = {
      acudiente: 'Acudiente',
      docente_aula: 'Docente',
      orientador: 'Orientador',
      coordinador: 'Coordinador',
      rector: 'Rector',
      admin: 'Administrador',
    };
    return labels[rol] || rol;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Mode Banner */}
      {isPreview && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 py-2 px-4 text-center text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            Modo Preview - Estás viendo como: <strong>{getRolLabel(user?.rol || 'acudiente')}</strong>
            <button 
              onClick={() => setShowRoleSwitcher(true)}
              className="ml-2 px-2 py-0.5 bg-white/30 rounded hover:bg-white/50 transition-colors"
            >
              Cambiar rol
            </button>
          </span>
        </div>
      )}

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
            
            <Link to="/" className="flex items-center gap-3">
              <img src="/src/assets/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
              <div className="hidden sm:block">
                <div className="font-display font-bold text-slate-800">Cátedra de Familia</div>
                <div className="text-xs text-slate-500">{user?.institucion || 'Parchando Juntos'}</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Switcher Button */}
            <button
              onClick={() => setShowRoleSwitcher(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors text-slate-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Ver como</span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-800">{user?.nombre} {user?.apellidos}</div>
                <div className="text-xs text-slate-500">{getRolLabel(user?.rol || 'acudiente')}</div>
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
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isPreview ? 'top-10' : 'top-0'} lg:top-0 pt-16 lg:pt-0
        `}>
          <div className="p-4 flex justify-between items-center lg:hidden">
            <span className="font-semibold text-slate-800">Menú</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
              <IconX size={20} />
            </button>
          </div>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon] || IconHome;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200/50'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Icon size={20} className={location.pathname === item.path ? 'text-white' : 'text-slate-400'} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-64px)] bg-slate-50">
          {children}
        </main>
      </div>

      {/* Role Switcher Modal */}
      {showRoleSwitcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRoleSwitcher(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Cambiar Vista de Rol</h3>
            <p className="text-slate-600 text-sm mb-4">
              Selecciona un rol para ver la plataforma desde su perspectiva (Modo Preview).
            </p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(usuariosMock).map(([key, user]) => (
                <button
                  key={key}
                  onClick={() => handleSwitchRole(key)}
                  className={`p-4 rounded-xl border-2 text-left hover:border-teal-500 transition-all ${
                    session?.user?.rol === user.rol 
                      ? 'border-teal-500 bg-teal-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{getRolLabel(user.rol)}</div>
                  <div className="text-xs text-gray-500">{user.nombre}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRoleSwitcher(false)}
              className="mt-4 w-full py-2 text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
