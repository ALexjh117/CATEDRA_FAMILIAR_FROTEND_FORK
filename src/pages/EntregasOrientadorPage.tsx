import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { listarAsignacionesOrientador, getResumenAsignacionOrientadorRaw, type AsignacionBackend } from '../api/docentes';
import { getGradosPublic } from '../api/endpointsDocente-orinetador';
import { getSession } from '../api/endpoints';

export default function EntregasOrientadorPage(){
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [cursos, setCursos] = useState<Array<{ id: number; nombre: string }>>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionBackend[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [asignacionId, setAsignacionId] = useState<number | ''>('');
  const [soloPendientes, setSoloPendientes] = useState<boolean>(true);

  // Datos de resumen de entregas
  const [resumen, setResumen] = useState<any | null>(null);
  const [entregados, setEntregados] = useState<any[]>([]);
  const [noEntregados, setNoEntregados] = useState<any[]>([]);

  const session = getSession();

  const loadCursos = async () => {
    try {
      // Preferir /grados para ver todos los cursos de la institución del orientador
      const instId = (session as any)?.user?.institucionId || (session as any)?.context?.institucionId || 0;
      try {
        const gradosRes = await getGradosPublic();
        if (gradosRes.success && Array.isArray(gradosRes.data)) {
          const flat = gradosRes.data
            .flatMap((g: any) => Array.isArray(g?.cursos) ? g.cursos.map((c: any) => ({ ...c, _grado: g })) : [])
            .filter((c: any) => {
              if (!instId) return true;
              const ci = c.institucionId ?? c.institucion_id;
              if (ci === undefined || ci === null || ci === '') return true;
              return Number(ci) === Number(instId);
            })
            .map((c: any) => {
              const id = Number(c.id);
              const gradoNombre = c?._grado?.nombre || c?.gradoNombre || c?.grado_nombre;
              const grupo = c?.grupo?.nombre || c?.grupoNombre || c?.grupo || c?.letra || c?.paralelo || c?.seccion;
              const nombreDerivado = [gradoNombre, grupo].filter(Boolean).join(' ');
              const nombre = c?.nombre || c?.nombreCurso || c?.nombre_curso || c?.nombreCompleto || c?.nombre_completo || nombreDerivado || (id ? `Curso #${id}` : 'Curso');
              return { id, nombre };
            });
          if (flat.length) { setCursos(flat); return; }
        }
      } catch {}
      setCursos([]);
    } catch {
      setCursos([]);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1) Cargar asignaciones del orientador
      const asig = await listarAsignacionesOrientador({ page: 1, perPage: 50 });
      const asigList = Array.isArray((asig as any)?.data) ? (asig as any).data : (Array.isArray(asig as any) ? (asig as any) : []);
      setAsignaciones(asigList as any);

      // 2) Si hay una asignación seleccionada, cargar su resumen (entregados/noEntregados)
      if (asignacionId) {
        const raw = await getResumenAsignacionOrientadorRaw(Number(asignacionId));
        const r = (raw && typeof raw === 'object' && 'data' in raw) ? (raw as any).data : raw;
        const res = r?.resumen || r?.summary || r || null;
        const entreg = res?.entregados || res?.entregas || r?.entregados || [];
        const noEnt = res?.noEntregados || res?.pendientes || r?.noEntregados || [];
        setResumen(res);
        setEntregados(Array.isArray(entreg) ? entreg : []);
        setNoEntregados(Array.isArray(noEnt) ? noEnt : []);
      } else {
        setResumen(null);
        setEntregados([]);
        setNoEntregados([]);
      }
    } catch (e: any) {
      setError(e?.message || 'Error al cargar entregas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCursos(); }, []);
  useEffect(() => { load(); }, [asignacionId, soloPendientes]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Entregas</h1>
              <p className="text-slate-600 mt-1 text-sm">Bandeja de entregas del orientador. Filtra por curso/asignación y controla pendientes.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={load}>Recargar</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Asignación</label>
              <select className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={asignacionId} onChange={(e)=> setAsignacionId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">Selecciona una</option>
                {asignaciones.map(a => <option key={a.id} value={a.id}>{a.titulo || `Asignación #${a.id}`}</option>)}
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
          <div className="space-y-6">
            {!asignacionId ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-slate-600 text-sm">Selecciona una asignación para ver su resumen de entregas.</div>
            ) : (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border p-4 bg-emerald-50 border-emerald-200">
                      <div className="text-xs text-emerald-700">Entregas realizadas</div>
                      <div className="text-2xl font-bold text-emerald-800">{Array.isArray(entregados) ? entregados.length : 0}</div>
                    </div>
                    <div className="rounded-xl border p-4 bg-amber-50 border-amber-200">
                      <div className="text-xs text-amber-700">Pendientes</div>
                      <div className="text-2xl font-bold text-amber-800">{Array.isArray(noEntregados) ? noEntregados.length : 0}</div>
                    </div>
                    <div className="rounded-xl border p-4 bg-sky-50 border-sky-200">
                      <div className="text-xs text-sky-700">Total estudiantes</div>
                      <div className="text-2xl font-bold text-sky-800">{(Array.isArray(entregados) ? entregados.length : 0) + (Array.isArray(noEntregados) ? noEntregados.length : 0)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">Entregados</div>
                    <div className="divide-y divide-slate-100">
                      {(!Array.isArray(entregados) || entregados.length === 0) && (
                        <div className="px-4 py-6 text-slate-500 text-sm">Sin entregas.</div>
                      )}
                      {Array.isArray(entregados) && entregados.map((it: any, idx: number) => (
                        <div key={idx} className="px-4 py-3 text-sm flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-800">{it.estudianteNombre || it.estudiante?.nombre || `Estudiante #${it.estudianteId || it.id || ''}`}</div>
                            {it.fechaEntrega && (<div className="text-slate-500">{new Date(it.fechaEntrega).toLocaleString()}</div>)}
                          </div>
                          <Button size="sm" variant="secondary" onClick={()=> setExpandedId(expandedId === idx ? null : idx)}>{expandedId === idx ? 'Ocultar' : 'Ver'}</Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-800">No entregados</div>
                    <div className="divide-y divide-slate-100">
                      {(!Array.isArray(noEntregados) || noEntregados.length === 0) && (
                        <div className="px-4 py-6 text-slate-500 text-sm">Sin pendientes.</div>
                      )}
                      {Array.isArray(noEntregados) && noEntregados
                        .filter((it: any) => soloPendientes ? true : true)
                        .map((it: any, idx: number) => (
                        <div key={idx} className="px-4 py-3 text-sm">
                          <div className="font-medium text-slate-800">{it.estudianteNombre || it.estudiante?.nombre || `Estudiante #${it.estudianteId || it.id || ''}`}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
