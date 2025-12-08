import { useState, useEffect } from 'react';
import { getSession, getTareasByDocente, getEntregasPendientesCalificar, getEstadisticasDocente, getCursos } from '../api/endpoints';
import { type Tarea, type Entrega, type Curso } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import TareaCard from '../components/TareaCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import { categoriasMock } from '../mocks/data';
import { 
  IconClipboard, 
  IconHourglass, 
  IconCheckCircle, 
  IconUsers, 
  IconClock,
  IconFileText,
  IconPlus
} from '../components/ui/Icons';

export default function DashboardDocentePage() {
  const session = getSession();
  const user = session?.user;
  
  const [loading, setLoading] = useState(true);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [entregasPendientes, setEntregasPendientes] = useState<Entrega[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'activas' | 'cerradas'>('todas');
  const [modalNuevaTarea, setModalNuevaTarea] = useState(false);
  const [modalCalificar, setModalCalificar] = useState<{ open: boolean; entrega: Entrega | null }>({ open: false, entrega: null });

  // Form states
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    categoriaId: 1,
    cursoId: 1,
    fechaLimite: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const docenteId = user?.id || 2;
      
      const [tareasData, entregasData, cursosData, statsData] = await Promise.all([
        getTareasByDocente(docenteId),
        getEntregasPendientesCalificar(docenteId),
        getCursos(),
        getEstadisticasDocente(docenteId),
      ]);

      setTareas(tareasData);
      setEntregasPendientes(entregasData);
      setCursos(cursosData);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTarea = async () => {
    // TODO: Implement crear tarea API call
    console.log('Crear tarea:', nuevaTarea);
    setModalNuevaTarea(false);
    setNuevaTarea({
      titulo: '',
      descripcion: '',
      categoriaId: 1,
      cursoId: 1,
      fechaLimite: '',
    });
    // Reload data
    await loadData();
  };

  const handleCalificar = async (entregaId: number, calificacion: number, retroalimentacion: string) => {
    // TODO: Implement calificar API call
    console.log('Calificar:', { entregaId, calificacion, retroalimentacion });
    setModalCalificar({ open: false, entrega: null });
    await loadData();
  };

  const tareasFiltradas = tareas.filter(t => {
    if (filtroEstado === 'todas') return true;
    const fechaLimite = new Date(t.fechaVencimiento);
    const hoy = new Date();
    if (filtroEstado === 'activas') return fechaLimite >= hoy;
    return fechaLimite < hoy;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando tu panel..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header con gradiente sutil */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">
                Bienvenido, <span className="text-teal-600">{user?.nombre}</span>
              </h1>
              <p className="text-slate-600 mt-1">
                Gestiona tus tareas familiares y califica las entregas
              </p>
            </div>
            
            <Button onClick={() => setModalNuevaTarea(true)} className="flex items-center gap-2">
              <IconPlus size={18} />
              Nueva Tarea
            </Button>
          </div>
        </div>

        {/* Estadísticas con diseño card moderno */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-teal-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform">
                <IconClipboard className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estadisticas?.tareasActivas || 0}</div>
                <div className="text-sm text-slate-500 font-medium">Tareas Activas</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-amber-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/50 group-hover:scale-105 transition-transform">
                <IconHourglass className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{entregasPendientes.length}</div>
                <div className="text-sm text-slate-500 font-medium">Por Calificar</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-105 transition-transform">
                <IconCheckCircle className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estadisticas?.entregasCalificadas || 0}</div>
                <div className="text-sm text-slate-500 font-medium">Calificadas</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-violet-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 group-hover:scale-105 transition-transform">
                <IconUsers className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estadisticas?.familiasTotales || 0}</div>
                <div className="text-sm text-slate-500 font-medium">Familias</div>
              </div>
            </div>
          </div>
        </div>

        {/* Entregas Pendientes de Calificar */}
        {entregasPendientes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <IconClock className="text-amber-500" size={22} />
                Entregas Pendientes de Calificar
                <span className="ml-auto px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded-full font-semibold">
                  {entregasPendientes.length} pendiente{entregasPendientes.length !== 1 && 's'}
                </span>
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {entregasPendientes.map(entrega => (
                <div key={entrega.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <IconFileText className="text-slate-500" size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">
                        Entrega de Tarea #{entrega.tareaId}
                      </div>
                      <div className="text-sm text-slate-500">
                        Estudiante #{entrega.estudianteId} • {new Date(entrega.fechaEntrega).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setModalCalificar({ open: true, entrega })}
                  >
                    Calificar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mis Tareas */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <IconClipboard className="text-teal-500" size={24} />
              Mis Tareas
            </h2>
            
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              {(['todas', 'activas', 'cerradas'] as const).map(estado => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filtroEstado === estado
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {tareasFiltradas.length === 0 ? (
            <EmptyState
              title="No hay tareas"
              description="Crea tu primera tarea familiar para comenzar"
              icon={<IconFileText className="text-slate-400" size={56} />}
              action={{
                label: "Crear primera tarea",
                onClick: () => setModalNuevaTarea(true)
              }}
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tareasFiltradas.map(tarea => (
                <TareaCard
                  key={tarea.id}
                  tarea={tarea}
                  viewMode="docente"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva Tarea */}
      <Modal
        isOpen={modalNuevaTarea}
        onClose={() => setModalNuevaTarea(false)}
        title="Nueva Tarea Familiar"
        size="lg"
      >
        <div className="space-y-4">
          <FormFieldInput
            name="titulo"
            label="Título de la tarea"
            placeholder="Ej: Lectura en familia"
            value={nuevaTarea.titulo}
            onChange={(e) => setNuevaTarea({ ...nuevaTarea, titulo: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none min-h-[100px]"
              placeholder="Describe la actividad que la familia debe realizar..."
              value={nuevaTarea.descripcion}
              onChange={(e) => setNuevaTarea({ ...nuevaTarea, descripcion: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none"
                value={nuevaTarea.categoriaId}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, categoriaId: Number(e.target.value) })}
              >
                {categoriasMock.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Curso
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none"
                value={nuevaTarea.cursoId}
                onChange={(e) => setNuevaTarea({ ...nuevaTarea, cursoId: Number(e.target.value) })}
              >
                {cursos.map(curso => (
                  <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <FormFieldInput
            name="fechaLimite"
            label="Fecha límite"
            type="date"
            value={nuevaTarea.fechaLimite}
            onChange={(e) => setNuevaTarea({ ...nuevaTarea, fechaLimite: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setModalNuevaTarea(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCrearTarea}>
              Crear Tarea
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Calificar */}
      <Modal
        isOpen={modalCalificar.open}
        onClose={() => setModalCalificar({ open: false, entrega: null })}
        title="Calificar Entrega"
        size="lg"
      >
        {modalCalificar.entrega && (
          <CalificarEntregaForm
            entrega={modalCalificar.entrega}
            onSubmit={handleCalificar}
            onCancel={() => setModalCalificar({ open: false, entrega: null })}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
}

// Component for grading form
function CalificarEntregaForm({ 
  entrega, 
  onSubmit, 
  onCancel 
}: { 
  entrega: Entrega;
  onSubmit: (entregaId: number, calificacion: number, retroalimentacion: string) => void;
  onCancel: () => void;
}) {
  const [calificacion, setCalificacion] = useState<number>(5);
  const [retroalimentacion, setRetroalimentacion] = useState('');

  return (
    <div className="space-y-4">
      {/* Preview de la entrega */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-5 border border-slate-200">
        <div className="text-sm text-slate-500 mb-2 font-medium">Evidencia enviada:</div>
        <p className="text-slate-700">{entrega.textoEvidencia || 'Sin descripción'}</p>
        {entrega.archivos && entrega.archivos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {entrega.archivos.map((archivo, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-white rounded-lg text-sm text-teal-600 border border-teal-200 font-medium flex items-center gap-1.5 shadow-sm">
                <IconFileText size={14} />
                {archivo}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selector de calificación */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Calificación
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(nota => (
            <button
              key={nota}
              onClick={() => setCalificacion(nota)}
              className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${
                calificacion === nota
                  ? 'bg-teal-500 text-white scale-110 shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {nota}
            </button>
          ))}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {calificacion <= 2 && 'Necesita mejorar'}
          {calificacion === 3 && 'Aceptable'}
          {calificacion === 4 && 'Bueno'}
          {calificacion === 5 && 'Excelente'}
        </div>
      </div>

      {/* Retroalimentación */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Retroalimentación (opcional)
        </label>
        <textarea
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none min-h-[100px]"
          placeholder="Escribe un mensaje para la familia sobre su actividad..."
          value={retroalimentacion}
          onChange={(e) => setRetroalimentacion(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSubmit(entrega.id, calificacion, retroalimentacion)}>
          Guardar Calificación
        </Button>
      </div>
    </div>
  );
}
