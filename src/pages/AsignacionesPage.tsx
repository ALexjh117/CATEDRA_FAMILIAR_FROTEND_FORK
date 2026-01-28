import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import FormFieldInput from '../components/ui/FormFieldInput';
import Swal from 'sweetalert2';
import { createAsignacion, getCursosByDocente, getPeriodos, getSession, getTareas } from '../api/endpoints';

type AsignacionCreatePayload = {
  bancoTareaId: number;
  periodoId: number;
  cursoId?: number;
  cursoIds?: number[];
  fechaInicio?: string;
  fechaVencimiento?: string;
  frecuencia?: string;
  incluirEnBoletin?: boolean;
  titulo?: string;
  descripcion?: string;
  tema?: string;
  institucionId?: number;
  docenteId?: number;
};

export default function AsignacionesPage() {
  const session = getSession();
  const user = session?.user;

  const [loading, setLoading] = useState(true);
  const [tareasBanco, setTareasBanco] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [periodos, setPeriodos] = useState<any[]>([]);

  const hoyIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [bancoTareaId, setBancoTareaId] = useState<number>(0);
  const [periodoId, setPeriodoId] = useState<number>(0);

  const [esMultiCurso, setEsMultiCurso] = useState(false);
  const [cursoId, setCursoId] = useState<number>(0);
  const [cursoIds, setCursoIds] = useState<number[]>([]);

  const [fechaInicio, setFechaInicio] = useState<string>(hoyIso);
  const [fechaVencimiento, setFechaVencimiento] = useState<string>('');
  const [frecuencia, setFrecuencia] = useState<string>('unica');
  const [incluirEnBoletin, setIncluirEnBoletin] = useState<boolean>(false);

  const [overrideTitulo, setOverrideTitulo] = useState<string>('');
  const [overrideDescripcion, setOverrideDescripcion] = useState<string>('');
  const [overrideTema, setOverrideTema] = useState<string>('');

  const [docenteIdOrientador, setDocenteIdOrientador] = useState<string>('');
  const [asignando, setAsignando] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const docenteId = user?.id || 0;

        const [tareas, cursosDocente, periodosData] = await Promise.all([
          getTareas(),
          getCursosByDocente(docenteId),
          getPeriodos(user?.institucionId)
        ]);

        setTareasBanco(Array.isArray(tareas) ? tareas : []);
        setCursos(Array.isArray(cursosDocente) ? cursosDocente : []);
        setPeriodos(Array.isArray(periodosData) ? periodosData : []);

        const primeraTareaId = Array.isArray(tareas) && tareas.length > 0 ? tareas[0].id : 0;
        const primerPeriodoId = Array.isArray(periodosData) && periodosData.length > 0 ? periodosData[0].id : 0;
        const primerCursoId = Array.isArray(cursosDocente) && cursosDocente.length > 0 ? cursosDocente[0].id : 0;

        setBancoTareaId(prev => prev || primeraTareaId);
        setPeriodoId(prev => prev || primerPeriodoId);
        setCursoId(prev => prev || primerCursoId);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, user?.institucionId]);

  const toggleCursoId = (id: number) => {
    setCursoIds((prev) => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleAsignar = async () => {
    if (asignando) return;

    if (!bancoTareaId) {
      await Swal.fire({
        icon: 'error',
        title: 'Tarea requerida',
        text: 'Debes seleccionar una tarea del banco.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (!periodoId) {
      await Swal.fire({
        icon: 'error',
        title: 'Período requerido',
        text: 'Debes seleccionar un período.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (esMultiCurso) {
      if (!cursoIds.length) {
        await Swal.fire({
          icon: 'error',
          title: 'Cursos requeridos',
          text: 'Debes seleccionar al menos un curso.',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    } else {
      if (!cursoId) {
        await Swal.fire({
          icon: 'error',
          title: 'Curso requerido',
          text: 'Debes seleccionar un curso.',
          confirmButtonText: 'Entendido'
        });
        return;
      }
    }

    const esOrientador = user?.rol === 'orientador';
    const docenteIdParsed = docenteIdOrientador ? Number(docenteIdOrientador) : 0;
    if (esOrientador && !docenteIdParsed) {
      await Swal.fire({
        icon: 'error',
        title: 'Docente requerido',
        text: 'Como orientador debes indicar el docenteId.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const payload: AsignacionCreatePayload = {
      bancoTareaId,
      periodoId,
      fechaInicio: fechaInicio || undefined,
      fechaVencimiento: fechaVencimiento || undefined,
      frecuencia: frecuencia || undefined,
      incluirEnBoletin,
      titulo: overrideTitulo || undefined,
      descripcion: overrideDescripcion || undefined,
      tema: overrideTema || undefined,
      institucionId: user?.institucionId || undefined,
      docenteId: esOrientador ? docenteIdParsed : undefined
    };

    if (esMultiCurso) payload.cursoIds = cursoIds;
    else payload.cursoId = cursoId;

    try {
      setAsignando(true);

      const result = await createAsignacion(payload as any);
      if (!result.success) {
        await Swal.fire({
          icon: 'error',
          title: 'No se pudo asignar',
          text: result.error || 'Error al crear la asignación.',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Asignación creada',
        text: 'Se asignó la tarea correctamente.',
        confirmButtonText: 'Aceptar'
      });

      setOverrideTitulo('');
      setOverrideDescripcion('');
      setOverrideTema('');
      setFechaInicio(hoyIso);
      setFechaVencimiento('');
      setFrecuencia('unica');
      setIncluirEnBoletin(false);
      setEsMultiCurso(false);
      setCursoIds([]);
    } catch (e: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error inesperado',
        text: e?.message || 'Ocurrió un error al asignar la tarea.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setAsignando(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando asignaciones..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h1 className="text-2xl font-bold text-slate-800">Asignar tarea</h1>
          <p className="text-slate-600 mt-1">Convierte una tarea del banco en una asignación para uno o varios cursos.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tarea del banco</label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none"
              value={bancoTareaId}
              onChange={(e) => setBancoTareaId(Number(e.target.value))}
            >
              {tareasBanco.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.titulo || `Tarea #${t.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Período</label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none"
              value={periodoId}
              onChange={(e) => setPeriodoId(Number(e.target.value))}
            >
              {periodos.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nombre || `Periodo #${p.id}`}
                </option>
              ))}
            </select>
          </div>

          {user?.rol === 'orientador' && (
            <FormFieldInput
              name="docenteId"
              label="Docente ID (requerido para orientador)"
              placeholder="Ej: 12"
              value={docenteIdOrientador}
              onChange={(e) => setDocenteIdOrientador(e.target.value)}
            />
          )}

          <div className="flex items-center gap-3">
            <input
              id="multiCurso"
              type="checkbox"
              className="h-4 w-4"
              checked={esMultiCurso}
              onChange={(e) => {
                const next = e.target.checked;
                setEsMultiCurso(next);
                if (!next) setCursoIds([]);
              }}
            />
            <label htmlFor="multiCurso" className="text-sm font-semibold text-gray-700">Asignar a varios cursos</label>
          </div>

          {!esMultiCurso ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Curso</label>
              <select
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none"
                value={cursoId}
                onChange={(e) => setCursoId(Number(e.target.value))}
              >
                {cursos.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre || `Curso #${c.id}`}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cursos</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cursos.map((c: any) => {
                  const checked = cursoIds.includes(c.id);
                  return (
                    <label key={c.id} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer ${checked ? 'border-teal-300 bg-teal-50' : 'border-gray-200 bg-white'}`}>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() => toggleCursoId(c.id)}
                      />
                      <span className="font-medium text-slate-800">{c.nombre || `Curso #${c.id}`}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldInput
              name="fechaInicio"
              label="Fecha inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />

            <FormFieldInput
              name="fechaVencimiento"
              label="Fecha vencimiento (opcional)"
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Frecuencia</label>
            <select
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none"
              value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value)}
            >
              <option value="unica">Única</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="incluirEnBoletin"
              type="checkbox"
              className="h-4 w-4"
              checked={incluirEnBoletin}
              onChange={(e) => setIncluirEnBoletin(e.target.checked)}
            />
            <label htmlFor="incluirEnBoletin" className="text-sm font-semibold text-gray-700">Incluir en boletín</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldInput
              name="tituloOverride"
              label="Título (opcional: solo para la asignación)"
              placeholder="Si lo dejas vacío, usa el del banco"
              value={overrideTitulo}
              onChange={(e) => setOverrideTitulo(e.target.value)}
            />

            <FormFieldInput
              name="temaOverride"
              label="Tema (opcional: solo para la asignación)"
              placeholder="Ej: Comunicación"
              value={overrideTema}
              onChange={(e) => setOverrideTema(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción (opcional: solo para la asignación)</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 outline-none min-h-[100px]"
              placeholder="Si lo dejas vacío, usa la del banco"
              value={overrideDescripcion}
              onChange={(e) => setOverrideDescripcion(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Volver
            </Button>
            <Button onClick={handleAsignar} loading={asignando}>
              Asignar
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
