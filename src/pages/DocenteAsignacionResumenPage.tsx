import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { getResumenAsignacion, listarCursos, listarEntregasDocente, crearCalificacion, type ResumenAsignacionBackend, type CursoBackend } from '../api/docentes';

export default function DocenteAsignacionResumenPage(){
  const { id } = useParams();
  const asignacionId = Number(id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [data, setData] = useState<ResumenAsignacionBackend | null>(null);
  const [cursos, setCursos] = useState<CursoBackend[]>([]);
  const [cursoId, setCursoId] = useState<number | ''>('');
  const [entregas, setEntregas] = useState<any[]>([]);
  const [filtroEntregas, setFiltroEntregas] = useState<'todas' | 'enviadas' | 'calificadas'>('todas');
  const [evidenceModal, setEvidenceModal] = useState<{ open: boolean; entrega: any | null }>({ open: false, entrega: null });
  const [savingEntregaId, setSavingEntregaId] = useState<number | null>(null);
  const [autoRan, setAutoRan] = useState<boolean>(false);

  const load = async () => {
    if (!asignacionId) return;
    setLoading(true);
    setError(null);
    try {
      const [res, cur, ent] = await Promise.all([
        getResumenAsignacion(asignacionId, { cursoId: cursoId ? Number(cursoId) : undefined }),
        listarCursos(),
        listarEntregasDocente({ asignacionId, soloPendientes: false })
      ]);
      setData(res);
      setCursos(cur);
      const entList = Array.isArray((ent as any)?.data) ? (ent as any).data : (Array.isArray(ent as any) ? (ent as any) : []);
      setEntregas(entList as any[]);

      // Auto-calificar envíos pendientes (sin calificación)
      // Ejecuta una sola vez por cambio de asignación/curso
      const pendientes = (entList as any[]).filter((e: any) => !e.calificacion);
      if (!autoRan && pendientes.length > 0) {
        setAutoRan(true);
        try {
          await Promise.all(
            pendientes.map((e: any) => crearCalificacion({
              entregaId: e.id,
              // omitimos nota para que el backend calcule y marque esAutomatica=true
              escala: '1-5',
              retroalimentacion: 'Calificación automática por regla de tiempo de entrega.'
            }))
          );
          // recargar para reflejar calificaciones
          const entRef = await listarEntregasDocente({ asignacionId, soloPendientes: false });
          const entRefList = Array.isArray((entRef as any)?.data) ? (entRef as any).data : (Array.isArray(entRef as any) ? (entRef as any) : []);
          setEntregas(entRefList as any[]);
        } catch (e) {
          // si falla, continuar sin bloquear la vista
          console.warn('Auto-calificación: algunos elementos no pudieron calificarse');
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Error al cargar resumen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setAutoRan(false); load(); }, [asignacionId, cursoId]);

  const total = data?.totalEstudiantes ?? 0;
  const realizadas = data?.entregasRealizadas ?? 0;
  const calif = data?.calificaciones ?? 0;
  const pendientes = data?.entregasPendientes ?? Math.max(0, total - realizadas);
  const pct = total ? Math.round((realizadas/total)*100) : 0;
  const api = '/api';
  const origin = String(api).replace(/\/$/, '').replace(/\/api$/, '');
  const absHref = (url?: string) => {
    if (!url) return '#';
    return url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const entregasFiltradas = entregas.filter(e => {
    if (filtroEntregas === 'todas') return true;
    const tieneCalif = !!e.calificacion;
    return filtroEntregas === 'calificadas' ? tieneCalif : !tieneCalif;
  });

  const aplicarNotaSugerida = async (entrega: any) => {
    if (!entrega?.id) return;
    try {
      setSavingEntregaId(entrega.id);
      await crearCalificacion({
        entregaId: entrega.id,
        // Omitimos nota para que el backend calcule y marque esAutomatica=true
        escala: '1-5',
        retroalimentacion: 'Calificación automática por regla de tiempo de entrega.'
      });
      // Recargar entregas y resumen
      await load();
    } catch (e: any) {
      alert(e?.message || 'No se pudo aplicar la nota sugerida');
    } finally {
      setSavingEntregaId(null);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Resumen de asignación</h1>
              <p className="text-slate-600 mt-1 text-sm">{data?.titulo || `Asignación #${asignacionId}`}</p>
            </div>
            <div className="min-w-[220px]">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Filtrar por curso</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={cursoId} onChange={(e)=> setCursoId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todos</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard title="Estudiantes" value={total} />
              <StatCard title="Entregas" value={`${realizadas}/${total}`} subtitle={`${pct}%`} />
              <StatCard title="Pendientes" value={pendientes} />
              <StatCard title="Calificaciones" value={calif} />
            </div>

            {data?.porCurso && data.porCurso.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Detalle por curso</div>
                <div className="divide-y divide-slate-100">
                  {data.porCurso.map(c => {
                    const tot = c.totalEstudiantes;
                    const ent = c.entregasRealizadas;
                    const pctc = tot ? Math.round((ent/tot)*100) : 0;
                    return (
                      <div key={c.cursoId} className="px-4 py-3 flex items-center justify-between">
                        <div className="font-medium text-slate-800">{c.cursoNombre}</div>
                        <div className="text-slate-700">{ent}/{tot} • {pctc}% • Calif: {c.calificaciones}</div>
                        <div>
                          <Button size="sm" variant="secondary" onClick={()=> setCursoId(c.cursoId)}>Ver solo este</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Entregas con nota */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Entregas y calificaciones</div>
                  <div className="text-xs text-slate-500 mt-0.5">Regla: a tiempo = 5.0 • tarde = 5.0 - 0.1 por día (mín 1.0)</div>
                </div>
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                  {(['todas','enviadas','calificadas'] as const).map(f => (
                    <button
                      key={f}
                      onClick={()=> setFiltroEntregas(f)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        filtroEntregas === f ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      {f === 'todas' ? 'Todas' : f === 'enviadas' ? 'Enviadas' : 'Calificadas'}
                    </button>
                  ))}
                </div>
              </div>
              {entregasFiltradas.length === 0 ? (
                <div className="px-4 py-6 text-slate-500 text-sm">No hay entregas registradas para esta asignación.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs md:text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-slate-600">
                        <th className="px-3 py-2">Estudiante</th>
                        <th className="px-3 py-2">Estado</th>
                        <th className="px-3 py-2">Fecha</th>
                        <th className="px-3 py-2">Evidencia</th>
                        <th className="px-3 py-2">Nota</th>
                        <th className="px-3 py-2">Escala</th>
                        <th className="px-3 py-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entregasFiltradas.map((e) => {
                        const nombre = e.estudianteNombre || (e.estudiante ? `${e.estudiante.nombres} ${e.estudiante.apellidos}` : `#${e.estudianteId}`);
                        const fechaFmt = e.fechaEntrega ? new Date(e.fechaEntrega).toLocaleString() : '-';
                        const notaReal = e.calificacion?.nota != null ? (typeof e.calificacion.nota === 'number' ? e.calificacion.nota.toFixed(1) : e.calificacion.nota) : null;
                        const nota = notaReal ?? (e.calificacionSugerida != null ? `${Number(e.calificacionSugerida).toFixed(1)} (sugerida)` : '-');
                        const escala = e.calificacion?.escala || (notaReal == null && e.calificacionSugerida != null ? '1-5' : '-');
                        const tieneCalificacion = !!e.calificacion;
                        const archivosCount = Array.isArray(e.archivos) ? e.archivos.length : 0;
                        const tieneTexto = !!e.evidenciaTexto;
                        const evidenciaDesc = (
                          archivosCount > 0 && tieneTexto ? `Texto + ${archivosCount} archivo(s)` :
                          archivosCount > 0 ? `${archivosCount} archivo(s)` :
                          tieneTexto ? 'Texto' : '—'
                        );
                        return (
                          <tr key={e.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-1.5 text-slate-800">{nombre}</td>
                            <td className="px-3 py-1.5">
                              {tieneCalificacion ? (
                                <span className="px-2 py-0.5 rounded-lg text-xs border bg-emerald-50 text-emerald-700 border-emerald-200">Calificada</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-lg text-xs border bg-amber-50 text-amber-700 border-amber-200">Enviada • Sin calificar</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-slate-600">
                              <div className="flex items-center gap-2">
                                <span>{fechaFmt}</span>
                                {e.entregadoATiempo === true && (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">A tiempo</span>
                                )}
                                {e.entregadoATiempo === false && (
                                  <span className="px-2 py-0.5 rounded-lg text-[10px] bg-rose-50 text-rose-700 border border-rose-200">Tarde{typeof e.diasTarde === 'number' ? ` (${e.diasTarde} d)` : ''}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-slate-700">{evidenciaDesc}</td>
                            <td className="px-3 py-1.5 font-semibold text-slate-800">{nota}</td>
                            <td className="px-3 py-1.5 text-slate-600">{escala}</td>
                            <td className="px-3 py-1.5 text-right space-x-3">
                              {(archivosCount > 0 || tieneTexto) ? (
                                <button
                                  className="text-teal-700 underline"
                                  onClick={() => setEvidenceModal({ open: true, entrega: e })}
                                >
                                  Ver evidencia
                                </button>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                              {/* Botón de calificar manual removido: el sistema aplica la calificación automáticamente */}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Modal Ver Evidencia */}
            <Modal
              isOpen={evidenceModal.open}
              onClose={() => setEvidenceModal({ open: false, entrega: null })}
              title="Evidencia de la entrega"
              size="lg"
            >
              {evidenceModal.entrega && (
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500">Estudiante</div>
                    <div className="font-medium text-slate-800">{evidenceModal.entrega.estudianteNombre || (evidenceModal.entrega.estudiante ? `${evidenceModal.entrega.estudiante.nombres} ${evidenceModal.entrega.estudiante.apellidos}` : `#${evidenceModal.entrega.estudianteId}`)}</div>
                  </div>
                  {evidenceModal.entrega.evidenciaTexto && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="text-xs text-slate-500 mb-1">Texto enviado</div>
                      <div className="text-slate-800 whitespace-pre-wrap">{evidenceModal.entrega.evidenciaTexto}</div>
                    </div>
                  )}
                  {Array.isArray(evidenceModal.entrega.archivos) && evidenceModal.entrega.archivos.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Archivos</div>
                      <ul className="list-disc pl-6 space-y-1">
                        {evidenceModal.entrega.archivos.map((a: any, idx: number) => (
                          <li key={idx}>
                            <a className="text-teal-700 underline" href={absHref(a.url)} target="_blank" rel="noopener noreferrer">
                              {a.originalName || a.fileName || a.nombre || `Archivo ${idx+1}`}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Modal>
          </>
        )}
      </div>
    </TeacherLayout>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: any; subtitle?: string }){
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4">
      <div className="text-xs font-semibold text-slate-600">{title}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {subtitle && <div className="text-sm text-slate-600">{subtitle}</div>}
    </div>
  );
}
