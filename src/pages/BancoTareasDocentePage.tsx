import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import FormFieldInput from '../components/ui/FormFieldInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/ToastGlobal';
import { listarBancoTareas, listarCursos, listarPeriodos, crearAsignacion, crearAsignacionOrientador, type BancoTareaBackend, type CursoBackend, type PeriodoBackend } from '../api/docentes';
import { getCursosPorInstitucion, getGradosPublic } from '../api/endpointsDocente-orinetador';
import { getSession } from '../api/endpoints';

export default function BancoTareasDocentePage(){
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<BancoTareaBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const [cursos, setCursos] = useState<CursoBackend[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoBackend[]>([]);

  const [selected, setSelected] = useState<BancoTareaBackend | null>(null);
  const [saving, setSaving] = useState(false);
  const session = getSession();

  // Campos del modal
  const [cursoIds, setCursoIds] = useState<number[]>([]); // usaremos solo 1 curso (cursoId)
  const [periodoId, setPeriodoId] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaVencimiento, setFechaVencimiento] = useState<string>('');
  const [frecuencia, setFrecuencia] = useState<'unica'|'semanal'|'mensual'>('unica');
  const [incluirEnBoletin, setIncluirEnBoletin] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcionExtra, setDescripcionExtra] = useState('');
  const [enlaces, setEnlaces] = useState<string[]>(['']);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter(t => {
      const byQ = term ? (`${t.titulo} ${t.descripcion} ${t.tema ?? ''}`).toLowerCase().includes(term) : true;
      const byCat = categoriaId ? t.categoriaId === categoriaId : true;
      return byQ && byCat;
    });
  }, [items, q, categoriaId]);

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const isOrientador = session?.user?.rol === 'orientador';
      const instId = (session as any)?.user?.institucionId || (session as any)?.context?.institucionId || 0;

      const [tareas, cursosRes, periodosRes] = await Promise.all([
        listarBancoTareas(),
        (async () => {
          if (isOrientador) {
            // 1) Preferir /grados y aplanar cursos
            try {
              const gradosRes = await getGradosPublic();
              if (gradosRes.success && Array.isArray(gradosRes.data) && gradosRes.data.length) {
                const flat = gradosRes.data
                  .flatMap((g: any) => Array.isArray(g?.cursos) ? g.cursos.map((c: any) => ({ ...c, _grado: g })) : [])
                  .filter((c: any) => !instId || !c.institucionId || c.institucionId === instId)
                  .map((c: any) => ({ id: Number(c.id), nombre: c.nombre || `Curso #${c.id}` })) as CursoBackend[];
                if (flat.length) return flat;
              }
            } catch {}
            // 2) Fallback: /cursos/institucion/:id
            try {
              const r = await getCursosPorInstitucion(Number(instId || 0));
              const data = Array.isArray(r?.data) ? r.data : [];
              return data.map((c: any) => ({ id: Number(c.id), nombre: c.nombre || `Curso #${c.id}` })) as CursoBackend[];
            } catch {}
          }
          // Docente o fallback
          return await listarCursos();
        })(),
        listarPeriodos(),
      ]);
      setItems(Array.isArray(tareas) ? tareas : []);
      setCursos(Array.isArray(cursosRes) ? cursosRes : []);
      setPeriodos(Array.isArray(periodosRes) ? periodosRes : []);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar banco de tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAsignar = (t: BancoTareaBackend) => {
    setSelected(t);
    setTitulo(t.titulo);
    setCursoIds([]);
    setPeriodoId('');
    setFechaInicio('');
    setFechaVencimiento('');
    setFrecuencia('unica');
    setIncluirEnBoletin(false);
    setDescripcionExtra('');
    setEnlaces(['']);
  };

  const addEnlace = () => setEnlaces(prev => [...prev, '']);
  const removeEnlace = (idx: number) => setEnlaces(prev => prev.filter((_, i) => i !== idx));
  const updateEnlace = (idx: number, val: string) => setEnlaces(prev => prev.map((v, i) => i === idx ? val : v));

  const onAsignar = async () => {
    if (!selected) return;
    if (!periodoId || (cursoIds.length === 0)) { showToast('Selecciona período y un curso', 'error'); return; }
    if (cursoIds.length !== 1) { showToast('Por ahora solo se permite asignar a un curso a la vez', 'error'); return; }

    setSaving(true);
    try {
      // Empaquetar enlaces/notas en descripcion adicional si no hay campo dedicado
      const extra = buildExtraDescripcion();
      const descripcion = extra ? `${selected.descripcion}\n\n${extra}` : selected.descripcion;

      const isOrientador = session?.user?.rol === 'orientador';
      const today = new Date().toISOString().slice(0,10);
      const payload = {
        bancoTareaId: selected.id,
        cursoId: cursoIds[0],
        periodoId: Number(periodoId),
        fechaInicio: fechaInicio || today,
        fechaVencimiento: fechaVencimiento || undefined,
        frecuencia,
        incluirEnBoletin,
        titulo: titulo || selected.titulo,
        descripcion,
        tema: selected.tema,
        institucionId: session?.user?.institucionId,
      } as any;

      // Debug
      // eslint-disable-next-line no-console
      console.log('crearAsignacion payload:', payload);

      const result = isOrientador
        ? await crearAsignacionOrientador(payload)
        : await crearAsignacion(payload);

      const ok = (result as any)?.success !== false; // asumir éxito si backend no envía bandera
      if (!ok) {
        showToast((result as any)?.message || 'No se pudo asignar la tarea', 'error');
        return;
      }
      const createdId = (result as any)?.id || (result as any)?.data?.id;
      setSelected(null);
      showToast('Tarea asignada correctamente', 'success');
      navigate('/docente/asignaciones', { state: createdId ? { highlightId: createdId } : undefined });
    } catch (e: any) {
      console.error('crearAsignacion error:', e);
      const msg = e?.response?.data?.message || e?.message || 'No se pudo asignar la tarea. Intenta de nuevo.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const buildExtraDescripcion = () => {
    const lines: string[] = [];
    if (descripcionExtra.trim()) {
      lines.push(`Nota del docente: ${descripcionExtra.trim()}`);
    }
    const links = enlaces.map(e => e.trim()).filter(Boolean);
    if (links.length) {
      lines.push('Recursos de apoyo:');
      links.forEach((l, i) => lines.push(`- ${l}`));
    }
    return lines.join('\n');
  };

  const toggleCurso = (id: number) => {
    setCursoIds(prev => (prev.includes(id) ? [] : [id]));
  };

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 rounded-2xl p-6 border border-teal-100/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">Banco de Tareas</h1>
              <p className="text-slate-600 mt-1 text-sm">Selecciona una tarea y asígnala a tus cursos, agregando recursos de apoyo.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Buscar por título/tema"
                className="px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-teal-500 outline-none w-64"
              />
              <select className="px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-teal-500 outline-none" value={limit} onChange={(e)=>{setLimit(Number(e.target.value)); setPage(1);}}>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>
              <Button variant="secondary" onClick={load}>Recargar</Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{t.titulo}</h3>
                    </div>
                    {t.tema && <span className="px-2 py-1 text-xs rounded-lg bg-teal-50 text-teal-700 border border-teal-100">{t.tema}</span>}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3">{t.descripcion}</p>
                  {t.enlace && <a className="text-teal-600 text-sm underline" href={t.enlace} target="_blank">Recurso sugerido</a>}
                  <div className="mt-auto flex justify-end">
                    <Button size="sm" onClick={()=> openAsignar(t)}>Asignar</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-1 py-3">
              <div className="text-sm text-slate-600">Página {page} de {totalPages}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={()=> setPage(1)} disabled={page===1}>«</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(p=> Math.max(1, p-1))} disabled={page===1}>Anterior</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(p=> Math.min(totalPages, p+1))} disabled={page===totalPages}>Siguiente</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(totalPages)} disabled={page===totalPages}>»</Button>
              </div>
            </div>
          </>
        )}

        <Modal isOpen={!!selected} onClose={()=> setSelected(null)} title="Asignar tarea" size="lg">
          {!!selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormFieldInput label="Título" name="titulo" value={titulo} onChange={(e)=> setTitulo(e.target.value)} />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Periodo</label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={periodoId} onChange={(e)=> setPeriodoId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Selecciona periodo</option>
                    {periodos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                  {periodos.length === 0 && (
                    <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">No hay períodos disponibles. Configura un período activo para poder asignar.</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha inicio</label>
                  <input type="date" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={fechaInicio} onChange={(e)=> setFechaInicio(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha vencimiento</label>
                  <input type="date" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={fechaVencimiento} onChange={(e)=> setFechaVencimiento(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Frecuencia</label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500" value={frecuencia} onChange={(e)=> setFrecuencia(e.target.value as any)}>
                    <option value="unica">Única</option>
                    <option value="semanal">Semanal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input id="boletin" type="checkbox" className="w-4 h-4" checked={incluirEnBoletin} onChange={(e)=> setIncluirEnBoletin(e.target.checked)} />
                  <label htmlFor="boletin" className="text-sm text-slate-700">Incluir en boletín</label>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Selecciona curso(s)</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {cursos.map(c => (
                    <label key={c.id} className={`px-3 py-2 rounded-xl border-2 text-sm cursor-pointer ${cursoIds.includes(c.id) ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-300'}`}>
                      <input type="checkbox" className="mr-2" checked={cursoIds.includes(c.id)} onChange={()=> toggleCurso(c.id)} />
                      {c.nombre}
                    </label>
                  ))}
                </div>
                {cursos.length === 0 && (
                  <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">No hay cursos visibles para tu institución. Verifica que existan grados/cursos.</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nota adicional</label>
                <textarea className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 min-h-[90px]" value={descripcionExtra} onChange={(e)=> setDescripcionExtra(e.target.value)} placeholder="Mensaje para las familias o instrucciones extras" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-700">Enlaces de apoyo</div>
                  <Button size="sm" variant="secondary" onClick={addEnlace}>Añadir enlace</Button>
                </div>
                <div className="space-y-2">
                  {enlaces.map((v, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200" placeholder="https://..." value={v} onChange={(e)=> updateEnlace(idx, e.target.value)} />
                      <Button size="sm" variant="ghost" onClick={()=> removeEnlace(idx)} disabled={enlaces.length===1}>Quitar</Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={()=> setSelected(null)}>Cancelar</Button>
                <Button onClick={onAsignar} disabled={saving || !periodoId || cursoIds.length===0}>{saving ? 'Asignando...' : 'Asignar'}</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </TeacherLayout>
  );
}
