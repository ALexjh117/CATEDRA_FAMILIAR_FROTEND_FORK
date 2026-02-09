import { useEffect, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { listarEntregasDocente, listarCursos, listarAsignaciones, type EntregaBackend, type CursoBackend, type AsignacionBackend } from '../api/docentes';

export default function EntregasDocentePage(){
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [items, setItems] = useState<EntregaBackend[]>([]);
  const [cursos, setCursos] = useState<CursoBackend[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionBackend[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [cursoId, setCursoId] = useState<number | ''>('');
  const [asignacionId, setAsignacionId] = useState<number | ''>('');
  const [soloPendientes, setSoloPendientes] = useState<boolean>(true);

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

        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Curso</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={cursoId} onChange={(e)=> setCursoId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todos</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Asignación</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={asignacionId} onChange={(e)=> setAsignacionId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Todas</option>
                {asignaciones.map(a => <option key={a.id} value={a.id}>{a.titulo}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" checked={soloPendientes} onChange={(e)=> setSoloPendientes(e.target.checked)} />
              <span className="text-sm">Solo pendientes</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {items.length === 0 && (
                <div className="px-4 py-8 text-center text-slate-500">No hay entregas con estos filtros.</div>
              )}
              {items.map(e => {
                const fecha = e.fechaEntrega ? new Date(e.fechaEntrega) : null;
                const fechaFmt = fecha ? fecha.toLocaleString() : 'sin fecha';
                const cursoNombre = cursos.find(c => c.id === e.cursoId)?.nombre || `#${e.cursoId ?? '-'}`;
                const asignTitulo = asignaciones.find(a => a.id === e.asignacionId)?.titulo || `Asignación #${e.asignacionId}`;
                const isOpen = expandedId === e.id;
                // Evidence: try multiple common shapes
                const archivos: any[] = (e as any).archivos || (e as any).files || (e as any).evidencias || [];
                const descripcion: string | undefined = (e as any).descripcion;
                const nombreEnvio: string | undefined = (e as any).nombreEnvio || (e as any).nombre_envio;
                const calif: any = (e as any).calificacion;
                const api = '/api';
                const origin = String(api).replace(/\/$/, '').replace(/\/api$/, '');

                const absHref = (url?: string) => {
                  if (!url) return '#';
                  return url.startsWith('http') ? url : `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
                };

                return (
                  <div key={e.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-slate-500">{asignTitulo}</div>
                        <div className="font-medium text-slate-800">Estudiante #{e.estudianteId}</div>
                        <div className="text-sm text-slate-600">Curso {cursoNombre} • {fechaFmt}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs border ${e.estado === 'calificada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : e.estado === 'enviada' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`} data-status={e.estado}>{e.estado}</span>
                        {calif && (
                          <span className="px-2 py-1 rounded-lg text-xs border bg-indigo-50 text-indigo-700 border-indigo-200">
                            {typeof calif.nota === 'number' ? calif.nota.toFixed(1) : calif.nota} • {calif.escala}
                            {calif.esAutomatica ? ' (auto)' : ''}
                          </span>
                        )}
                        <Button size="sm" variant="secondary" onClick={()=> setExpandedId(isOpen ? null : e.id)}>{isOpen ? 'Ocultar' : 'Ver evidencia'}</Button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                        {nombreEnvio && <div className="text-sm"><span className="font-semibold">Nombre del envío:</span> {nombreEnvio}</div>}
                        {descripcion && <div className="text-sm mt-1"><span className="font-semibold">Descripción:</span> {descripcion}</div>}
                        {calif && (
                          <div className="text-sm mt-1">
                            <span className="font-semibold">Calificación:</span> {typeof calif.nota === 'number' ? calif.nota.toFixed(1) : calif.nota} • {calif.escala}
                            {calif.esAutomatica && (
                              <span className="ml-2 inline-block px-2 py-0.5 rounded-lg text-xs bg-sky-50 text-sky-700 border border-sky-200">Automática</span>
                            )}
                          </div>
                        )}
                        {Array.isArray(archivos) && archivos.length > 0 ? (
                          <ul className="list-disc pl-6 mt-2 space-y-1">
                            {archivos.map((a, idx) => (
                              <li key={idx}>
                                <a className="text-teal-700 underline" href={absHref(a.url)} target="_blank" rel="noopener noreferrer">
                                  {a.originalName || a.fileName || a.nombre || `Archivo ${idx+1}`}
                                </a>
                                {a.size ? <span className="text-xs text-slate-500 ml-2">({a.size} bytes)</span> : null}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-slate-600">Sin archivos adjuntos.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
