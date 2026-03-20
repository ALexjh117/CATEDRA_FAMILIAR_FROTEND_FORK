import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getSession } from '../api/endpoints';

interface Docente {
  nombre: string;
  correo: string;
}

interface TareaEspecial {
  id: number;
  asignacionId: number;
  titulo: string;
  descripcion: string;
  descripcionCorta: string;
  categoria: string;
  fechaPublicacion: string;
  fechaVencimiento: string;
  diasRestantes: number;
  frecuencia: string;
  estado: 'pendiente' | 'entregada' | 'calificada' | 'vencida';
  tipoCalificacion: string;
  esUrgente: boolean;
  esIndividual: boolean;
  puntajeMaximo: number;
  nota: number | null;
  docente: Docente;
  entregado: boolean;
  calificado: boolean;
}

interface Meta {
  periodo: {
    id: number;
    nombre: string;
  };
  total: number;
  pendientes: number;
  entregadas: number;
  calificadas: number;
  ultimaSincronizacion: string;
  estudiante: {
    id: number;
    nombres: string;
    apellidos: string;
  };
}

export default function MisTareasEspecialesPage() {
  const navigate = useNavigate();
  const session = getSession();
  
  const [tareas, setTareas] = useState<TareaEspecial[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState<string|number>('');
  const [periodos, setPeriodos] = useState<any[]>([]);

  const fetchMisTareasEspeciales = async (periodoId?: number) => {
    try {
      const params = new URLSearchParams();
      if (periodoId) params.append('periodo', periodoId.toString());

      const response = await fetch(`/api/estudiantes/mis-tareas-especiales?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Tareas especiales encontradas:', data.total);
        return data;
      } else {
        throw new Error(data.message || 'Error al cargar tareas especiales');
      }
    } catch (error) {
      console.error('Error obteniendo tareas especiales:', error);
      throw error;
    }
  };

  const loadTareas = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await fetchMisTareasEspeciales(periodo ? Number(periodo) : undefined);
      setTareas(data.data || []);
      setMeta(data.meta || null);
    } catch (err: any) {
      console.error('Error cargando tareas especiales:', err);
      setError(err?.message || 'Error al cargar tareas especiales');
    } finally {
      setLoading(false);
    }
  };

  const loadPeriodos = async () => {
    try {
      // Para estudiantes, vamos a crear una lista de períodos manualmente
      const periodosManuales = [
        { id: 1, nombre: '2026', fechaInicio: '2026-01-01', fechaFin: '2026-12-31' },
        { id: 2, nombre: 'Período 2', fechaInicio: '2026-06-01', fechaFin: '2026-08-31' },
        { id: 3, nombre: 'Período 3', fechaInicio: '2026-09-01', fechaFin: '2026-11-30' },
        { id: 4, nombre: 'Período 4', fechaInicio: '2026-10-01', fechaFin: '2026-12-31' }
      ];
      setPeriodos(periodosManuales);
    } catch (error) {
      console.error('Error cargando períodos:', error);
      setPeriodos([]);
    }
  };

  useEffect(() => {
    if (!session?.user) {
      navigate('/login');
      return;
    }
    
    loadTareas();
    loadPeriodos();
  }, [session, periodo]);

  const getEstadoColor = (estado: string) => {
    switch(estado) {
      case 'pendiente': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'entregada': return 'bg-green-50 text-green-700 border-green-200';
      case 'calificada': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'vencida': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch(estado) {
      case 'pendiente': return '⏳';
      case 'entregada': return '✅';
      case 'calificada': return '📝';
      case 'vencida': return '❌';
      default: return '📋';
    }
  };

  const getDiasRestantesColor = (dias: number) => {
    if (dias === null) return 'text-gray-500';
    if (dias < 0) return 'text-red-600';
    if (dias <= 3) return 'text-orange-600';
    return 'text-green-600';
  };

  const getDiasRestantesText = (dias: number) => {
    if (dias === null) return '';
    if (dias > 0) return `⏱️ Faltan ${dias} días`;
    if (dias === 0) return '⏱️ Vence hoy';
    return '⏱️ Vencida';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" text="Cargando tareas especiales..." />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 mb-2">❌ Error</div>
          <p className="text-red-800">{error}</p>
          <Button onClick={loadTareas} className="mt-4 bg-red-600 hover:bg-red-700">
            Reintentar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis Tareas Especiales</h1>
            <p className="text-slate-600 mt-1">Tareas asignadas individualmente para mí</p>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="px-3 py-2 rounded-xl border-2 border-gray-200" 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option value="">Todos los períodos</option>
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={loadTareas}>
              🔄 Actualizar
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        {meta && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{meta.total}</div>
                <div className="text-sm text-slate-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{meta.pendientes}</div>
                <div className="text-sm text-slate-600">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{meta.entregadas}</div>
                <div className="text-sm text-slate-600">Entregadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{meta.calificadas}</div>
                <div className="text-sm text-slate-600">Calificadas</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-slate-700">{meta.periodo.nombre}</div>
                <div className="text-sm text-slate-600">Período</div>
              </div>
            </div>
            
            {meta.estudiante && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Estudiante: <span className="font-medium">{meta.estudiante.nombres} {meta.estudiante.apellidos}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de tareas */}
        {tareas.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">No hay tareas especiales</h3>
            <p className="text-amber-700">
              {periodo ? `No tienes tareas especiales asignadas en este período.` : 'No tienes tareas especiales asignadas.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tareas.map((tarea) => (
              <div key={tarea.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                {/* Header de la tarea */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{tarea.titulo}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200">
                        Especial
                      </span>
                      {tarea.esUrgente && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
                          🚨 Urgente
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        📚 {tarea.categoria}
                      </span>
                      <span className="flex items-center gap-1">
                        👨‍🏫 {tarea.docente.nombre}
                      </span>
                      <span className="flex items-center gap-1">
                        💯 {tarea.puntajeMaximo} pts
                      </span>
                      {tarea.nota && (
                        <span className="flex items-center gap-1 font-medium text-green-600">
                          📝 Nota: {tarea.nota}/{tarea.puntajeMaximo}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg border ${getEstadoColor(tarea.estado)}`}>
                      {getEstadoIcon(tarea.estado)} {tarea.estado.charAt(0).toUpperCase() + tarea.estado.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-4">
                  <p className="text-slate-600 text-sm">{tarea.descripcionCorta}</p>
                  {tarea.descripcion && tarea.descripcion !== tarea.descripcionCorta && (
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                        Ver descripción completa
                      </summary>
                      <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                        {tarea.descripcion}
                      </p>
                    </details>
                  )}
                </div>

                {/* Fechas */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                  <span className="flex items-center gap-1">
                    📅 Publicada: {new Date(tarea.fechaPublicacion).toLocaleDateString('es-CO')}
                  </span>
                  <span className="flex items-center gap-1">
                    ⏰ Vence: {new Date(tarea.fechaVencimiento).toLocaleDateString('es-CO')}
                  </span>
                  {tarea.diasRestantes !== null && (
                    <span className={`flex items-center gap-1 font-medium ${getDiasRestantesColor(tarea.diasRestantes)}`}>
                      {getDiasRestantesText(tarea.diasRestantes)}
                    </span>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                  <Button variant="outline" size="sm">
                    Ver detalles
                  </Button>
                  {tarea.estado === 'pendiente' && (
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                      Entregar tarea
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
