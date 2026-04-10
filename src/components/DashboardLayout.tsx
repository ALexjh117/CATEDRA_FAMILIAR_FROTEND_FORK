import { Link, useLocation, useNavigate } from 'react-router-dom';

import { logout, getSession, setPreviewRole } from '../api/endpoints';

import { usuariosMock, type RolUsuario } from '../mocks/data';

import { useEffect, useState } from 'react';

import Modal from './ui/Modal';
import Button from './ui/Button';

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

  IconFamily,

  IconLogout,

  IconMenu,

  IconX,

  IconUser,

  IconChevronRight

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

  family: IconFamily,

  profile: IconUser,

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

  const [expandedNavGroups, setExpandedNavGroups] = useState<Record<string, boolean>>({});



  // Verificar si el usuario actual es admin

  const isAdmin = user?.rol === 'admin' || user?.rol === 'admin_sistema';



  



  const [showLogoutModal, setShowLogoutModal] = useState(false);



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

      admin_sistema: '/dashboard/admin',

      acudiente: '/dashboard/acudiente',

    };

    navigate(roleRoutes[role] || '/dashboard/docente');

  };



  const getNavItems = () => {

    const rol = user?.rol;

    

    const commonItems = [

      { type: 'link', path: '/dashboard', label: 'Inicio', icon: 'home' },

    ];



    const profileItem = { type: 'link', path: '/perfil', label: 'Mi Perfil', icon: 'profile' };



    type NavItemLink = { type: 'link'; path: string; label: string; icon: string };

    type NavItemGroup = { type: 'group'; key: string; label: string; icon: string; children: NavItem[] };

    type NavItem = NavItemLink | NavItemGroup;



    switch (rol) {

      case 'docente_aula':

        return [

          ...commonItems,

          { type: 'link', path: '/dashboard/docente', label: 'Mi Panel', icon: 'dashboard' },

          { type: 'link', path: '/docente/banco-tareas', label: 'Banco de Tareas', icon: 'tasks' },

          { type: 'link', path: '/entregas', label: 'Entregas', icon: 'inbox' },

          { type: 'link', path: '/docente/estudiantes', label: 'Estudiantes', icon: 'users' },

          { type: 'link', path: '/docente/acudientes', label: 'Acudientes', icon: 'users' },

          { type: 'link', path: '/reportes/docente', label: 'Reportes', icon: 'reports' },

          profileItem,

        ];

      case 'orientador':

        return [

          ...commonItems,

          { type: 'link', path: '/dashboard/orientador', label: 'Mi Panel', icon: 'dashboard' },

          { type: 'link', path: '/tareas', label: 'Tareas', icon: 'tasks' },

          { type: 'link', path: '/docente/asignaciones', label: 'Asignaciones', icon: 'tasks' },

          { type: 'link', path: '/asignaciones/nueva', label: 'Asignar tarea', icon: 'tasks' },

   /*        { type: 'link', path: '/orientador/entregas', label: 'Entregas', icon: 'inbox' }, */

          { type: 'link', path: '/padres-familia', label: 'Padres de Familia', icon: 'family' },

          {

            type: 'group',

            key: 'mi-institucion',

            label: 'Mi institución',

            icon: 'institutions',

            children: [

              { type: 'link', path: '/estudiantes', label: 'Estudiantes', icon: 'users' },

              { type: 'link', path: '/cursos', label: 'Cursos', icon: 'courses' },

            ],

          },

          { type: 'link', path: '/reportes/orientador', label: 'Reportes', icon: 'reports' },

          profileItem,

        ];

      case 'coordinador':

        return [

          ...commonItems,

          { type: 'link', path: '/dashboard/coordinador', label: 'Mi Panel', icon: 'dashboard' },

          { type: 'link', path: '/coordinador/alertas', label: 'Alertas Académicas', icon: 'reports' },

          { type: 'link', path: '/gestion-orientacion', label: 'Gestión de Orientación', icon: 'teachers' },

          { type: 'link', path: '/cursos', label: 'Cursos', icon: 'courses' },

          { type: 'link', path: '/reportes/coordinador', label: 'Reportes', icon: 'reports' },

          profileItem,

        ];

      case 'rector':

        return [

          ...commonItems,

          { type: 'link', path: '/dashboard/rector', label: 'Mi Panel', icon: 'dashboard' },

          { type: 'link', path: '/directivos', label: 'Directivos', icon: 'users' },

          { type: 'link', path: '/reportes/rector', label: 'Reportes', icon: 'reports' },

          { type: 'link', path: '/configuracion', label: 'Configuración', icon: 'settings' },

          profileItem,

        ];

      case 'admin':

      case 'admin_sistema':

        return [

          ...commonItems,

          { type: 'link', path: '/dashboard/admin', label: 'Mi Panel', icon: 'dashboard' },

          { type: 'link', path: '/dashboard/admin/manage?tab=instituciones', label: 'Instituciones', icon: 'institutions' },

          { type: 'link', path: '/dashboard/admin/manage?tab=usuarios', label: 'Usuarios', icon: 'users' },

          { type: 'link', path: '/reportes/admin', label: 'Reportes', icon: 'reports' },

          { type: 'link', path: '/dashboard/admin/manage?tab=configuracion', label: 'Sistema', icon: 'settings' },

          // Admin no tiene perfil - solo gestiona sistema e invita admins

        ];

      case 'acudiente':

        return [

          ...commonItems,

          { type: 'link', path: '/dashboard/acudiente', label: 'Mi Panel', icon: 'dashboard' },

          { type: 'link', path: '/acudiente/especiales', label: 'Entregas especiales', icon: 'inbox' },

          profileItem,

        ];

      default:

        return [...commonItems, profileItem];

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

      admin_sistema: 'Admin Sistema',

    };

    return labels[rol] || rol;

  };



  const navItems = getNavItems();



  const fullPath = location.pathname + (location.search || '');



  const isNavLinkActive = (path: string) => fullPath === path || location.pathname === path;



  const isNavItemActive = (item: any): boolean => {

    if (item?.type === 'link') return isNavLinkActive(item.path);

    if (item?.type === 'group') return Array.isArray(item.children) && item.children.some((c: any) => isNavItemActive(c));

    return false;

  };



  const ensureActiveGroupsExpanded = (items: any[]) => {

    const activeGroupKeys: string[] = [];



    const walk = (node: any) => {

      if (!node) return;

      if (node.type === 'group') {

        const active = isNavItemActive(node);

        if (active) activeGroupKeys.push(node.key);

        if (Array.isArray(node.children)) node.children.forEach(walk);

      }

    };



    items.forEach(walk);



    setExpandedNavGroups((prev) => {

      let changed = false;

      const next = { ...prev };

      for (const key of activeGroupKeys) {

        if (!next[key]) {

          next[key] = true;

          changed = true;

        }

      }

      return changed ? next : prev;

    });

  };



  useEffect(() => {

    ensureActiveGroupsExpanded(navItems as any);

  }, [location.pathname, location.search, user?.rol]);



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

            

            <div className="flex items-center gap-3 cursor-default">

              <img src="/src/assets/logo.jpg" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm" />

              <div className="hidden sm:block">

                <div className="font-display font-bold text-slate-800">Cátedra de Familia</div>

                <div className="text-xs text-slate-500">{user?.institucion || 'Parchando Juntos'}</div>

              </div>

            </div>

          </div>



          <div className="flex items-center gap-4">

            {/* Invite Admin button removido por política */}



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

                onClick={handleLogoutClick}

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

        {/* Sidebar - sticky en desktop, fixed en mobile */}

        <aside className={`

          fixed lg:sticky inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 transform transition-transform duration-200

          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}

          ${isPreview ? 'top-10' : 'top-0'} lg:top-[61px] h-screen lg:h-[calc(100vh-61px)] overflow-y-auto

        `}>

          <div className="p-4 flex justify-between items-center lg:hidden">

            <span className="font-semibold text-slate-800">Menú</span>

            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">

              <IconX size={20} />

            </button>

          </div>

          <nav className="p-3 space-y-1">

            {(() => {

              const renderNavItem = (item: any, depth = 0) => {

                const paddingLeft = 16 + depth * 14;



                if (item?.type === 'link') {

                  const Icon = iconMap[item.icon] || IconHome;

                  const isActive = isNavLinkActive(item.path);

                  return (

                    <Link

                      key={item.path}

                      to={item.path}

                      onClick={() => setSidebarOpen(false)}

                      style={{ paddingLeft }}

                      className={`flex items-center gap-3 py-3 pr-4 rounded-xl transition-all duration-200 ${

                        isActive

                          ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200/50'

                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'

                      }`}

                    >

                      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />

                      <span className="font-medium">{item.label}</span>

                    </Link>

                  );

                }



                if (item?.type === 'group') {

                  const Icon = iconMap[item.icon] || IconHome;

                  const isOpen = !!expandedNavGroups[item.key];

                  const isActive = isNavItemActive(item);



                  return (

                    <div key={item.key} className="space-y-1">

                      <button

                        type="button"

                        onClick={() => setExpandedNavGroups((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}

                        style={{ paddingLeft }}

                        className={`w-full flex items-center gap-3 py-3 pr-4 rounded-xl transition-all duration-200 ${

                          isActive

                            ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-200/50'

                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'

                        }`}

                      >

                        <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />

                        <span className="font-medium flex-1 text-left">{item.label}</span>

                        <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>

                          <IconChevronRight size={18} className={isActive ? 'text-white' : 'text-slate-400'} />

                        </span>

                      </button>



                      {isOpen && Array.isArray(item.children) && (

                        <div className="space-y-1">

                          {item.children.map((child: any) => renderNavItem(child, depth + 1))}

                        </div>

                      )}

                    </div>

                  );

                }



                return null;

              };



              return (navItems as any[]).map((item) => renderNavItem(item, 0));

            })()}

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



      {/* Role Switcher Modal - Solo para roles NO admin */}

      {showRoleSwitcher && !isAdmin && (

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



      {/* Invite Admin Modal removido */}

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

