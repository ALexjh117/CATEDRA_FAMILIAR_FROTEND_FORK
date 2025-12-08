import { useState, useEffect } from 'react';
import { getSession, getInstituciones, getCursos, getTareas } from '../api/endpoints';
import { type Institucion, type Curso, type Tarea } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import {
  IconGear,
  IconInstitution,
  IconBook,
  IconUsers,
  IconClipboard,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconPlus
} from '../components/ui/Icons';

export default function DashboardAdminPage() {
  getSession(); // Verificar sesión activa
  
  const [loading, setLoading] = useState(true);
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [activeTab, setActiveTab] = useState<'instituciones' | 'usuarios' | 'configuracion'>('instituciones');
  const [modalInstitucion, setModalInstitucion] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [institucionesData, cursosData, tareasData] = await Promise.all([
        getInstituciones(),
        getCursos(),
        getTareas(),
      ]);

      setInstituciones(institucionesData);
      setCursos(cursosData);
      setTareas(tareasData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando panel administrativo..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header con diseño distintivo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-zinc-800 rounded-2xl p-6 text-white">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <IconGear className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  Panel de Administración
                </h1>
                <p className="text-slate-300 mt-0.5">
                  Gestión de instituciones, usuarios y configuración del sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-teal-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform">
                <IconInstitution className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{instituciones.length}</div>
                <div className="text-sm text-slate-500 font-medium">Instituciones</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-105 transition-transform">
                <IconBook className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{cursos.length}</div>
                <div className="text-sm text-slate-500 font-medium">Cursos</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-105 transition-transform">
                <IconUsers className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">156</div>
                <div className="text-sm text-slate-500 font-medium">Usuarios</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-violet-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 group-hover:scale-105 transition-transform">
                <IconClipboard className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{tareas.length}</div>
                <div className="text-sm text-slate-500 font-medium">Tareas Creadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50">
            <nav className="flex gap-1 p-1.5">
              {[
                { id: 'instituciones', label: 'Instituciones', Icon: IconInstitution },
                { id: 'usuarios', label: 'Usuarios', Icon: IconUsers },
                { id: 'configuracion', label: 'Configuración', Icon: IconGear },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  <tab.Icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Instituciones */}
            {activeTab === 'instituciones' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Instituciones Registradas</h3>
                  <Button onClick={() => setModalInstitucion(true)} className="flex items-center gap-2">
                    <IconPlus size={16} />
                    Nueva Institución
                  </Button>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-sm">Institución</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Cursos</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Familias</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Estado</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {instituciones.map(inst => (
                        <tr key={inst.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
                                <IconInstitution className="text-white" size={18} />
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{inst.nombre}</div>
                                <div className="text-sm text-slate-500">{inst.direccion}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4 font-medium text-slate-700">
                            {cursos.filter(c => c.institucionId === inst.id).length}
                          </td>
                          <td className="text-center py-4 px-4 font-medium text-slate-700">
                            {Math.floor(50 + Math.random() * 200)}
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                              Activa
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                <IconEdit size={18} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <IconTrash size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Usuarios */}
            {activeTab === 'usuarios' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Gestión de Usuarios</h3>
                  <div className="flex gap-3">
                    <select className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all">
                      <option>Todos los roles</option>
                      <option>Docentes</option>
                      <option>Orientadores</option>
                      <option>Coordinadores</option>
                      <option>Rectores</option>
                    </select>
                    <Button className="flex items-center gap-2">
                      <IconPlus size={16} />
                      Nuevo Usuario
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-sm">Usuario</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Rol</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Institución</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Estado</th>
                        <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 2, nombre: 'Carlos García', correo: 'garcia@docente.com', rol: 'Docente', institucion: 'I.E. Ejemplo', activo: true },
                        { id: 3, nombre: 'Ana Martínez', correo: 'orientador@docente.com', rol: 'Orientador', institucion: 'I.E. Ejemplo', activo: true },
                        { id: 4, nombre: 'Luis Rodríguez', correo: 'coordinador@docente.com', rol: 'Coordinador', institucion: 'I.E. Ejemplo', activo: true },
                        { id: 5, nombre: 'Patricia Gómez', correo: 'rector@docente.com', rol: 'Rector', institucion: 'I.E. Ejemplo', activo: false },
                      ].map(usuario => (
                        <tr key={usuario.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                                usuario.rol === 'Docente' ? 'bg-gradient-to-br from-blue-400 to-indigo-600' :
                                usuario.rol === 'Orientador' ? 'bg-gradient-to-br from-violet-400 to-purple-600' :
                                usuario.rol === 'Coordinador' ? 'bg-gradient-to-br from-amber-400 to-orange-600' :
                                'bg-gradient-to-br from-rose-400 to-red-600'
                              }`}>
                                {usuario.nombre.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-slate-800">{usuario.nombre}</div>
                                <div className="text-sm text-slate-500">{usuario.correo}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              usuario.rol === 'Docente' ? 'bg-blue-100 text-blue-700' :
                              usuario.rol === 'Orientador' ? 'bg-violet-100 text-violet-700' :
                              usuario.rol === 'Coordinador' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {usuario.rol}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4 text-slate-600 font-medium">
                            {usuario.institucion}
                          </td>
                          <td className="text-center py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              usuario.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {usuario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="text-center py-4 px-4">
                            <div className="flex justify-center gap-1">
                              <button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                                <IconEdit size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab: Configuración */}
            {activeTab === 'configuracion' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-800">Configuración del Sistema</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Categorías */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <IconClipboard className="text-slate-500" size={18} />
                        Categorías de Tareas
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      {[
                        { nombre: 'Comunicación', color: '#3B82F6' },
                        { nombre: 'Tiempo en Familia', color: '#10B981' },
                        { nombre: 'Valores', color: '#F59E0B' },
                        { nombre: 'Responsabilidades', color: '#8B5CF6' },
                        { nombre: 'Bienestar', color: '#EC4899' },
                      ].map(cat => (
                        <div key={cat.nombre} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: cat.color }} />
                            <span className="font-medium text-slate-700">{cat.nombre}</span>
                          </div>
                          <button className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                            <IconEdit size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 pb-4">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                        <IconPlus size={14} />
                        Agregar categoría
                      </Button>
                    </div>
                  </div>
                  
                  {/* Período académico */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                        <IconCalendar className="text-slate-500" size={18} />
                        Período Académico
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50/30 rounded-xl border border-teal-200/60">
                        <div>
                          <div className="font-semibold text-teal-800">Período 4 - 2024</div>
                          <div className="text-sm text-teal-600/80">Activo actualmente</div>
                        </div>
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                          Activo
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <div className="font-medium text-slate-700">Período 3 - 2024</div>
                          <div className="text-sm text-slate-500">Sep 1 - Nov 15</div>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">
                          Cerrado
                        </span>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <Button variant="secondary" size="sm">
                        Gestionar períodos
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Nueva Institución */}
      <Modal
        isOpen={modalInstitucion}
        onClose={() => setModalInstitucion(false)}
        title="Nueva Institución"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldInput
            name="nombre"
            label="Nombre de la institución"
            placeholder="I.E. Nombre de la institución"
            required
          />
          <FormFieldInput
            name="direccion"
            label="Dirección"
            placeholder="Calle 00 # 00-00"
          />
          <FormFieldInput
            name="telefono"
            label="Teléfono"
            placeholder="6041234567"
          />
          <FormFieldInput
            name="rector"
            label="Correo del rector"
            type="email"
            placeholder="rector@institucion.edu.co"
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setModalInstitucion(false)}>
              Cancelar
            </Button>
            <Button>
              Crear Institución
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
