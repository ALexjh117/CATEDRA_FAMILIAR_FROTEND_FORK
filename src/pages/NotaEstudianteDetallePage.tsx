import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getNotasEstudiante, listarPeriodos, type NotasEstudianteDetalleBackend, type PeriodoBackend } from '../api/docentes';

function getPromedioTone(promedio: number) {
  if (promedio >= 90) return 'text-emerald-700';
  if (promedio >= 70) return 'text-amber-700';
  return 'text-rose-700';
}

function resolveInstitucionId() {
  try {
    const rawSession = typeof window !== 'undefined' ? window.localStorage.getItem('session') : null;
    const parsedSession = rawSession ? JSON.parse(rawSession) : null;
    const rawUser = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
    const parsedUser = rawUser ? JSON.parse(rawUser) : null;
    return Number(
      parsedSession?.user?.institucionId ??
      parsedSession?.context?.institucionId ??
      parsedSession?.institucionId ??
      parsedUser?.institucionId ??
      0
    );
  } catch {
    return 0;
  }
}

export default function NotaEstudianteDetallePage() {
  const { estudianteId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<PeriodoBackend[]>([]);
  const [data, setData] = useState<NotasEstudianteDetalleBackend | null>(null);
  const [periodoId, setPeriodoId] = useState<number | ''>(Number(searchParams.get('periodoId')) || '');
  const institucionId = resolveInstitucionId();

  const activePeriodoId = useMemo(() => {
    if (periodoId) return Number(periodoId);
    const activo = periodos.find((item) => item.estaActivo);
    return activo?.id ?? periodos[0]?.id ?? 0;
  }, [periodoId, periodos]);

  const load = async () => {
    const id = Number(estudianteId);
    if (!id) {
      setError('Estudiante inválido');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const periodosList = await listarPeriodos({ institucionId });
      setPeriodos(Array.isArray(periodosList) ? periodosList : []);
      const resolvedPeriodoId = Number(periodoId || periodosList.find((item) => item.estaActivo)?.id || periodosList[0]?.id || 0);
      if (!resolvedPeriodoId) {
        setData(null);
        return;
      }
      if (!periodoId) {
        setPeriodoId(resolvedPeriodoId);
      }
      const response = await getNotasEstudiante(id, resolvedPeriodoId);
      setData(response);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar el detalle del estudiante');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [estudianteId, periodoId]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (periodoId) params.periodoId = String(periodoId);
    setSearchParams(params);
  }, [periodoId, setSearchParams]);

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-teal-100/50 bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 p-6">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-bl from-teal-200/20 to-transparent" />
          <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Detalle académico</div>
              <h1 className="mt-1 text-2xl font-display font-bold text-slate-800 md:text-3xl">Notas del estudiante</h1>
              <p className="mt-1 text-sm text-slate-600">Consulta calificaciones, retroalimentación y comportamiento por asignatura.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate('/docente/notas')}>Volver</Button>
              <Button variant="secondary" onClick={load}>Recargar</Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-4">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Período</label>
              <select className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 focus:border-teal-500" value={periodoId} onChange={(e) => setPeriodoId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Selecciona un período</option>
                {periodos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-8 flex items-end justify-end">
              <Link to={`/docente/notas${activePeriodoId ? `?periodoId=${activePeriodoId}` : ''}`} className="text-sm font-medium text-teal-700 underline">
                Volver al listado general
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center"><LoadingSpinner size="lg" text="Cargando detalle..." /></div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
        ) : !data ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">No se encontró información para este estudiante.</div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Estudiante</div>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{data.estudiante.nombres} {data.estudiante.apellidos}</h2>
                  <div className="mt-1 text-sm text-slate-600">{data.estudiante.curso || 'Curso no disponible'}</div>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {data.notas.length} nota(s) registradas
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className={`text-3xl font-bold ${getPromedioTone(data.promedio)}`}>{data.promedio.toFixed(1)}</div>
                  <div className="mt-1 text-sm text-slate-500">Promedio</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-3xl font-bold text-sky-700">{data.total_asignaturas}</div>
                  <div className="mt-1 text-sm text-slate-500">Asignaturas</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-700">{data.aprobadas}</div>
                  <div className="mt-1 text-sm text-slate-500">Aprobadas</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <div className="text-3xl font-bold text-rose-700">{data.reprobadas}</div>
                  <div className="mt-1 text-sm text-slate-500">Reprobadas</div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 md:px-6">
                <div className="text-sm font-semibold text-slate-900">Detalle de calificaciones</div>
                <div className="text-sm text-slate-600">Revisa materia, actividad, nota y retroalimentación.</div>
              </div>

              {data.notas.length === 0 ? (
                <div className="px-4 py-10 text-center text-slate-500">No hay calificaciones registradas en este período.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.notas.map((nota) => (
                    <div key={nota.id} className="grid gap-4 px-4 py-5 md:grid-cols-[minmax(0,1fr)_160px] md:px-6">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{nota.materia_nombre || 'Materia'}</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">{nota.titulo || 'Actividad sin título'}</div>
                        {nota.descripcion && <div className="mt-1 text-sm text-slate-500">{nota.descripcion}</div>}
                        {nota.retroalimentacion && (
                          <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                            <span className="font-semibold">Retroalimentación:</span> {nota.retroalimentacion}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 md:items-center">
                        <div className={`text-3xl font-bold ${getPromedioTone(nota.nota)}`}>{Number(nota.nota || 0).toFixed(1)}</div>
                        {nota.nota_cualitativa && <div className="mt-1 text-sm text-slate-600">{nota.nota_cualitativa}</div>}
                        <div className="mt-3 text-xs text-slate-500">{nota.calificado_en ? new Date(nota.calificado_en).toLocaleString() : 'Sin fecha'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
