import { useEffect, useMemo, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { listarAcudientesDocente, updateAcudienteDocente, type AcudienteBackend } from '../api/docentes';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import FormFieldInput from '../components/ui/FormFieldInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function PadresDocentePage(){
  const [items, setItems] = useState<AcudienteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState<AcudienteBackend | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(a => `${a.nombres} ${a.apellidos} ${a.numeroDocumento ?? ''} ${a.correo ?? ''}`.toLowerCase().includes(term));
  }, [items, q]);

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listarAcudientesDocente();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar acudientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        nombres: editing.nombres,
        apellidos: editing.apellidos,
        tipoDocumento: editing.tipoDocumento,
        numeroDocumento: editing.numeroDocumento,
        telefono: editing.telefono,
        telefonoAlternativo: editing.telefonoAlternativo,
        correo: editing.correo,
        direccion: editing.direccion,
        parentesco: editing.parentesco,
        ocupacion: editing.ocupacion,
        tipoTrabajo: editing.tipoTrabajo,
        nivelEducativo: editing.nivelEducativo,
        aportaEconomia: editing.aportaEconomia,
        horarioTrabajo: editing.horarioTrabajo,
      };
      await updateAcudienteDocente(editing.id, payload);
      setEditing(null);
      await load();
    } catch (e) {
      // TODO: add toast
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-800">Acudientes (mis estudiantes)</h1>
            <p className="text-slate-600 text-sm">Listado filtrado por el backend según cursos del docente.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre, documento o correo"
              className="px-3 py-2 rounded-xl border border-slate-200 w-64"
            />
            <select className="px-3 py-2 rounded-xl border border-slate-200" value={limit} onChange={(e)=>{setLimit(Number(e.target.value)); setPage(1);}}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <Button variant="secondary" onClick={load}>Recargar</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><LoadingSpinner size="lg" text="Cargando..."/></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold text-slate-500 bg-slate-50">
              <div className="col-span-4">Nombre</div>
              <div className="col-span-3">Contacto</div>
              <div className="col-span-3">Documento</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>
            <div className="divide-y">
              {paginated.map(a => (
                <div key={a.id} className="grid grid-cols-12 px-4 py-3 items-center">
                  <div className="col-span-4">{a.nombres} {a.apellidos}</div>
                  <div className="col-span-3">{a.correo ?? '-'}{a.telefono ? ` · ${a.telefono}` : ''}</div>
                  <div className="col-span-3">{a.tipoDocumento ?? '-'} {a.numeroDocumento ?? ''}</div>
                  <div className="col-span-2 flex justify-end">
                    <Button size="sm" variant="secondary" onClick={()=> setEditing(a)}>Editar</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
              <div className="text-sm text-slate-600">Página {page} de {totalPages}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={()=> setPage(1)} disabled={page===1}>«</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(p=> Math.max(1, p-1))} disabled={page===1}>Anterior</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(p=> Math.min(totalPages, p+1))} disabled={page===totalPages}>Siguiente</Button>
                <Button size="sm" variant="ghost" onClick={()=> setPage(totalPages)} disabled={page===totalPages}>»</Button>
              </div>
            </div>
          </div>
        )}

        <Modal isOpen={!!editing} onClose={()=> setEditing(null)} title="Editar Acudiente" size="lg">
          {!!editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormFieldInput label="Nombres" name="nombres" value={editing.nombres} onChange={(e)=> setEditing({...editing, nombres: e.target.value})} />
                <FormFieldInput label="Apellidos" name="apellidos" value={editing.apellidos} onChange={(e)=> setEditing({...editing, apellidos: e.target.value})} />
                <FormFieldInput label="Tipo Documento" name="tipoDocumento" value={editing.tipoDocumento || ''} onChange={(e)=> setEditing({...editing, tipoDocumento: e.target.value})} />
                <FormFieldInput label="Número Documento" name="numeroDocumento" value={editing.numeroDocumento || ''} onChange={(e)=> setEditing({...editing, numeroDocumento: e.target.value})} />
                <FormFieldInput label="Teléfono" name="telefono" value={editing.telefono || ''} onChange={(e)=> setEditing({...editing, telefono: e.target.value})} />
                <FormFieldInput label="Teléfono Alternativo" name="telefonoAlternativo" value={editing.telefonoAlternativo || ''} onChange={(e)=> setEditing({...editing, telefonoAlternativo: e.target.value})} />
                <FormFieldInput label="Correo" name="correo" value={editing.correo || ''} onChange={(e)=> setEditing({...editing, correo: e.target.value})} />
                <FormFieldInput label="Dirección" name="direccion" value={editing.direccion || ''} onChange={(e)=> setEditing({...editing, direccion: e.target.value})} />
                <FormFieldInput label="Parentesco" name="parentesco" value={editing.parentesco || ''} onChange={(e)=> setEditing({...editing, parentesco: e.target.value})} />
                <FormFieldInput label="Ocupación" name="ocupacion" value={editing.ocupacion || ''} onChange={(e)=> setEditing({...editing, ocupacion: e.target.value})} />
                <FormFieldInput label="Tipo de Trabajo" name="tipoTrabajo" value={editing.tipoTrabajo || ''} onChange={(e)=> setEditing({...editing, tipoTrabajo: e.target.value})} />
                <FormFieldInput label="Nivel Educativo" name="nivelEducativo" value={editing.nivelEducativo || ''} onChange={(e)=> setEditing({...editing, nivelEducativo: e.target.value})} />
                <FormFieldInput label="Aporta Economía" name="aportaEconomia" value={String(editing.aportaEconomia ?? '')} onChange={(e)=> setEditing({...editing, aportaEconomia: e.target.value as any})} />
                <FormFieldInput label="Horario de Trabajo" name="horarioTrabajo" value={editing.horarioTrabajo || ''} onChange={(e)=> setEditing({...editing, horarioTrabajo: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={()=> setEditing(null)}>Cancelar</Button>
                <Button onClick={onSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </TeacherLayout>
  );
}
