import { useEffect, useMemo, useState } from 'react';
import TeacherLayout from '../components/TeacherLayout';
import { listarEstudiantesDocente, updateEstudianteDocente, type EstudianteBackend } from '../api/docentes';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import FormFieldInput from '../components/ui/FormFieldInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function EstudiantesDocentePage(){
  const [items, setItems] = useState<EstudianteBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editing, setEditing] = useState<EstudianteBackend | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(e => `${e.nombres} ${e.apellidos} ${e.numeroDocumento ?? ''}`.toLowerCase().includes(term));
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
      const data = await listarEstudiantesDocente();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar estudiantes');
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
        fechaNacimiento: editing.fechaNacimiento,
        sexo: editing.sexo,
        grupoSanguineo: editing.grupoSanguineo,
        rh: editing.rh,
        paisNacimiento: editing.paisNacimiento,
        ciudadNacimiento: editing.ciudadNacimiento,
        estrato: editing.estrato,
        etnia: editing.etnia,
        eps: editing.eps,
      };
      await updateEstudianteDocente(editing.id, payload);
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
            <h1 className="text-2xl font-display font-bold text-slate-800">Estudiantes (mis cursos)</h1>
            <p className="text-slate-600 text-sm">Listado filtrado por el backend según cursos del docente.</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre o documento"
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
              <div className="col-span-3">Documento</div>
              <div className="col-span-3">Curso</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>
            <div className="divide-y">
              {paginated.map(e => (
                <div key={e.id} className="grid grid-cols-12 px-4 py-3 items-center">
                  <div className="col-span-4">{e.nombres} {e.apellidos}</div>
                  <div className="col-span-3">{e.tipoDocumento ?? '-'} {e.numeroDocumento ?? ''}</div>
                  <div className="col-span-3">#{e.cursoId ?? '-'} </div>
                  <div className="col-span-2 flex justify-end">
                    <Button size="sm" variant="secondary" onClick={()=> setEditing(e)}>Editar</Button>
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

        <Modal isOpen={!!editing} onClose={()=> setEditing(null)} title="Editar Estudiante" size="lg">
          {!!editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormFieldInput label="Nombres" name="nombres" value={editing.nombres} onChange={(e)=> setEditing({...editing, nombres: e.target.value})} />
                <FormFieldInput label="Apellidos" name="apellidos" value={editing.apellidos} onChange={(e)=> setEditing({...editing, apellidos: e.target.value})} />
                <FormFieldInput label="Tipo Documento" name="tipoDocumento" value={editing.tipoDocumento || ''} onChange={(e)=> setEditing({...editing, tipoDocumento: e.target.value})} />
                <FormFieldInput label="Número Documento" name="numeroDocumento" value={editing.numeroDocumento || ''} onChange={(e)=> setEditing({...editing, numeroDocumento: e.target.value})} />
                <FormFieldInput label="Fecha Nacimiento" name="fechaNacimiento" type="date" value={editing.fechaNacimiento || ''} onChange={(e)=> setEditing({...editing, fechaNacimiento: e.target.value})} />
                <FormFieldInput label="Sexo" name="sexo" value={editing.sexo || ''} onChange={(e)=> setEditing({...editing, sexo: e.target.value})} />
                <FormFieldInput label="Grupo Sanguíneo" name="grupoSanguineo" value={editing.grupoSanguineo || ''} onChange={(e)=> setEditing({...editing, grupoSanguineo: e.target.value})} />
                <FormFieldInput label="RH" name="rh" value={editing.rh || ''} onChange={(e)=> setEditing({...editing, rh: e.target.value})} />
                <FormFieldInput label="País Nacimiento" name="paisNacimiento" value={editing.paisNacimiento || ''} onChange={(e)=> setEditing({...editing, paisNacimiento: e.target.value})} />
                <FormFieldInput label="Ciudad Nacimiento" name="ciudadNacimiento" value={editing.ciudadNacimiento || ''} onChange={(e)=> setEditing({...editing, ciudadNacimiento: e.target.value})} />
                <FormFieldInput label="Estrato" name="estrato" value={String(editing.estrato ?? '')} onChange={(e)=> setEditing({...editing, estrato: e.target.value})} />
                <FormFieldInput label="Etnia" name="etnia" value={editing.etnia || ''} onChange={(e)=> setEditing({...editing, etnia: e.target.value})} />
                <FormFieldInput label="EPS" name="eps" value={editing.eps || ''} onChange={(e)=> setEditing({...editing, eps: e.target.value})} />
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
