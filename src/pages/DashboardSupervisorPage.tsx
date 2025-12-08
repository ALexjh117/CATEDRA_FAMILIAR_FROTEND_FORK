import { useState, useEffect } from 'react';
import { getSession, getCursos, getEstadisticasInstitucion, getTareas, getEntregas } from '../api/endpoints';
import { type Curso, type Tarea, type Entrega } from '../mocks/data';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  IconTarget,
  IconBarChart,
  IconBuilding,
  IconFamily,
  IconClipboard,
  IconCheckCircle,
  IconTrendingUp,
  IconBell,
  IconTeacher,
  IconAward,
  IconCalendar,
  IconInbox,
  IconBook,
  IconHeart,
  IconDownload
} from '../components/ui/Icons';

type SupervisorRole = 'orientador' | 'coordinador' | 'rector';

export default function DashboardSupervisorPage() {
  const session = getSession();
  const user = session?.user;
  const currentRole = (session?.isPreview && (session as any).previewRole 
    ? (session as any).previewRole 
    : user?.rol) as SupervisorRole;
  
  const [loading, setLoading] = useState(true);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cursosData, tareasData, entregasData, statsData] = await Promise.all([
        getCursos(),
        getTareas(),
        getEntregas(),
        getEstadisticasInstitucion(1),
      ]);

      setCursos(cursosData);
      setTareas(tareasData);
      setEntregas(entregasData);
      setEstadisticas(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleTitle = () => {
    switch (currentRole) {
      case 'orientador':
        return { title: 'Panel de Orientación', Icon: IconTarget, color: 'teal', description: 'Seguimiento del bienestar familiar y estudiantil' };
      case 'coordinador':
        return { title: 'Panel de Coordinación', Icon: IconBarChart, color: 'indigo', description: 'Gestión académica y seguimiento docente' };
      case 'rector':
        return { title: 'Panel de Rectoría', Icon: IconBuilding, color: 'slate', description: 'Visión institucional y toma de decisiones' };
      default:
        return { title: 'Panel de Supervisión', Icon: IconTarget, color: 'teal', description: 'Monitoreo general' };
    }
  };

  const roleInfo = getRoleTitle();

  // Calcular estadísticas derivadas
  const entregasPorEstado = {
    pendientes: entregas.filter(e => e.estado === 'enviada').length,
    calificadas: entregas.filter(e => e.estado === 'calificada').length,
    total: entregas.length,
  };

  const participacion = estadisticas?.porcentajeParticipacion || 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando datos..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header con diseño distintivo por rol */}
        <div className={`relative overflow-hidden rounded-2xl p-6 border ${
          currentRole === 'orientador' ? 'bg-gradient-to-br from-teal-50 via-cyan-50/40 to-emerald-50/30 border-teal-100/50' :
          currentRole === 'coordinador' ? 'bg-gradient-to-br from-indigo-50 via-violet-50/40 to-purple-50/30 border-indigo-100/50' :
          'bg-gradient-to-br from-slate-50 via-zinc-50/40 to-stone-50/30 border-slate-200/50'
        }`}>
          <div className={`absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/2 ${
            currentRole === 'orientador' ? 'bg-gradient-to-bl from-teal-200/20 to-transparent' :
            currentRole === 'coordinador' ? 'bg-gradient-to-bl from-indigo-200/20 to-transparent' :
            'bg-gradient-to-bl from-slate-200/30 to-transparent'
          }`} />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                currentRole === 'orientador' ? 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-200/50' :
                currentRole === 'coordinador' ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-200/50' :
                'bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-300/50'
              }`}>
                <roleInfo.Icon className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">
                  {roleInfo.title}
                </h1>
                <p className="text-slate-600 mt-0.5">
                  {roleInfo.description}
                </p>
              </div>
            </div>
            
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 font-medium shadow-sm">
              <IconDownload size={18} />
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-teal-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform">
                <IconFamily className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{estadisticas?.estudiantesActivos || 0}</div>
                <div className="text-sm text-slate-500 font-medium">Familias</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-105 transition-transform">
                <IconClipboard className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{tareas.length}</div>
                <div className="text-sm text-slate-500 font-medium">Tareas Activas</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-emerald-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-105 transition-transform">
                <IconCheckCircle className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{entregasPorEstado.calificadas}</div>
                <div className="text-sm text-slate-500 font-medium">Entregas</div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 border border-slate-100 hover:border-violet-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200/50 group-hover:scale-105 transition-transform">
                <IconTrendingUp className="text-white" size={22} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{participacion}%</div>
                <div className="text-sm text-slate-500 font-medium">Participación</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de participación por curso */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <IconBarChart className="text-indigo-500" size={22} />
              Participación por Curso
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {cursos.map(curso => {
              const tareasDelCurso = tareas.filter(t => t.cursoId === curso.id).length;
              const porcentaje = Math.floor(50 + Math.random() * 40); // Mock
              
              return (
                <div 
                  key={curso.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    cursoSeleccionado === curso.id 
                      ? 'border-teal-400 bg-teal-50/50 shadow-md' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                  }`}
                  onClick={() => setCursoSeleccionado(cursoSeleccionado === curso.id ? null : curso.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{curso.nombre}</span>
                      <span className="text-sm text-slate-400">•</span>
                      <span className="text-sm text-slate-500">{tareasDelCurso} tareas</span>
                    </div>
                    <span className={`font-bold text-lg ${porcentaje >= 70 ? 'text-emerald-600' : porcentaje >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                      {porcentaje}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        porcentaje >= 70 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 
                        porcentaje >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                        'bg-gradient-to-r from-red-400 to-rose-500'
                      }`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas y seguimientos (para orientador) */}
        {currentRole === 'orientador' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <IconBell className="text-orange-500" size={22} />
                Familias que Requieren Atención
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50/30 border border-orange-200/60 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <IconBell className="text-orange-600" size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-orange-900">Familia Rodríguez</div>
                      <div className="text-sm text-orange-700/80">3 tareas consecutivas sin entregar</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 border border-orange-200 transition-colors">
                    Ver caso
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50/30 border border-amber-200/60 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <IconBell className="text-amber-600" size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900">Familia Martínez</div>
                      <div className="text-sm text-amber-700/80">Baja participación este período</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 border border-amber-200 transition-colors">
                    Ver caso
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Docentes y su desempeño (para coordinador) */}
        {currentRole === 'coordinador' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                <IconTeacher className="text-indigo-500" size={22} />
                Actividad de Docentes
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left py-3 px-5 font-semibold text-slate-600 text-sm">Docente</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600 text-sm">Tareas</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600 text-sm">Calificadas</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600 text-sm">Pendientes</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600 text-sm">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">CG</div>
                        <div>
                          <div className="font-medium text-slate-800">Carlos García</div>
                          <div className="text-sm text-slate-500">5° Grado</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 font-medium text-slate-700">8</td>
                    <td className="text-center py-4 px-4 font-medium text-emerald-600">45</td>
                    <td className="text-center py-4 px-4 font-medium text-amber-600">3</td>
                    <td className="text-center py-4 px-4">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Al día</span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">AL</div>
                        <div>
                          <div className="font-medium text-slate-800">Ana López</div>
                          <div className="text-sm text-slate-500">3° Grado</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 font-medium text-slate-700">6</td>
                    <td className="text-center py-4 px-4 font-medium text-emerald-600">32</td>
                    <td className="text-center py-4 px-4 font-medium text-red-500">8</td>
                    <td className="text-center py-4 px-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Pendientes</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resumen institucional (para rector) */}
        {currentRole === 'rector' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-yellow-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                  <IconAward className="text-amber-500" size={22} />
                  Logros del Período
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50/30 rounded-xl border border-emerald-200/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-md shadow-emerald-200/50">
                    <IconTrendingUp className="text-white" size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-800">+15% Participación</div>
                    <div className="text-sm text-emerald-600/80">Respecto al período anterior</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-xl border border-blue-200/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-200/50">
                    <IconBook className="text-white" size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-800">320 Familias Activas</div>
                    <div className="text-sm text-blue-600/80">Máximo histórico</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50/30 rounded-xl border border-violet-200/50">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-md shadow-violet-200/50">
                    <IconHeart className="text-white" size={22} />
                  </div>
                  <div>
                    <div className="font-semibold text-violet-800">4.2 Promedio General</div>
                    <div className="text-sm text-violet-600/80">Calificación de tareas</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-zinc-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                  <IconCalendar className="text-slate-500" size={22} />
                  Próximos Hitos
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="p-4 border-l-4 border-teal-500 bg-gradient-to-r from-teal-50/50 to-transparent rounded-r-xl">
                  <div className="font-medium text-slate-800">Cierre de Período</div>
                  <div className="text-sm text-slate-500">15 de Diciembre</div>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent rounded-r-xl">
                  <div className="font-medium text-slate-800">Reunión de Padres</div>
                  <div className="text-sm text-slate-500">20 de Diciembre</div>
                </div>
                <div className="p-4 border-l-4 border-violet-500 bg-gradient-to-r from-violet-50/50 to-transparent rounded-r-xl">
                  <div className="font-medium text-slate-800">Entrega de Boletines</div>
                  <div className="text-sm text-slate-500">22 de Diciembre</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entregas recientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-zinc-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <IconInbox className="text-slate-500" size={22} />
              Actividad Reciente
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {entregas.slice(0, 5).map(entrega => (
              <div key={entrega.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    entrega.estado === 'calificada' 
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                      : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                  } shadow-md`}>
                    {entrega.estado === 'calificada' 
                      ? <IconCheckCircle className="text-white" size={18} /> 
                      : <IconInbox className="text-white" size={18} />}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">
                      Tarea #{entrega.tareaId} - Estudiante #{entrega.estudianteId}
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(entrega.fechaEntrega).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  entrega.estado === 'calificada' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {entrega.estado === 'calificada' ? `Nota: ${entrega.calificacion}` : 'Por calificar'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
