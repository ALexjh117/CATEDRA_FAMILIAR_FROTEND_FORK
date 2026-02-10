import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  IconHome,
  IconBarChart,
  IconUsers,
  IconGraduationCap,
  IconBuilding,
  IconFamily,
  IconTrendingUp,
  IconChevronRight
} from '../ui/Icons';

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  home: IconHome,
  dashboard: IconBarChart,
  users: IconUsers,
  courses: IconGraduationCap,
  institutions: IconBuilding,
  family: IconFamily,
  reports: IconTrendingUp,
};

type NavItemLink = { type: 'link'; path: string; label: string; icon: string };
type NavItemGroup = { type: 'group'; key: string; label: string; icon: string; children: NavItem[] };
type NavItem = NavItemLink | NavItemGroup;

const navItems: NavItem[] = [
  { type: 'link', path: '/dashboard', label: 'Inicio', icon: 'home' },
  { type: 'link', path: '/dashboard/orientador', label: 'Mi Panel', icon: 'dashboard' },
  { type: 'link', path: '/tareas', label: 'Tareas', icon: 'dashboard' },
  { type: 'link', path: '/docentes', label: 'Docentes', icon: 'users' },
  { type: 'link', path: '/padres-familia', label: 'Padres de Familia', icon: 'family' },
  {
    type: 'group',
    key: 'mi-institucion',
    label: 'Estudiantes',
    icon: 'institutions',
    children: [
      { type: 'link', path: '/estudiantes', label: 'Todos los estudiantes', icon: 'users' },
      { type: 'link', path: '/cursos', label: 'Cursos', icon: 'courses' },
    ],
  },
  { type: 'link', path: '/reportes/orientador', label: 'Reportes', icon: 'reports' },
  { type: 'link', path: '/perfil', label: 'Mi Perfil', icon: 'users' },
];

export default function SidebarOrientador() {
  const location = useLocation();
  const [expandedNavGroups, setExpandedNavGroups] = useState<Record<string, boolean>>({});

  const fullPath = location.pathname + (location.search || '');

  const isNavLinkActive = (path: string) => fullPath === path || location.pathname === path;

  const isNavItemActive = (item: NavItem): boolean => {
    if (item.type === 'link') return isNavLinkActive(item.path);
    return Array.isArray(item.children) && item.children.some((c) => isNavItemActive(c));
  };

  useEffect(() => {
    const activeGroupKeys: string[] = [];

    const walk = (node: NavItem) => {
      if (node.type === 'group') {
        const active = isNavItemActive(node);
        if (active) activeGroupKeys.push(node.key);
        if (Array.isArray(node.children)) node.children.forEach(walk);
      }
    };

    navItems.forEach(walk);

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
  }, [location.pathname, location.search]);

  const renderNavItem = (item: NavItem, depth = 0) => {
    const paddingLeft = 16 + depth * 14;

    if (item.type === 'link') {
      const Icon = iconMap[item.icon] || IconHome;
      const isActive = isNavLinkActive(item.path);
      return (
        <Link
          key={item.path}
          to={item.path}
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
            {item.children.map((child) => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 h-screen overflow-y-auto">
      <nav className="p-3 space-y-1">{navItems.map((item) => renderNavItem(item, 0))}</nav>
    </aside>
  );
}
