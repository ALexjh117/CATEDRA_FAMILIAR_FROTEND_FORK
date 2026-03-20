import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  getRankingCurso,
  listarCursosNotasDocente,
  listarEstudiantesConNotas,
  listarPeriodos,
  type EstudianteConNotasBackend,
  type NotaCursoDocenteBackend,
  type PeriodoBackend,
  type RankingCursoBackend,
} from '../api/docentes';

function getPromedioTone(promedio: number) {
  if (promedio >= 90) return 'text-emerald-700';
  if (promedio >= 70) return 'text-amber-700';
  return 'text-rose-700';
}

function getEstadoAcademico(item: {
  promedio: number;
  reprobadas: number;
  notas?: Array<{ nota: number }>;
}) {
  const promedio = Number(item.promedio || 0);
  const reprobadas = Number(item.reprobadas || 0);
  const notas = Array.isArray(item.notas) ? item.notas : [];
  const enRiesgo = notas.filter((nota) => {
    const valor = Number(nota?.nota || 0);
    return valor >= 60 && valor < 70;
  }).length;

  if (reprobadas > 0) {
    return {
      badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
      label: `${reprobadas} reprobada${reprobadas === 1 ? '' : 's'}`,
      detail: 'Tiene asignaturas por debajo del mínimo esperado.',
    };
  }

  if (promedio < 70) {
    return {
      badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
      label: 'Promedio en riesgo',
      detail: 'Su promedio general está por debajo de 70.',
    };
  }

  if (enRiesgo > 0) {
    return {
      badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
      label: `${enRiesgo} en riesgo`,
      detail: 'Tiene asignaturas cercanas al umbral mínimo.',
    };
  }

  return {
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    label: 'Sin alertas',
    detail: 'Mantiene un rendimiento académico estable.',
  };
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

export default function NotasDocentePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodos, setPeriodos] = useState<PeriodoBackend[]>([]);
  const [cursos, setCursos] = useState<NotaCursoDocenteBackend[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteConNotasBackend[]>([]);
  const [ranking, setRanking] = useState<RankingCursoBackend | null>(null);

  const [periodoId, setPeriodoId] = useState<number | ''>(Number(searchParams.get('periodoId')) || '');
  const [cursoId, setCursoId] = useState<number | ''>(Number(searchParams.get('cursoId')) || '');
  const institucionId = resolveInstitucionId();

  const activePeriodoId = useMemo(() => {
    if (periodoId) return Number(periodoId);
    const activo = periodos.find((item) => item.estaActivo);
    return activo?.id ?? periodos[0]?.id ?? 0;
  }, [periodoId, periodos]);

  const loadCatalog = async () => {
    const [periodosList, cursosList] = await Promise.all([
      listarPeriodos({ institucionId }),
      listarCursosNotasDocente(),
    ]);
    setPeriodos(Array.isArray(periodosList) ? periodosList : []);
    setCursos(Array.isArray(cursosList) ? cursosList : []);
    return { periodosList, cursosList };
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { periodosList } = await loadCatalog();
      const resolvedPeriodoId = Number(periodoId || periodosList.find((item) => item.estaActivo)?.id || periodosList[0]?.id || 0);

      if (!resolvedPeriodoId) {
        setEstudiantes([]);
        setRanking(null);
        return;
      }

      if (!periodoId) {
        setPeriodoId(resolvedPeriodoId);
      }

      const [students, rankingData] = await Promise.all([
        listarEstudiantesConNotas({
          periodoId: resolvedPeriodoId,
          cursoId: cursoId ? Number(cursoId) : undefined,
        }),
        cursoId ? getRankingCurso(Number(cursoId), resolvedPeriodoId) : Promise.resolve(null),
      ]);

      setEstudiantes(Array.isArray(students) ? students : []);
      setRanking(rankingData);
    } catch (e: any) {
      setError(e?.message || 'No se pudieron cargar las notas');
      setEstudiantes([]);
      setRanking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [periodoId, cursoId]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (periodoId) params.periodoId = String(periodoId);
    if (cursoId) params.cursoId = String(cursoId);
    setSearchParams(params);
  }, [periodoId, cursoId, setSearchParams]);

  const resumen = useMemo(() => {
    const total = estudiantes.length;
    const promedioGeneral = total > 0
      ? estudiantes.reduce((acc, item) => acc + Number(item.promedio || 0), 0) / total
      : 0;
    const aprobados = estudiantes.filter((item) => item.reprobadas === 0).length;
    const alertas = estudiantes.filter((item) => item.reprobadas > 0).length;
    return { total, promedioGeneral, aprobados, alertas };
  }, [estudiantes]);

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-teal-100/50 bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 p-6">
          <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-bl from-teal-200/20 to-transparent" />
          <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-800 md:text-3xl">Sistema de notas</h1>
              <p className="mt-1 text-sm text-slate-600">Consulta el rendimiento académico de tus estudiantes por período y curso.</p>
            </div>
            <div className="flex items-center gap-2">
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
            <div className="md:col-span-4">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Curso</label>
              <select className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 focus:border-teal-500" value={cursoId} onChange={(e) => setCursoId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todos mis cursos</option>
                {cursos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-4 flex items-end justify-end">
              {(periodoId || cursoId) && (
                <Button variant="ghost" onClick={() => { setPeriodoId(''); setCursoId(''); }}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center"><LoadingSpinner size="lg" text="Cargando notas..." /></div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estudiantes</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{resumen.total}</div>
                <div className="mt-1 text-sm text-slate-600">Con notas registradas en el período.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Promedio general</div>
                <div className={`mt-2 text-3xl font-bold ${getPromedioTone(resumen.promedioGeneral)}`}>{resumen.promedioGeneral.toFixed(1)}</div>
                <div className="mt-1 text-sm text-slate-600">Promedio acumulado del conjunto filtrado.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sin reprobadas</div>
                <div className="mt-2 text-3xl font-bold text-emerald-700">{resumen.aprobados}</div>
                <div className="mt-1 text-sm text-slate-600">Estudiantes que van aprobando todas sus asignaturas.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alertas</div>
                <div className="mt-2 text-3xl font-bold text-rose-700">{resumen.alertas}</div>
                <div className="mt-1 text-sm text-slate-600">Estudiantes con al menos una materia reprobada.</div>
              </div>
            </div>

            {ranking && (
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 md:px-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Ranking del curso</div>
                      <div className="text-sm text-slate-600">{ranking.curso.nombre} • {ranking.total_estudiantes} estudiante(s)</div>
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                      Promedio del curso: {Number(ranking.promedio_curso || 0).toFixed(1)}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">#</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estudiante</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Promedio</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Asignaturas</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.estudiantes.map((item, index) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-slate-800">{item.nombres} {item.apellidos}</td>
                          <td className={`px-4 py-3 text-sm font-semibold ${getPromedioTone(item.promedio)}`}>{item.promedio.toFixed(1)}</td>
                          <td className="px-4 py-3 text-sm text-slate-600">{item.total_asignaturas}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getEstadoAcademico({ promedio: item.promedio, reprobadas: item.reprobadas }).badgeClass}`}>
                              {getEstadoAcademico({ promedio: item.promedio, reprobadas: item.reprobadas }).label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Estudiantes con notas</div>
                  <div className="text-sm text-slate-600">Promedios, avance por asignaturas y acceso al detalle individual.</div>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
                  {estudiantes.length} resultado(s)
                </div>
              </div>

              {estudiantes.length === 0 ? (
                <div className="px-4 py-10 text-center text-slate-500">No hay notas disponibles con los filtros seleccionados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estudiante</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Curso</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Promedio</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Asignaturas</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Estado</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((estudiante) => (
                        <tr key={estudiante.id} className="border-t border-slate-100">
                          <td className="px-4 py-4">
                            <div className="font-medium text-slate-800">{estudiante.nombres} {estudiante.apellidos}</div>
                            {estudiante.numero_documento && <div className="text-sm text-slate-500">Doc. {estudiante.numero_documento}</div>}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">{estudiante.curso_nombre || 'Sin curso'}</td>
                          <td className={`px-4 py-4 text-lg font-semibold ${getPromedioTone(estudiante.promedio)}`}>{estudiante.promedio.toFixed(1)}</td>
                          <td className="px-4 py-4 text-sm text-slate-600">
                            <div>{estudiante.total_asignaturas} total</div>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{estudiante.aprobadas} aprobadas</span>
                              {estudiante.reprobadas > 0 && <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">{estudiante.reprobadas} reprobadas</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getEstadoAcademico(estudiante).badgeClass}`}>
                                {getEstadoAcademico(estudiante).label}
                              </span>
                              <div className="text-xs text-slate-500">{getEstadoAcademico(estudiante).detail}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <Button size="sm" onClick={() => navigate(`/docente/notas/estudiante/${estudiante.id}?periodoId=${activePeriodoId}`)}>
                              Ver detalle
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
