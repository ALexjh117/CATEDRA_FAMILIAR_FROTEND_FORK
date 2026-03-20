import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { listarEntregasDocente, listarCursos, listarAsignaciones, type EntregaBackend, type CursoBackend, type AsignacionBackend } from '../api/docentes';
import { useNavigate } from 'react-router-dom';

export default function EntregasDocentePage(){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [items, setItems] = useState<EntregaBackend[]>([]);
  const [cursos, setCursos] = useState<CursoBackend[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionBackend[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [cursoId, setCursoId] = useState<number | ''>('');
  const [asignacionId, setAsignacionId] = useState<number | ''>('');
  const [soloPendientes, setSoloPendientes] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ent, cur, asig] = await Promise.all([
        listarEntregasDocente({ cursoId: cursoId ? Number(cursoId) : undefined, asignacionId: asignacionId ? Number(asignacionId) : undefined, soloPendientes }),
        listarCursos(),
        listarAsignaciones({ page: 1, perPage: 50 })
      ]);
      const entList = Array.isArray((ent as any)?.data) ? (ent as any).data : (Array.isArray(ent as any) ? (ent as any) : []);
      const asigList = Array.isArray((asig as any)?.data) ? (asig as any).data : (Array.isArray(asig as any) ? (asig as any) : []);
      setItems(entList);
      setCursos(cur);
      setAsignaciones(asigList as any);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar entregas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [cursoId, asignacionId, soloPendientes]);

  const totalPendientes = items.filter((e) => e.estado === 'pendiente').length;
  const totalEnviadas = items.filter((e) => e.estado === 'enviada').length;
  const totalCalificadas = items.filter((e) => e.estado === 'calificada').length;

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Entregas</h1>
              <p className="text-slate-600 mt-1 text-sm">Bandeja de entregas. Filtra por curso/asignación y controla pendientes.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={load}>Recargar</Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
            <label className="space-y-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Curso</span>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-500" value={cursoId} onChange={(e)=> setCursoId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todos</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Asignación</span>
              <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-500" value={asignacionId} onChange={(e)=> setAsignacionId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todas</option>
                {asignaciones.map(a => <option key={a.id} value={a.id}>{a.titulo}</option>)}
              </select>
            </label>
            <div className="flex items-end">
              <label className="inline-flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded" checked={soloPendientes} onChange={(e)=> setSoloPendientes(e.target.checked)} />
                Solo pendientes
              </label>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pendientes</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{totalPendientes}</div>
                <div className="mt-1 text-sm text-slate-600">Entregas que aún requieren revisión o envío.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Enviadas</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{totalEnviadas}</div>
                <div className="mt-1 text-sm text-slate-600">Registros entregados por estudiantes o acudientes.</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calificadas</div>
                <div className="mt-2 text-3xl font-bold text-slate-900">{totalCalificadas}</div>
                <div className="mt-1 text-sm text-slate-600">Entregas con nota o valoración registrada.</div>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Bandeja de entregas</div>
                  <div className="text-sm text-slate-600">Consulta evidencias, estado de revisión y calificaciones desde una sola vista.</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{items.length} resultado(s)</span>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">{soloPendientes ? 'Solo pendientes activo' : 'Mostrando todos los estados'}</span>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="px-4 py-10 text-center text-slate-500">No hay entregas con estos filtros.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {items.map(e => {
                    const fecha = e.fechaEntrega ? new Date(e.fechaEntrega) : null;
                    const fechaFmt = fecha ? fecha.toLocaleString() : 'Sin fecha registrada';
                    const cursoNombre = cursos.find(c => c.id === e.cursoId)?.nombre || `Curso #${e.cursoId ?? '-'}`;
                    const asignTitulo = asignaciones.find(a => a.id === e.asignacionId)?.titulo || `Asignación #${e.asignacionId}`;
                    const isOpen = expandedId === e.id;
                    const assignmentTarget = e.asignacionId ? `/docente/asignaciones/${e.asignacionId}` : '';
                    const archivos: any[] = (e as any).archivos || (e as any).files || (e as any).evidencias || [];
                    const descripcion: string | undefined = (e as any).descripcion;
                    const nombreEnvio: string | undefined = (e as any).nombreEnvio || (e as any).nombre_envio;
                    const calif: any = (e as any).calificacion;
                    const estudianteNombre = (e as any).estudianteNombre || `Estudiante #${e.estudianteId}`;
                    const api = '/api';
                    const origin = String(api).replace(/\/$/, '').replace(/\/api$/, '');

                    const absHref = (url?: string) => {
                      if (!url) return '#';
                      return url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
                    };

                    return (
                      <div key={e.id} className="px-4 py-5 md:px-6">
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] lg:items-start">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600">Entrega #{e.id}</span>
                              <span className={`rounded-full border px-3 py-1 font-medium ${e.estado === 'calificada' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : e.estado === 'enviada' ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>{e.estado}</span>
                              {calif ? (
                                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-medium text-indigo-700">
                                  {typeof calif.nota === 'number' ? calif.nota.toFixed(1) : calif.nota} • {calif.escala || calif.notaCualitativa || 'Calificada'}
                                  {calif.esAutomatica ? ' (auto)' : ''}
                                </span>
                              ) : null}
                            </div>

                            <div>
                              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Asignación</div>
                              <div className="mt-1 text-base font-semibold text-slate-900">{asignTitulo}</div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Estudiante</div>
                                <div className="mt-1 text-sm font-medium text-slate-800">{estudianteNombre}</div>
                              </div>
                              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Curso</div>
                                <div className="mt-1 text-sm font-medium text-slate-800">{cursoNombre}</div>
                              </div>
                              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Fecha</div>
                                <div className="mt-1 text-sm font-medium text-slate-800">{fechaFmt}</div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidencia</div>
                                <div className="mt-1 text-sm text-slate-600">{Array.isArray(archivos) && archivos.length > 0 ? `${archivos.length} archivo(s) adjunto(s)` : 'Sin archivos adjuntos'}</div>
                              </div>
                              <Button size="sm" variant="secondary" onClick={()=> assignmentTarget && navigate(assignmentTarget)}>
                                Ver evidencia
                              </Button>
                            </div>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                              <div className="space-y-3">
                                {nombreEnvio && (
                                  <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre del envío</div>
                                    <div className="mt-1 text-sm text-slate-800">{nombreEnvio}</div>
                                  </div>
                                )}
                                {descripcion && (
                                  <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Descripción</div>
                                    <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{descripcion}</div>
                                  </div>
                                )}
                                {calif && (
                                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                                    <span className="font-semibold">Calificación:</span> {typeof calif.nota === 'number' ? calif.nota.toFixed(1) : calif.nota} • {calif.escala || calif.notaCualitativa || 'Registrada'}
                                    {calif.esAutomatica && <span className="ml-2 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-700">Automática</span>}
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Archivos adjuntos</div>
                                {Array.isArray(archivos) && archivos.length > 0 ? (
                                  <div className="mt-3 space-y-2">
                                    {archivos.map((a, idx) => (
                                      <a
                                        key={idx}
                                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                                        href={absHref(a.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <span className="truncate pr-4">{a.originalName || a.fileName || a.nombre || `Archivo ${idx + 1}`}</span>
                                        <span className="shrink-0 text-xs text-slate-500">{a.size ? `${a.size} bytes` : 'Abrir'}</span>
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">No hay archivos adjuntos para esta entrega.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
