import { useState, useEffect } from 'react';
import { getTareas, getCursos, getDocentesCoordinador } from '../api/endpoints';
import { type Tarea, type Curso, type Usuario } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TareaCard from '../components/TareaCard';
import { exportToExcel } from '../utils/exportUtils';
import { 
  IconClipboard,
  IconSearch,
  IconFilter,
  IconBook,
  IconUsers,
  IconDownload,
  IconEye,
  IconClock,
  IconCheckCircle
} from '../components/ui/Icons';

export default function VerTareasTodosCursos() {
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredTareas, setFilteredTareas] = useState<Tarea[]>([]);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todas' | 'activa' | 'completada' | 'vencida'>('todas');
  const [filterCurso, setFilterCurso] = useState<number | 'todos'>('todos');
  const [filterDocente, setFilterDocente] = useState<number | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<'fecha' | 'titulo' | 'estado'>('fecha');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tareas, searchTerm, filterEstado, filterCurso, filterDocente, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Usar getDocentesCoordinador en lugar de getUsuarios (evita 403)
      const [tareasData, cursosData, docentesData] = await Promise.all([
        getTareas(),
        getCursos(),
        getDocentesCoordinador()
      ]);

      setTareas(Array.isArray(tareasData) ? tareasData : []);
      setCursos(Array.isArray(cursosData) ? cursosData : []);
      // Mapear docentes al formato Usuario
      const docentesArray = Array.isArray(docentesData) ? docentesData : [];
      const usuariosMapped = docentesArray.map((d: any) => ({
        id: d.usuarioId || d.id,
        nombre: d.nombres || d.nombre || '',
        apellidos: d.apellidos || d.apellido || '',
        rol: 'docente_aula',
        activo: d.estaActivo ?? true
      } as Usuario));
      setUsuarios(usuariosMapped);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tareas];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(tarea =>
        tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filterEstado !== 'todas') {
      filtered = filtered.filter(tarea => tarea.estado === filterEstado);
    }

    // Filtro por curso
    if (filterCurso !== 'todos') {
      filtered = filtered.filter(tarea => tarea.cursoId === filterCurso);
    }

    // Filtro por docente
    if (filterDocente !== 'todos') {
      filtered = filtered.filter(tarea => tarea.docenteId === filterDocente);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'titulo':
          return a.titulo.localeCompare(b.titulo);
        case 'estado':
          return a.estado.localeCompare(b.estado);
        case 'fecha':
        default:
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
      }
    });

    setFilteredTareas(filtered);
  };

  const getCursoNombre = (cursoId: number) => {
    return cursos.find(c => c.id === cursoId)?.nombre || 'Sin curso';
  };

  const getDocenteNombre = (docenteId?: number) => {
    if (!docenteId) return 'Sin asignar';
    const docente = usuarios.find(u => u.id === docenteId);
    return docente ? `${docente.nombre} ${docente.apellidos}` : 'Sin asignar';
  };

  const exportarTareas = () => {
    const data = filteredTareas.map(tarea => ({
      'ID': tarea.id,
      'Título': tarea.titulo,
      'Descripción': tarea.descripcion.substring(0, 100) + (tarea.descripcion.length > 100 ? '...' : ''),
      'Curso': getCursoNombre(tarea.cursoId),
      'Docente': getDocenteNombre(tarea.docenteId),
      'Estado': tarea.estado,
      'Fecha Creación': new Date(tarea.fechaCreacion).toLocaleDateString(),
      'Fecha Límite': tarea.fechaLimite ? new Date(tarea.fechaLimite).toLocaleDateString() : 'Sin límite',
      'Categoría': tarea.categoria || 'Sin categoría'
    }));

    exportToExcel(data, 'Tareas_Todos_Cursos', 'Tareas');
  };

  const docentes = usuarios.filter(u => u.rol === 'docente_aula');
  
  const estadisticas = {
    total: filteredTareas.length,
    activas: filteredTareas.filter(t => t.estado === 'activa').length,
    completadas: filteredTareas.filter(t => t.estado === 'completada').length,
    vencidas: filteredTareas.filter(t => t.estado === 'vencida').length
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">Tareas de Todos los Cursos</h1>
              <p className="text-indigo-100 mt-1">
                Vista consolidada de todas las tareas del sistema
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0 text-indigo-100">
              <div className="text-center">
                <div className="text-xl font-bold">{estadisticas.total}</div>
                <div className="text-xs">Total</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{estadisticas.activas}</div>
                <div className="text-xs">Activas</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">{estadisticas.completadas}</div>
                <div className="text-xs">Completadas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <IconClipboard className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estadisticas.total}</div>
                <div className="text-sm text-slate-500 font-medium">Total Tareas</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <IconCheckCircle className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estadisticas.activas}</div>
                <div className="text-sm text-slate-500 font-medium">Activas</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <IconBook className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estadisticas.completadas}</div>
                <div className="text-sm text-slate-500 font-medium">Completadas</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <IconClock className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estadisticas.vencidas}</div>
                <div className="text-sm text-slate-500 font-medium">Vencidas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y controles */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="grid md:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2 relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por estado */}
            <div className="relative">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as typeof filterEstado)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="todas">Todos los estados</option>
                <option value="activa">Activas</option>
                <option value="completada">Completadas</option>
                <option value="vencida">Vencidas</option>
              </select>
              <IconFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Filtro por curso */}
            <div className="relative">
              <select
                value={filterCurso}
                onChange={(e) => setFilterCurso(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="todos">Todos los cursos</option>
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                ))}
              </select>
              <IconBook className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Filtro por docente */}
            <div className="relative">
              <select
                value={filterDocente}
                onChange={(e) => setFilterDocente(e.target.value === 'todos' ? 'todos' : parseInt(e.target.value))}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="todos">Todos los docentes</option>
                {docentes.map(docente => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombre} {docente.apellidos}
                  </option>
                ))}
              </select>
              <IconUsers className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Exportar */}
            <button
              onClick={exportarTareas}
              className="px-4 py-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <IconDownload size={18} />
              Exportar
            </button>
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Mostrando {filteredTareas.length} de {tareas.length} tareas
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="fecha">Fecha</option>
                <option value="titulo">Título</option>
                <option value="estado">Estado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de tareas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <IconEye size={20} />
              Todas las Tareas ({filteredTareas.length})
            </h3>
          </div>

          {filteredTareas.length === 0 ? (
            <div className="p-12 text-center">
              <IconClipboard className="mx-auto text-gray-300 mb-4" size={48} />
              <h4 className="text-lg font-medium text-gray-500">No se encontraron tareas</h4>
              <p className="text-gray-400 mt-1">Ajusta los filtros para ver más resultados</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTareas.map(tarea => (
                <div key={tarea.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header de la tarea */}
                      <div className="flex items-center gap-4 mb-3">
                        <h4 className="font-bold text-gray-800 text-lg">{tarea.titulo}</h4>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tarea.estado === 'activa' ? 'bg-green-100 text-green-700' :
                          tarea.estado === 'completada' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tarea.estado}
                        </div>
                      </div>

                      {/* Información de la tarea */}
                      <div className="text-gray-600 mb-3">
                        <p className="mb-2 line-clamp-2">{tarea.descripcion}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <IconBook size={14} />
                            <span>Curso: {getCursoNombre(tarea.cursoId)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconUsers size={14} />
                            <span>Docente: {getDocenteNombre(tarea.docenteId)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconClock size={14} />
                            <span>Creada: {new Date(tarea.fechaCreacion).toLocaleDateString()}</span>
                          </div>
                          {tarea.fechaLimite && (
                            <div className="flex items-center gap-1">
                              <IconClock size={14} />
                              <span>Límite: {new Date(tarea.fechaLimite).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Etiquetas adicionales */}
                      <div className="flex items-center gap-2">
                        {tarea.categoria && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                            {tarea.categoria.nombre}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                          ID: {tarea.id}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2"
                      >
                        <IconEye size={14} />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}