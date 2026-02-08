import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSession } from '../api/endpoints';
import { getCursosPorInstitucion, getEstudianteById, patchEstudiante } from '../api/endpointsDocente-orinetador';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Swal from 'sweetalert2';

type CursoOption = {
  id: number;
  nombre: string;
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

function formatDateInput(value?: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value.length >= 10 ? value.slice(0, 10) : value;
  return '';
}

function toForm(raw: any): EstudianteForm {
  return {
    nombres: raw?.nombres ?? raw?.nombre ?? '',
    apellidos: raw?.apellidos ?? raw?.apellido ?? '',
    tipoDocumento: raw?.tipoDocumento ?? raw?.tipo_documento ?? '',
    numeroDocumento: raw?.numeroDocumento ?? raw?.numero_documento ?? '',
    fechaNacimiento: formatDateInput(raw?.fechaNacimiento ?? raw?.fecha_nacimiento),
    sexo: raw?.sexo ?? '',
    grupoSanguineo: (raw?.grupoSanguineo ?? raw?.grupo_sanguineo ?? '') || '',
    rh: raw?.rh ?? '',
    paisNacimiento: raw?.paisNacimiento ?? raw?.pais_nacimiento ?? '',
    ciudadNacimiento: raw?.ciudadNacimiento ?? raw?.ciudad_nacimiento ?? '',
    estrato: raw?.estrato === null || raw?.estrato === undefined ? '' : String(raw?.estrato),
    etnia: raw?.etnia ?? '',
    eps: raw?.eps ?? '',
    cursoId: raw?.cursoId ?? raw?.curso_id ? String(raw?.cursoId ?? raw?.curso_id) : '',
  };
}

function buildPatchPayload(current: EstudianteForm, original: EstudianteForm) {
  const payload: Record<string, any> = {};

  (Object.keys(current) as (keyof EstudianteForm)[]).forEach((k) => {
    if (current[k] !== original[k]) {
      payload[k] = current[k];
    }
  });

  if ('estrato' in payload) {
    payload.estrato = payload.estrato === '' ? null : Number(payload.estrato);
  }

  if ('cursoId' in payload) {
    payload.cursoId = payload.cursoId === '' ? undefined : Number(payload.cursoId);
  }

  ['grupoSanguineo', 'rh', 'paisNacimiento', 'ciudadNacimiento', 'etnia', 'eps'].forEach((k) => {
    if (k in payload) {
      payload[k] = payload[k] === '' ? null : payload[k];
    }
  });

  if ('tipoDocumento' in payload && payload.tipoDocumento === '') payload.tipoDocumento = undefined;
  if ('numeroDocumento' in payload && payload.numeroDocumento === '') payload.numeroDocumento = undefined;
  if ('fechaNacimiento' in payload && payload.fechaNacimiento === '') payload.fechaNacimiento = undefined;
  if ('sexo' in payload && payload.sexo === '') payload.sexo = undefined;

  return payload;
}

export default function EditarEstudiantePage() {
  const navigate = useNavigate();
  const params = useParams();
  const estudianteId = Number(params.id);

  const session = getSession();
  const institucionId = session?.user?.institucionId ?? (session as any)?.context?.institucionId;

  const [loadingInicial, setLoadingInicial] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [coursesOptions, setCoursesOptions] = useState<CursoOption[]>([]);

  const [studentForm, setStudentForm] = useState<EstudianteForm | null>(null);
  const [originalStudent, setOriginalStudent] = useState<EstudianteForm | null>(null);

  const dirty = useMemo(() => {
    if (!studentForm || !originalStudent) return false;
    return JSON.stringify(studentForm) !== JSON.stringify(originalStudent);
  }, [studentForm, originalStudent]);

  useEffect(() => {
    const run = async () => {
      setLoadingInicial(true);
      setError(null);

      if (!Number.isFinite(estudianteId) || estudianteId <= 0) {
        setError('ID de estudiante inválido');
        setLoadingInicial(false);
        return;
      }

      try {
        const estudianteRes = await getEstudianteById(estudianteId);
        if (!estudianteRes.success) {
          setError(estudianteRes.message || 'No se pudo cargar el estudiante');
          setLoadingInicial(false);
          return;
        }

        const form = toForm(estudianteRes.data);
        setStudentForm(form);
        setOriginalStudent(form);

        if (institucionId) {
          const cursosRes = await getCursosPorInstitucion(Number(institucionId));
          if (cursosRes.success) {
            setCoursesOptions((cursosRes.data || []).map((c: any) => ({ id: Number(c.id), nombre: c.nombre })));
          } else {
            setCoursesOptions([]);
          }
        } else {
          setCoursesOptions([]);
        }
      } catch (e: any) {
        setError(e?.message || 'Error al precargar datos');
      } finally {
        setLoadingInicial(false);
      }
    };

    run();
  }, [estudianteId, institucionId]);

  const handleChangeCurso = (nuevoCursoId: string) => {
    if (!studentForm) return;
    const anterior = studentForm.cursoId;
    if (nuevoCursoId === anterior) return;

    const ok = window.confirm('¿Seguro que deseas cambiar el curso del estudiante?');
    if (!ok) {
      setStudentForm({ ...studentForm, cursoId: anterior });
      return;
    }

    setStudentForm({ ...studentForm, cursoId: nuevoCursoId });
  };

  const validate = (): string | null => {
    if (!studentForm) return 'Formulario inválido';
    if (!studentForm.nombres.trim()) return 'El nombre es obligatorio';
    if (!studentForm.apellidos.trim()) return 'El apellido es obligatorio';
    if (!studentForm.tipoDocumento.trim()) return 'El tipo de documento es obligatorio';
    if (!studentForm.numeroDocumento.trim()) return 'El número de documento es obligatorio';
    if (!studentForm.cursoId) return 'Debe seleccionar un curso';
    return null;
  };

  const handleGuardar = async () => {
    if (!studentForm || !originalStudent) return;

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    const payload = buildPatchPayload(studentForm, originalStudent);
    if (Object.keys(payload).length === 0) {
      navigate('/estudiantes');
      return;
    }

    setSaving(true);
    setError(null);

    const res = await patchEstudiante(estudianteId, payload);
    if (!res.success) {
      setError(res.message || 'Error al guardar');
      setSaving(false);
      return;
    }

    const updatedForm = toForm(res.data);
    setStudentForm(updatedForm);
    setOriginalStudent(updatedForm);
    setSaving(false);
    await Swal.fire({
      title: 'Se editó correctamente',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#4f46e5'
    });
    navigate('/estudiantes');
  };

  if (loadingInicial || !studentForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Cargando estudiante..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Editar estudiante</h1>
          <p className="text-slate-600 mt-1">Actualiza los datos y el curso del estudiante</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/estudiantes')} disabled={saving}>
            Volver
          </Button>
          <Button onClick={handleGuardar} disabled={saving || !dirty} loading={saving}>
            Guardar
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormFieldInput
            name="nombres"
            label="Nombres"
            value={studentForm.nombres}
            onChange={(e) => setStudentForm({ ...studentForm, nombres: e.target.value })}
            required
          />
          <FormFieldInput
            name="apellidos"
            label="Apellidos"
            value={studentForm.apellidos}
            onChange={(e) => setStudentForm({ ...studentForm, apellidos: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de documento</label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              value={studentForm.tipoDocumento}
              onChange={(e) => setStudentForm({ ...studentForm, tipoDocumento: e.target.value })}
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
            value={studentForm.numeroDocumento}
            onChange={(e) => setStudentForm({ ...studentForm, numeroDocumento: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormFieldInput
            name="fechaNacimiento"
            label="Fecha de nacimiento"
            type="date"
            value={studentForm.fechaNacimiento}
            onChange={(e) => setStudentForm({ ...studentForm, fechaNacimiento: e.target.value })}
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sexo</label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              value={studentForm.sexo}
              onChange={(e) => setStudentForm({ ...studentForm, sexo: e.target.value })}
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
            value={studentForm.grupoSanguineo}
            onChange={(e) => setStudentForm({ ...studentForm, grupoSanguineo: e.target.value })}
          />
          <FormFieldInput
            name="rh"
            label="RH"
            value={studentForm.rh}
            onChange={(e) => setStudentForm({ ...studentForm, rh: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormFieldInput
            name="paisNacimiento"
            label="País de nacimiento"
            value={studentForm.paisNacimiento}
            onChange={(e) => setStudentForm({ ...studentForm, paisNacimiento: e.target.value })}
          />
          <FormFieldInput
            name="ciudadNacimiento"
            label="Ciudad de nacimiento"
            value={studentForm.ciudadNacimiento}
            onChange={(e) => setStudentForm({ ...studentForm, ciudadNacimiento: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormFieldInput
            name="estrato"
            label="Estrato"
            type="number"
            value={studentForm.estrato}
            onChange={(e) => setStudentForm({ ...studentForm, estrato: e.target.value })}
          />
          <FormFieldInput
            name="etnia"
            label="Etnia"
            value={studentForm.etnia}
            onChange={(e) => setStudentForm({ ...studentForm, etnia: e.target.value })}
          />
          <FormFieldInput
            name="eps"
            label="EPS"
            value={studentForm.eps}
            onChange={(e) => setStudentForm({ ...studentForm, eps: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Curso</label>
          <select
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
            value={studentForm.cursoId}
            onChange={(e) => handleChangeCurso(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            {coursesOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          {!institucionId && (
            <p className="text-xs text-gray-500 mt-2">
              No se encontró la institución en sesión; el selector de cursos puede quedar vacío.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
