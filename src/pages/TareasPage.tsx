import { useState, useEffect } from 'react';
import { getSession } from '../api/endpoints';
import apiClient from '../api/apiClient';
import DashboardLayout from '../components/DashboardLayout';
import OrientadorLayout from '../components/orientador-acudiente/OrientadorLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { IconPlus, IconFileText, IconUsers, IconBook, IconEdit, IconTrash } from '../components/ui/Icons';
 import Swal from 'sweetalert2';

// ⚠️ DATOS HARDCODEADOS TEMPORALES - Mientras el backend configura las categorías
const CATEGORIAS_MOCK = [
  { id: 1, nombre: 'Valores y Convivencia' },
  { id: 2, nombre: 'Desarrollo Personal' },
  { id: 3, nombre: 'Comunicación Familiar' },
  { id: 4, nombre: 'Resolución de Conflictos' },
  { id: 5, nombre: 'Acompañamiento Académico' }
];

const GRADOS = [
  { id: 6, nombre: 'Sexto' },
  { id: 7, nombre: 'Séptimo' },
  { id: 8, nombre: 'Octavo' },
  { id: 9, nombre: 'Noveno' },
  { id: 10, nombre: 'Décimo' },
  { id: 11, nombre: 'Once' }
];

interface BancoTarea {
  id: number;
  titulo: string;
  descripcion: string;
  enlace: string | null;
  categoriaId: number;
  tema: string | null;
  entregableEsperado: string | null;
  gradosObjetivo: number[] | null;
  esMultiGrado: boolean;
  tipoCalificacion: 'cualitativa' | 'cuantitativa';
  criteriosAutomaticos: any | null;
  vecesUtilizada: number;
  creadoEn: string;
  actualizadoEn: string;
}

export default function TareasPage() {
  const session = getSession();
  const user = session?.user;
  const userRole = user?.rol;

  const Layout = userRole === 'orientador' ? OrientadorLayout : DashboardLayout;

  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<BancoTarea[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalCategoria, setModalCategoria] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<BancoTarea | null>(null);

  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>(CATEGORIAS_MOCK);

  const [savingCategoria, setSavingCategoria] = useState(false);
  const [formCategoria, setFormCategoria] = useState({
    nombre: '',
    descripcion: '',
    icono: '',
  });

  // Formulario para crear tarea
  const [formTarea, setFormTarea] = useState({
    titulo: '',
    descripcion: '',
    categoriaId: 1, // ⚠️ Hardcoded temporal
    tema: '',
    enlace: '',
    entregableEsperado: '',
    gradosObjetivo: [] as number[],
    esMultiGrado: false,
    tipoCalificacion: 'cualitativa' as 'cualitativa' | 'cuantitativa'
  });

  useEffect(() => {
    loadTareas();
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const result = await apiClient.getCategorias();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const mapped = result.data.map((c: any) => ({
          id: Number(c.id),
          nombre: c.nombre || ''
        })).filter((c: any) => !!c.nombre);
        setCategorias(mapped.length > 0 ? mapped : CATEGORIAS_MOCK);
      } else {
        setCategorias(CATEGORIAS_MOCK);
      }
    } catch (e) {
      setCategorias(CATEGORIAS_MOCK);
    }
  };

  const loadTareas = async () => {
    try {
      setLoading(true);
      console.log('📞 [Tareas] Cargando tareas del banco...');
      
      const result = await apiClient.getTareas();
      console.log('📥 [Tareas] Respuesta:', result);
      
      if (result.success && result.data) {
        setTareas(result.data);
        console.log('✅ [Tareas] Tareas cargadas:', result.data.length);
      } else {
        console.warn('⚠️ [Tareas] No se pudieron cargar las tareas');
        setTareas([]);
      }
    } catch (error) {
      console.error('❌ [Tareas] Error al cargar tareas:', error);
      setTareas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTarea = async () => {
    try {
      console.log('📤 [Tareas] Creando tarea:', formTarea);
      
      // Validaciones básicas
      if (!formTarea.titulo.trim() || !formTarea.descripcion.trim()) {
        alert('El título y la descripción son obligatorios');
        return;
      }

      const result = await apiClient.createTarea(formTarea);
      console.log('📥 [Tareas] Respuesta crear:', result);

      if (result.success) {
        alert('✅ Tarea creada exitosamente');
        setModalCrear(false);
        resetForm();
        loadTareas();
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ [Tareas] Error al crear tarea:', error);
      alert('Error al crear la tarea');
    }
  };

  const resetForm = () => {
    setFormTarea({
      titulo: '',
      descripcion: '',
      categoriaId: 1,
      tema: '',
      enlace: '',
      entregableEsperado: '',
      gradosObjetivo: [],
      esMultiGrado: false,
      tipoCalificacion: 'cualitativa'
    });
  };

  const resetFormCategoria = () => {
    setFormCategoria({
      nombre: '',
      descripcion: '',
      icono: '',
    });
  };

  const handleCrearCategoria = async () => {
    const nombre = formCategoria.nombre.trim();
    if (!nombre || nombre.length < 2) {
      alert('El nombre de la categoría es obligatorio (mínimo 2 caracteres)');
      return;
    }

    const nombreLower = nombre.toLowerCase();
    const existeLocal = categorias.some((c) => (c?.nombre || '').trim().toLowerCase() === nombreLower);
    if (existeLocal) {
      alert('Ya existe una categoría con ese nombre');
      return;
    }

    setSavingCategoria(true);
    try {
      const result = await apiClient.createCategoria({
        nombre,
        descripcion: formCategoria.descripcion.trim() ? formCategoria.descripcion.trim() : null,
        icono: formCategoria.icono.trim() ? formCategoria.icono.trim() : null,
      });

      if (result.success) {
        await Swal.fire({
          title: 'Categoría creada',
          text: 'Ya se creó la categoría.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#4f46e5'
        });
        setModalCategoria(false);
        resetFormCategoria();
        await loadCategorias();
      } else {
        const msg = result.message || 'No se pudo crear la categoría';
        const isDuplicada =
          msg.toLowerCase().includes('categorias_nombre_key') ||
          msg.toLowerCase().includes('llave duplicada') ||
          msg.toLowerCase().includes('duplicate key') ||
          msg.toLowerCase().includes('unique') ||
          msg.toLowerCase().includes('unicidad');
        if (isDuplicada) {
          alert('Ya existe una categoría con ese nombre');
        } else {
          alert(`❌ Error: ${msg}`);
        }
      }
    } catch (e: any) {
      const msg = e?.message || 'Error al crear la categoría';
      const isDuplicada =
        String(msg).toLowerCase().includes('categorias_nombre_key') ||
        String(msg).toLowerCase().includes('llave duplicada') ||
        String(msg).toLowerCase().includes('duplicate key') ||
        String(msg).toLowerCase().includes('unique') ||
        String(msg).toLowerCase().includes('unicidad');
      if (isDuplicada) {
        alert('Ya existe una categoría con ese nombre');
      } else {
        alert(msg);
      }
    } finally {
      setSavingCategoria(false);
    }
  };

  const handleAsignarTarea = (tarea: BancoTarea) => {
    setTareaSeleccionada(tarea);
    setModalAsignar(true);
  };

  const tareasFiltradas = tareas.filter(tarea => {
    const matchBusqueda = !busqueda || 
      tarea.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      tarea.tema?.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchCategoria = !categoriaFiltro || tarea.categoriaId === categoriaFiltro;
    
    return matchBusqueda && matchCategoria;
  });

  const getCategoriaName = (id: number) => {
    return CATEGORIAS_MOCK.find(c => c.id === id)?.nombre || 'Sin categoría';
  };

  const getGradosText = (gradosIds: number[] | null) => {
    if (!gradosIds || gradosIds.length === 0) return 'Todos los grados';
    return gradosIds.map(id => GRADOS.find(g => g.id === id)?.nombre || id).join(', ');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando tareas..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Banco de Tareas</h1>
          <p className="text-slate-600 mt-1">Gestiona las tareas de Cátedra de Familia</p>
        </div>
        <div className="flex items-center gap-2">
          {(userRole === 'orientador' || userRole === 'docente_aula') && (
            <button
              onClick={() => setModalCrear(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md"
            >
              <IconPlus size={20} />
              Nueva Tarea
            </button>
          )}

          <button
            onClick={() => setModalCategoria(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            <IconPlus size={20} />
            Más categoría
          </button>
        </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por título o tema..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Categoría <span className="text-xs text-amber-600">(Datos temporales)</span>
              </label>
              <select
                value={categoriaFiltro || ''}
                onChange={(e) => setCategoriaFiltro(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">Total Tareas</p>
                <p className="text-3xl font-bold mt-1">{tareas.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <IconFileText size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Resultados</p>
                <p className="text-3xl font-bold mt-1">{tareasFiltradas.length}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <IconBook size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Más Usadas</p>
                <p className="text-3xl font-bold mt-1">
                  {tareas.reduce((max, t) => Math.max(max, t.vecesUtilizada || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <IconUsers size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Tareas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tareasFiltradas.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              <IconFileText className="mx-auto mb-3 text-slate-400" size={48} />
              <p className="font-medium">No hay tareas disponibles</p>
              {busqueda && <p className="text-sm text-slate-400 mt-1">No se encontraron resultados para "{busqueda}"</p>}
            </div>
          ) : (
            tareasFiltradas.map((tarea) => (
              <div key={tarea.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 text-lg">{tarea.titulo}</h3>
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold">
                    {tarea.vecesUtilizada || 0} usos
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{tarea.descripcion}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                      {getCategoriaName(tarea.categoriaId)}
                    </span>
                    {tarea.tema && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">
                        {tarea.tema}
                      </span>
                    )}
                  </div>
                  
                  {tarea.gradosObjetivo && tarea.gradosObjetivo.length > 0 && (
                    <div className="text-xs text-slate-600">
                      📚 {getGradosText(tarea.gradosObjetivo)}
                    </div>
                  )}
                  
                  <div className="text-xs text-slate-500">
                    Calificación: <span className="font-medium">{tarea.tipoCalificacion}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAsignarTarea(tarea)}
                    className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    Asignar
                  </button>
                  {(userRole === 'orientador' || userRole === 'docente_aula') && (
                    <>
                      <button className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                        <IconEdit size={16} />
                      </button>
                      <button className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                        <IconTrash size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Crear Tarea */}
        {modalCrear && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Nueva Tarea</h2>
                <button onClick={() => { setModalCrear(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                  ⚠️ <strong>Nota temporal:</strong> La categoría está fija en "Valores y Convivencia" mientras el backend configura las categorías.
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Título *</label>
                  <input
                    type="text"
                    value={formTarea.titulo}
                    onChange={(e) => setFormTarea({...formTarea, titulo: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ej: Taller de Valores Familiares"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descripción *</label>
                  <textarea
                    value={formTarea.descripcion}
                    onChange={(e) => setFormTarea({...formTarea, descripcion: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Describe la actividad..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tema</label>
                    <input
                      type="text"
                      value={formTarea.tema}
                      onChange={(e) => setFormTarea({...formTarea, tema: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Ej: Comunicación"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Enlace</label>
                    <input
                      type="url"
                      value={formTarea.enlace}
                      onChange={(e) => setFormTarea({...formTarea, enlace: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Entregable Esperado</label>
                  <textarea
                    value={formTarea.entregableEsperado}
                    onChange={(e) => setFormTarea({...formTarea, entregableEsperado: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ej: Reflexión escrita (1 página)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Grados Objetivo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GRADOS.map(grado => (
                      <label key={grado.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formTarea.gradosObjetivo.includes(grado.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormTarea({...formTarea, gradosObjetivo: [...formTarea.gradosObjetivo, grado.id]});
                            } else {
                              setFormTarea({...formTarea, gradosObjetivo: formTarea.gradosObjetivo.filter(id => id !== grado.id)});
                            }
                          }}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        {grado.nombre}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formTarea.esMultiGrado}
                      onChange={(e) => setFormTarea({...formTarea, esMultiGrado: e.target.checked})}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    Es multi-grado
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Calificación</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        checked={formTarea.tipoCalificacion === 'cualitativa'}
                        onChange={() => setFormTarea({...formTarea, tipoCalificacion: 'cualitativa'})}
                        className="border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      Cualitativa
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        checked={formTarea.tipoCalificacion === 'cuantitativa'}
                        onChange={() => setFormTarea({...formTarea, tipoCalificacion: 'cuantitativa'})}
                        className="border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      Cuantitativa
                    </label>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
                <button
                  onClick={() => { setModalCrear(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearTarea}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Crear Tarea
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Crear Categoría */}
        {modalCategoria && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Nueva Categoría</h2>
                <button onClick={() => { setModalCategoria(false); resetFormCategoria(); }} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formCategoria.nombre}
                    onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ej: Matemáticas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                  <textarea
                    value={formCategoria.descripcion}
                    onChange={(e) => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Descripción opcional..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Icono</label>
                    <input
                      type="text"
                      value={formCategoria.icono}
                      onChange={(e) => setFormCategoria({ ...formCategoria, icono: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="calculator"
                    />
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
                <button
                  onClick={() => { setModalCategoria(false); resetFormCategoria(); }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                  disabled={savingCategoria}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearCategoria}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                  disabled={savingCategoria}
                >
                  {savingCategoria ? 'Creando...' : 'Crear Categoría'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Asignar (Placeholder) */}
        {modalAsignar && tareaSeleccionada && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-slate-800">Asignar Tarea</h2>
                <button onClick={() => { setModalAsignar(false); setTareaSeleccionada(null); }} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-2">🚧 Funcionalidad en desarrollo</p>
                  <p>El backend está preparando el endpoint <code className="bg-blue-100 px-1 rounded">POST /asignaciones</code></p>
                  <p className="mt-2">Tarea seleccionada: <strong>{tareaSeleccionada.titulo}</strong></p>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl">
                <button
                  onClick={() => { setModalAsignar(false); setTareaSeleccionada(null); }}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
