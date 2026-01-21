import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getInstituciones, getUsuarios, getCursos, getTareas, getSession } from '../api/endpoints';
import { IconUsers, IconInstitution, IconBook, IconClipboard, IconPlus, IconSearch } from '../components/ui/Icons';

export default function DashboardAdminHome() {
  const session = getSession();
  const [counts, setCounts] = useState({ instituciones: 0, usuarios: 0, cursos: 0, tareas: 0 });
  const [ultimasInstituciones, setUltimasInstituciones] = useState<any[]>([]);
  const [ultimosUsuarios, setUltimosUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [inst, users, cursos, tareas] = await Promise.all([
        getInstituciones(),
        getUsuarios(),
        getCursos(),
        getTareas()
      ]);

      setCounts({ instituciones: inst.length, usuarios: users.length, cursos: cursos.length, tareas: tareas.length });
      setUltimasInstituciones(inst.slice(0, 5));
      setUltimosUsuarios(users.slice(0, 5));
    } catch (e) {
      // ignore
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-teal-50 to-white rounded-2xl p-8 shadow flex items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Hola, {session?.user?.nombre || 'Administrador'}</h1>
            <p className="text-slate-600 mt-2">Este es tu panel de control. Aquí puedes revisar el estado del sistema, gestionar instituciones y usuarios, y acceder a reportes.</p>
            <div className="mt-4 flex items-center gap-3">
              <Link to="/dashboard/admin/manage?tab=instituciones" className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl shadow hover:opacity-95">
                <IconInstitution size={18} /> Gestionar Instituciones
              </Link>
              <Link to="/dashboard/admin/manage?tab=usuarios" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50">
                <IconUsers size={18} /> Gestionar Usuarios
              </Link>
            </div>
          </div>
          <div className="w-48 text-right">
            <div className="text-xs text-slate-500">Rol</div>
            <div className="text-lg font-semibold">{session?.user?.rol || ''}</div>
            <div className="mt-4 text-xs text-slate-500">Último acceso</div>
            <div className="text-sm">{(session?.user as any)?.lastLogin ? new Date((session?.user as any).lastLogin).toLocaleString() : '—'}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-slate-500 text-xs">Instituciones</div>
            <div className="text-2xl font-bold mt-2">{counts.instituciones}</div>
            <div className="mt-3 text-xs text-slate-500">Activas y registradas en el sistema</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-slate-500 text-xs">Usuarios</div>
            <div className="text-2xl font-bold mt-2">{counts.usuarios}</div>
            <div className="mt-3 text-xs text-slate-500">Total de cuentas</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-slate-500 text-xs">Cursos</div>
            <div className="text-2xl font-bold mt-2">{counts.cursos}</div>
            <div className="mt-3 text-xs text-slate-500">Cursos creados</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <div className="text-slate-500 text-xs">Tareas</div>
            <div className="text-2xl font-bold mt-2">{counts.tareas}</div>
            <div className="mt-3 text-xs text-slate-500">Tareas activas</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Últimas instituciones */}
          <div className="col-span-2 bg-white p-4 rounded-xl shadow">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Últimas Instituciones</h3>
              <Link to="/dashboard/admin/manage?tab=instituciones" className="text-xs text-teal-600 hover:underline inline-flex items-center gap-1"><IconSearch size={14}/> Ver todas</Link>
            </div>
            <ul className="mt-3 space-y-2">
              {ultimasInstituciones.length === 0 ? (
                <li className="text-xs text-slate-500">No hay instituciones registradas.</li>
              ) : ultimasInstituciones.map(inst => (
                <li key={inst.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{inst.nombre}</div>
                    <div className="text-xs text-slate-500">{inst.municipio_id ? `Municipio ${inst.municipio_id}` : 'Sin municipio'}</div>
                  </div>
                  <div className="text-xs text-slate-500">ID {inst.id}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Atajos / acciones */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold">Accesos rápidos</h3>
            <div className="mt-3 space-y-3">
              <Link to="/dashboard/admin/manage?tab=instituciones" className="block w-full px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100">Crear / editar instituciones</Link>
              <Link to="/dashboard/admin/manage?tab=usuarios" className="block w-full px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100">Crear usuario</Link>
              <Link to="/dashboard/admin/manage?tab=configuracion" className="block w-full px-3 py-2 rounded-lg bg-white border border-slate-200">Configuración del sistema</Link>
            </div>
            <div className="mt-4 text-xs text-slate-500">Sugerencia: usa el modo desarrollo para omitir validaciones si pruebas flujos.</div>
          </div>
        </div>

        {/* Últimos usuarios */}
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Últimos Usuarios</h3>
            <Link to="/dashboard/admin/manage?tab=usuarios" className="text-xs text-teal-600 hover:underline inline-flex items-center gap-1"><IconSearch size={14}/> Ver todos</Link>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-4">
            {ultimosUsuarios.length === 0 ? (
              <div className="text-xs text-slate-500">No hay usuarios</div>
            ) : ultimosUsuarios.map(u => (
              <div key={u.id} className="p-3 border border-slate-100 rounded-lg">
                <div className="font-medium">{u.nombre}</div>
                <div className="text-xs text-slate-500">{u.rol}</div>
                <div className="text-xs text-slate-400">{u.correo}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
