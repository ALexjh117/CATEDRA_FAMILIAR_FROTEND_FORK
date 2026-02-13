import { useEffect, useMemo, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { listarAsignaciones, listarCursos, listarPeriodos, type AsignacionBackend, type CursoBackend, type PeriodoBackend } from '../api/docentes';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

export default function DocenteAsignacionesListPage(){
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation() as any;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [items, setItems] = useState<AsignacionBackend[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const [periodos, setPeriodos] = useState<PeriodoBackend[]>([]);
  const [cursos, setCursos] = useState<CursoBackend[]>([]);

  const [periodo, setPeriodo] = useState<number | ''>(Number(searchParams.get('periodo')) || '');
  const [cursoId, setCursoId] = useState<number | ''>(Number(searchParams.get('cursoId')) || '');
  const [estado, setEstado] = useState<string>(searchParams.get('estado') || '');
  const [detallePorCurso, setDetallePorCurso] = useState<boolean>(searchParams.get('detallePorCurso') === 'true');
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [perPage, setPerPage] = useState<number>(Number(searchParams.get('perPage')) || 10);

  const actualizarQuery = () => {
    const params: Record<string, string> = {};
    if (periodo) params.periodo = String(periodo);
    if (cursoId) params.cursoId = String(cursoId);
    if (estado) params.estado = estado;
    if (detallePorCurso) params.detallePorCurso = 'true';
    params.page = String(page);
    params.perPage = String(perPage);
    setSearchParams(params);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [res, per, cur] = await Promise.all([
        listarAsignaciones({ periodo: periodo ? Number(periodo) : undefined, cursoId: cursoId ? Number(cursoId) : undefined, estado: estado as any, detallePorCurso, page, perPage }),
        listarPeriodos(),
        listarCursos()
      ]);
      const resAny: any = res as any;
      const list = Array.isArray(resAny?.data?.data)
        ? resAny.data.data
        : (Array.isArray(resAny?.data)
          ? resAny.data
          : (Array.isArray(resAny) ? resAny : []));
      // Ordenar por fechaInicio DESC y luego id DESC (por si el backend no lo aplica)
      let sorted = [...list].sort((a: any, b: any) => {
        const fa = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
        const fb = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
        if (fb !== fa) return fb - fa;
        return (b.id || 0) - (a.id || 0);
      });
      // Si venimos de crear (navigate state), poner esa asignación primero
      if (highlightId) {
        const idx = sorted.findIndex((x: any) => x.id === highlightId);
        if (idx > 0) {
          const [hit] = sorted.splice(idx, 1);
          sorted = [hit, ...sorted];
        }
      }
      const metaOut = resAny?.data?.meta || resAny?.meta || null;
      setItems(sorted as any);
      setMeta(metaOut);
      setPeriodos(per);
      setCursos(cur);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [periodo, cursoId, estado, detallePorCurso, page, perPage, highlightId]);
  useEffect(() => { actualizarQuery(); }, [periodo, cursoId, estado, detallePorCurso, page, perPage]);
  useEffect(() => {
    const hid = location?.state?.highlightId;
    if (hid) setHighlightId(Number(hid));
  }, [location?.state]);

  const total = meta?.total ?? items.length;
  const lastPage = meta?.lastPage ?? Math.max(1, Math.ceil(total / perPage));

  const columns = useMemo(() => [
    { key: 'titulo', label: 'Título' },
    { key: 'curso', label: 'Curso' },
    { key: 'entregas', label: 'Entregas/Total' },
    { key: 'porcentaje', label: '%Entrega' },
    { key: 'estado', label: 'Estado' },
    { key: 'vencimiento', label: 'Vence' },
  ], []);

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Asignaciones</h1>
              <p className="text-slate-600 mt-1 text-sm">Filtra por período, curso y estado. Revisa entregas y vencimientos.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/asignaciones/nueva"><Button>Asignar nueva</Button></Link>
              <Link to="/docente/banco-tareas"><Button variant="secondary">Banco de tareas</Button></Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Período</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={periodo} onChange={(e)=>{setPeriodo(e.target.value? Number(e.target.value):''); setPage(1);}}>
                <option value="">Todos</option>
                {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Curso</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={cursoId} onChange={(e)=>{setCursoId(e.target.value? Number(e.target.value):''); setPage(1);}}>
                <option value="">Todos</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={estado} onChange={(e)=>{setEstado(e.target.value); setPage(1);}}>
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="entregada">Entregada</option>
                <option value="calificada">Calificada</option>
                <option value="vencida">Vencida</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <input id="detallePorCurso" type="checkbox" className="h-4 w-4" checked={detallePorCurso} onChange={(e)=>{setDetallePorCurso(e.target.checked); setPage(1);}} />
              <label htmlFor="detallePorCurso" className="text-sm">Detalle por curso</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Por página</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200" value={perPage} onChange={(e)=>{setPerPage(Number(e.target.value)); setPage(1);}}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="md:col-span-12 flex items-center justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={load}>Recargar</Button>
            </div>
          </div>
          {(periodo || cursoId || estado || detallePorCurso) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {periodo && (
                <button
                  className="px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={()=>{ setPeriodo(''); setPage(1); }}
                >
                  Período ×
                </button>
              )}
              {cursoId && (
                <button
                  className="px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={()=>{ setCursoId(''); setPage(1); }}
                >
                  Curso ×
                </button>
              )}
              {estado && (
                <button
                  className="px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={()=>{ setEstado(''); setPage(1); }}
                >
                  Estado ×
                </button>
              )}
              {detallePorCurso && (
                <button
                  className="px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={()=>{ setDetallePorCurso(false); setPage(1); }}
                >
                  Detalle por curso ×
                </button>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {columns.map(c => (
                      <th key={c.key} className="text-left text-xs font-semibold text-slate-600 px-4 py-3">{c.label}</th>
                    ))}
                    <th className="px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(a => {
                    const total = a.entregas?.total ?? 0;
                    const realizadas = a.entregas?.realizadas ?? 0;
                    const pct = total ? Math.round((realizadas/total)*100) : 0;
                    const vence = a.fechaVencimiento || '';

                    // Estado visible derivado para evitar 'vencida' recién creada
                    const now = new Date();
                    const end = vence ? new Date(vence) : null;
                    const isPast = end ? end.getTime() < now.getTime() : false;
                    const completada = realizadas >= total && total > 0;
                    let estadoVis: string = a.estado || '';
                    if (a.estado === 'calificada') estadoVis = 'calificada';
                    else if (completada) estadoVis = 'entregada';
                    else if (end) estadoVis = isPast ? 'vencida' : 'pendiente';
                    else estadoVis = 'pendiente';

                    const estadoCls = estadoVis === 'calificada'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : estadoVis === 'entregada'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : estadoVis === 'pendiente'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : estadoVis === 'vencida'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200';

                    // Info humanizada de vencimiento
                    const humanVence = (() => {
                      if (!end) return '-';
                      const msPerDay = 24*60*60*1000;
                      const diffDays = Math.ceil((end.getTime() - now.getTime()) / msPerDay);
                      if (diffDays > 1) return `En ${diffDays} días`;
                      if (diffDays === 1) return 'Mañana';
                      if (diffDays === 0) return 'Hoy';
                      if (diffDays === -1) return 'Ayer';
                      return `Hace ${Math.abs(diffDays)} días`;
                    })();

                    return (
                      <tr key={a.id} className={`border-t border-slate-100 ${highlightId === a.id ? 'bg-teal-50/40' : ''}`}>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {a.titulo}
                          {highlightId === a.id && (
                            <span className="ml-2 inline-block px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-700 border border-teal-200">Reciente</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{a.cursoNombre || (a.cursoId ? `Curso #${a.cursoId}` : (a.cursoIds?.length ? `${a.cursoIds.length} cursos` : ''))}</td>
                        <td className="px-4 py-3 text-slate-700">{realizadas}/{total}</td>
                        <td className="px-4 py-3 text-slate-700">{pct}%</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs border ${estadoCls}`} data-status={estadoVis}>{estadoVis || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <div className="flex flex-col leading-tight">
                            <span>{vence || '-'}</span>
                            {vence && (
                              <span className="text-xs text-slate-500">{humanVence}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/docente/asignaciones/${a.id}`}><Button size="sm">Ver resumen</Button></Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <div className="text-sm text-slate-600">Página {page} de {lastPage} • Total {total}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={()=> setPage(1)} disabled={page===1}>«</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(p => Math.max(1, p-1))} disabled={page===1}>Anterior</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(p => Math.min(lastPage, p+1))} disabled={page===lastPage}>Siguiente</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(lastPage)} disabled={page===lastPage}>»</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
