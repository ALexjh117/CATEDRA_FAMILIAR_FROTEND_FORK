import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAcudientesDeEstudianteAPI, getSession } from '../api/endpoints';
import { getEstudiantesInstitucionOrientador, updateEstudianteOrientador } from '../api/endpointsDocente-orinetador';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { IconEdit, IconFamily, IconUsers } from '../components/ui/Icons';

type EstudianteRow = {
  id: number;
  nombres?: string;
  apellidos?: string;
  nombre?: string;
  apellido?: string;
  numero_documento?: string;
  numeroDocumento?: string;
  tipo_documento?: string;
  tipoDocumento?: string;
  fecha_nacimiento?: string;
  fechaNacimiento?: string;
  sexo?: string;
  grupo_sanguineo?: string | null;
  grupoSanguineo?: string | null;
  rh?: string | null;
  pais_nacimiento?: string | null;
  paisNacimiento?: string | null;
  ciudad_nacimiento?: string | null;
  ciudadNacimiento?: string | null;
  estrato?: number | null;
  etnia?: string | null;
  eps?: string | null;
  curso_id?: number;
  cursoId?: number;
  curso?: string;
  grado_id?: number;
  gradoId?: number;
};

type EstudianteForm = {
  nombres: string;
  apellidos: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  sexo: string;
  grupoSanguineo: string;
  rh: string;
  paisNacimiento: string;
  ciudadNacimiento: string;
  estrato: string;
  etnia: string;
  eps: string;
  cursoId: string;
};

export default function EstudiantesPage() {
  const navigate = useNavigate();
  const session = getSession();
  const rol = session?.user?.rol;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteRow[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const [modalEditar, setModalEditar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [estudianteEditando, setEstudianteEditando] = useState<EstudianteRow | null>(null);
  const [form, setForm] = useState<EstudianteForm>({
    nombres: '',
    apellidos: '',
    tipoDocumento: '',
    numeroDocumento: '',
    fechaNacimiento: '',
    sexo: '',
    grupoSanguineo: '',
    rh: '',
    paisNacimiento: '',
    ciudadNacimiento: '',
    estrato: '',
    etnia: '',
    eps: '',
    cursoId: '',
  });

  const [modalAcudientes, setModalAcudientes] = useState(false);
  const [acudientesLoading, setAcudientesLoading] = useState(false);
  const [acudientesError, setAcudientesError] = useState<string | null>(null);
  const [acudientes, setAcudientes] = useState<any[]>([]);
  const [estudianteAcudientes, setEstudianteAcudientes] = useState<EstudianteRow | null>(null);

  const limpiarCurso = (nombre?: string) => {
    if (!nombre) return '-';
    return String(nombre).replace(/^\d+_/, '');
  };

  const gradoDesdeCurso = (nombre?: string) => {
    const limpio = limpiarCurso(nombre);
    const match = String(limpio).match(/^(\d{1,2})/); // toma 1-2 dígitos iniciales
    return match ? match[1] : '-';
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        if (rol !== 'orientador') {
          setEstudiantes([]);
          setError('No autorizado para ver esta sección.');
          return;
        }

        const res = await getEstudiantesInstitucionOrientador();
        const raw = (res as any)?.data ?? res;
        const arr = Array.isArray(raw) ? raw : [];
        // Filtro adicional por institución desde sesión (por si el backend trae de más)
        const instId = (session as any)?.context?.institucionId || session?.user?.institucionId || (session as any)?.user?.institucion;
        const pref = instId ? `${String(instId)}_` : '';
        const onlyInst = pref
          ? arr.filter((e: any) => {
              const cursoNombre = e?.curso || e?.cursoNombre || e?.curso_nombre || e?.curso?.nombre;
              return typeof cursoNombre === 'string' ? cursoNombre.startsWith(pref) : true;
            })
          : arr;
        setEstudiantes(onlyInst as any);
      } catch (e: any) {
        setEstudiantes([]);
        setError(e?.message || 'Error al cargar estudiantes');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [rol]);

  const formatDateInput = (value?: string) => {
    if (!value) return '';
    if (typeof value !== 'string') return '';
    return value.length >= 10 ? value.slice(0, 10) : value;
  };

  const openEdit = (s: EstudianteRow) => {
    const nombres = s.nombres ?? s.nombre ?? '';
    const apellidos = s.apellidos ?? s.apellido ?? '';
    const tipoDocumento = s.tipoDocumento ?? s.tipo_documento ?? '';
    const numeroDocumento = s.numeroDocumento ?? s.numero_documento ?? '';
    const fechaNacimiento = formatDateInput(s.fechaNacimiento ?? s.fecha_nacimiento);
    const sexo = s.sexo ?? '';
    const grupoSanguineo = (s.grupoSanguineo ?? s.grupo_sanguineo ?? '') || '';
    const rh = s.rh || '';
    const paisNacimiento = s.paisNacimiento ?? s.pais_nacimiento ?? '';
    const ciudadNacimiento = s.ciudadNacimiento ?? s.ciudad_nacimiento ?? '';
    const estrato = s.estrato === null || s.estrato === undefined ? '' : String(s.estrato);
    const etnia = s.etnia ?? '';
    const eps = s.eps ?? '';
    const cursoId = s.cursoId ?? s.curso_id;

    setEstudianteEditando(s);
    setForm({
      nombres,
      apellidos,
      tipoDocumento,
      numeroDocumento,
      fechaNacimiento,
      sexo,
      grupoSanguineo,
      rh,
      paisNacimiento,
      ciudadNacimiento,
      estrato,
      etnia,
      eps,
      cursoId: cursoId ? String(cursoId) : '',
    });
    setModalEditar(true);
  };

  const goToEdit = (s: EstudianteRow) => {
    if (!s?.id) {
      openEdit(s);
      return;
    }
    navigate(`/estudiantes/${s.id}/editar`);
  };

  const closeEdit = () => {
    setModalEditar(false);
    setSaving(false);
    setEstudianteEditando(null);
  };

  const handleGuardar = async () => {
    if (!estudianteEditando) return;

    setSaving(true);
    setError(null);

    const payload: Record<string, any> = {
      nombres: form.nombres,
      apellidos: form.apellidos,
      tipoDocumento: form.tipoDocumento || undefined,
      numeroDocumento: form.numeroDocumento || undefined,
      fechaNacimiento: form.fechaNacimiento || undefined,
      sexo: form.sexo || undefined,
      grupoSanguineo: form.grupoSanguineo || null,
      rh: form.rh || null,
      paisNacimiento: form.paisNacimiento || null,
      ciudadNacimiento: form.ciudadNacimiento || null,
      estrato: form.estrato ? Number(form.estrato) : null,
      etnia: form.etnia || null,
      eps: form.eps || null,
      cursoId: form.cursoId ? Number(form.cursoId) : undefined,
    };

    const res = await updateEstudianteOrientador(estudianteEditando.id, payload);
    if (!res.success) {
      setError(res.message || 'Error al actualizar estudiante');
      setSaving(false);
      return;
    }

    try {
      const data = await getEstudiantesInstitucionOrientador();
      setEstudiantes(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Estudiante actualizado, pero hubo un error recargando la lista');
    } finally {
      setSaving(false);
      setModalEditar(false);
      setEstudianteEditando(null);
    }
  };

  const openAcudientes = async (s: EstudianteRow) => {
    setEstudianteAcudientes(s);
    setModalAcudientes(true);
    setAcudientes([]);
    setAcudientesError(null);
    setAcudientesLoading(true);

    try {
      const res = await getAcudientesDeEstudianteAPI(s.id);
      if (!res.success) {
        setAcudientes([]);
        setAcudientesError(res.error || 'Error al obtener acudientes');
        return;
      }
      setAcudientes(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setAcudientes([]);
      setAcudientesError(e?.message || 'Error al obtener acudientes');
    } finally {
      setAcudientesLoading(false);
    }
  };

  const closeAcudientes = () => {
    setModalAcudientes(false);
    setAcudientesLoading(false);
    setAcudientesError(null);
    setAcudientes([]);
    setEstudianteAcudientes(null);
  };

  const filtered = useMemo(() => {
    if (!busqueda.trim()) return estudiantes;
    const q = busqueda.toLowerCase().trim();

    return estudiantes.filter((s) => {
      const nombres = (s.nombres ?? s.nombre ?? '').toLowerCase();
      const apellidos = (s.apellidos ?? s.apellido ?? '').toLowerCase();
      const doc = (s.numero_documento ?? s.numeroDocumento ?? '').toLowerCase();
      const curso = (s.curso ?? '').toLowerCase();
      return (
        `${nombres} ${apellidos}`.includes(q) ||
        doc.includes(q) ||
        curso.includes(q)
      );
    });
  }, [busqueda, estudiantes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando estudiantes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Todos los estudiantes</h1>
          <p className="text-slate-600 mt-1">Listado de estudiantes de tu institución</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <IconUsers className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o curso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="text-sm text-slate-600">
            {filtered.length}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="text-left py-3.5 px-5 font-semibold text-slate-600 text-sm">Estudiante</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Documento</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Fecha nac.</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Sexo</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Grupo</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">RH</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">País</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Ciudad</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Estrato</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Etnia</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">EPS</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Curso</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Grado</th>
                <th className="text-center py-3.5 px-4 font-semibold text-slate-600 text-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500">
                    <IconUsers className="mx-auto mb-3 text-slate-400" size={48} />
                    <p className="font-medium">No hay estudiantes para mostrar</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const nombres = s.nombres ?? s.nombre ?? '';
                  const apellidos = s.apellidos ?? s.apellido ?? '';
                  const documento = s.numero_documento ?? s.numeroDocumento ?? '-';
                  const tipoDoc = s.tipo_documento ?? s.tipoDocumento ?? '';
                  const fechaNacimiento = formatDateInput(s.fechaNacimiento ?? s.fecha_nacimiento) || '-';
                  const sexo = s.sexo ?? '-';
                  const grupo = (s.grupoSanguineo ?? s.grupo_sanguineo) ?? '-';
                  const rh = s.rh ?? '-';
                  const pais = (s.paisNacimiento ?? s.pais_nacimiento) ?? '-';
                  const ciudad = (s.ciudadNacimiento ?? s.ciudad_nacimiento) ?? '-';
                  const estrato = s.estrato === null || s.estrato === undefined ? '-' : String(s.estrato);
                  const etnia = s.etnia ?? '-';
                  const eps = s.eps ?? '-';
                  const curso = limpiarCurso(s.curso);
                  const grado = gradoDesdeCurso(s.curso);

                  return (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {(nombres?.[0] || '?')}{(apellidos?.[0] || '')}
                          </div>
                          <div>
                            <div className="font-medium text-slate-800">{nombres} {apellidos}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">
                        {tipoDoc ? `${tipoDoc} ${documento}` : documento}
                      </td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{fechaNacimiento}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{sexo}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{grupo}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{rh}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{pais}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{ciudad}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{estrato}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{etnia}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{eps}</td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">
                        <span className="inline-block max-w-[80px] truncate align-middle">{curso}</span>
                      </td>
                      <td className="text-center py-4 px-4 text-slate-600 text-sm">{grado}</td>
                      <td className="text-center py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => goToEdit(s)}
                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Editar estudiante"
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            onClick={() => openAcudientes(s)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Ver padre de familia"
                          >
                            <IconFamily size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalEditar}
        onClose={closeEdit}
        title={estudianteEditando ? `Editar: ${(estudianteEditando.nombres ?? estudianteEditando.nombre ?? '')} ${(estudianteEditando.apellidos ?? estudianteEditando.apellido ?? '')}` : 'Editar Estudiante'}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput
              name="nombres"
              label="Nombres"
              value={form.nombres}
              onChange={(e) => setForm({ ...form, nombres: e.target.value })}
              required
            />
            <FormFieldInput
              name="apellidos"
              label="Apellidos"
              value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de documento</label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                value={form.tipoDocumento}
                onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                <option value="ti">TI</option>
                <option value="cc">CC</option>
                <option value="ce">CE</option>
              </select>
            </div>
            <FormFieldInput
              name="numeroDocumento"
              label="Número de documento"
              value={form.numeroDocumento}
              onChange={(e) => setForm({ ...form, numeroDocumento: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput
              name="fechaNacimiento"
              label="Fecha de nacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sexo</label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                <option value="M">M</option>
                <option value="F">F</option>
                <option value="O">O</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput
              name="grupoSanguineo"
              label="Grupo sanguíneo"
              value={form.grupoSanguineo}
              onChange={(e) => setForm({ ...form, grupoSanguineo: e.target.value })}
              placeholder="A, B, AB, O"
            />
            <FormFieldInput
              name="rh"
              label="RH"
              value={form.rh}
              onChange={(e) => setForm({ ...form, rh: e.target.value })}
              placeholder="+, -"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormFieldInput
              name="paisNacimiento"
              label="País de nacimiento"
              value={form.paisNacimiento}
              onChange={(e) => setForm({ ...form, paisNacimiento: e.target.value })}
            />
            <FormFieldInput
              name="ciudadNacimiento"
              label="Ciudad de nacimiento"
              value={form.ciudadNacimiento}
              onChange={(e) => setForm({ ...form, ciudadNacimiento: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormFieldInput
              name="estrato"
              label="Estrato"
              type="number"
              value={form.estrato}
              onChange={(e) => setForm({ ...form, estrato: e.target.value })}
            />
            <FormFieldInput
              name="etnia"
              label="Etnia"
              value={form.etnia}
              onChange={(e) => setForm({ ...form, etnia: e.target.value })}
            />
            <FormFieldInput
              name="eps"
              label="EPS"
              value={form.eps}
              onChange={(e) => setForm({ ...form, eps: e.target.value })}
            />
          </div>

          <FormFieldInput
            name="cursoId"
            label="Curso ID"
            type="number"
            value={form.cursoId}
            onChange={(e) => setForm({ ...form, cursoId: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={closeEdit} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={saving} loading={saving}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalAcudientes}
        onClose={closeAcudientes}
        title={estudianteAcudientes ? `Padre de familia: ${(estudianteAcudientes.nombres ?? estudianteAcudientes.nombre ?? '')} ${(estudianteAcudientes.apellidos ?? estudianteAcudientes.apellido ?? '')}` : 'Padre de familia'}
        size="lg"
      >
        <div className="space-y-3">
          {acudientesLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" text="Cargando acudientes..." />
            </div>
          ) : acudientesError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {acudientesError}
            </div>
          ) : acudientes.length === 0 ? (
            <div className="text-slate-600 text-sm">
              No hay acudientes asociados a este estudiante.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {acudientes.map((a: any, idx: number) => {
                const nombre = a?.nombre ?? a?.nombres ?? a?.usuario?.nombre ?? '';
                const apellido = a?.apellido ?? a?.apellidos ?? a?.usuario?.apellido ?? '';
                const correo = a?.correo ?? a?.usuario?.correo ?? '';
                const telefono = a?.telefono ?? a?.celular ?? '';
                return (
                  <div key={a?.id ?? idx} className="py-3">
                    <div className="font-medium text-slate-800">{`${nombre} ${apellido}`.trim() || 'Acudiente'}</div>
                    <div className="text-sm text-slate-600">{correo || '-'}</div>
                    <div className="text-sm text-slate-600">{telefono || '-'}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={closeAcudientes}>Cerrar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
