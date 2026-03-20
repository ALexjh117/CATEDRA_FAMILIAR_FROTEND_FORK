import { useMemo, useState } from 'react';
import Button from './ui/Button';

interface AlertaDetalleProps {
  alerta: any;
}

function getPrioridadStyles(prioridad: string) {
  const normalized = String(prioridad || '').toLowerCase();
  if (normalized.includes('crit')) {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }
  if (normalized.includes('mod') || normalized.includes('medi') || normalized.includes('alta')) {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  return 'border-sky-200 bg-sky-50 text-sky-700';
}

function getCardStyles(prioridad: string) {
  const normalized = String(prioridad || '').toLowerCase();
  if (normalized.includes('crit')) {
    return 'border-rose-200 bg-gradient-to-br from-white via-rose-50/50 to-rose-50';
  }
  if (normalized.includes('mod') || normalized.includes('medi') || normalized.includes('alta')) {
    return 'border-amber-200 bg-gradient-to-br from-white via-amber-50/50 to-amber-50';
  }
  return 'border-slate-200 bg-gradient-to-br from-white via-sky-50/40 to-slate-50';
}

function normalizeLines(message: string) {
  return String(message || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function AlertaDetalle({ alerta }: AlertaDetalleProps) {
  const [expandida, setExpandida] = useState(false);

  const datos = alerta?.datos_adicionales || alerta?.datosAdicionales || {};
  const acciones = Array.isArray(datos?.acciones_recomendadas)
    ? datos.acciones_recomendadas
    : Array.isArray(datos?.accionesRecomendadas)
      ? datos.accionesRecomendadas
      : [];
  const asignaturasCriticas = Array.isArray(datos?.asignaturas_criticas)
    ? datos.asignaturas_criticas
    : Array.isArray(datos?.asignaturasCriticas)
      ? datos.asignaturasCriticas
      : [];
  const asignaturasRiesgo = Array.isArray(datos?.asignaturas_riesgo)
    ? datos.asignaturas_riesgo
    : Array.isArray(datos?.asignaturasRiesgo)
      ? datos.asignaturasRiesgo
      : [];
  const tareasPendientes = Array.isArray(datos?.tareas_pendientes_detalle)
    ? datos.tareas_pendientes_detalle
    : Array.isArray(datos?.tareasPendientesDetalle)
      ? datos.tareasPendientesDetalle
      : [];

  const lines = useMemo(() => normalizeLines(alerta?.mensaje || ''), [alerta?.mensaje]);

  const titulo = alerta?.titulo || 'Alerta académica';
  const prioridad = alerta?.prioridad || 'Media';
  const estudiante = datos?.estudiante || alerta?.estudiante || alerta?.nombre_estudiante || alerta?.nombreEstudiante;
  const curso = datos?.curso || alerta?.curso || alerta?.curso_nombre || alerta?.cursoNombre;
  const promedioGeneral = datos?.promedio_general ?? datos?.promedioGeneral;
  const totalCalificaciones = datos?.total_calificaciones ?? datos?.totalCalificaciones;
  const totalTareasPendientes = datos?.tareas_pendientes ?? datos?.tareasPendientes ?? tareasPendientes.length;
  const proximaAccion = datos?.proxima_accion ?? datos?.proximaAccion;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${getCardStyles(prioridad)}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{titulo}</h3>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPrioridadStyles(prioridad)}`}>
              {prioridad}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            {estudiante && <span className="rounded-full bg-white/80 px-3 py-1 border border-slate-200">👤 {estudiante}</span>}
            {curso && <span className="rounded-full bg-white/80 px-3 py-1 border border-slate-200">📚 {curso}</span>}
            {typeof promedioGeneral !== 'undefined' && promedioGeneral !== null && <span className="rounded-full bg-white/80 px-3 py-1 border border-slate-200">📈 Promedio: {promedioGeneral}</span>}
            {typeof totalTareasPendientes !== 'undefined' && totalTareasPendientes !== null && Number(totalTareasPendientes) > 0 && <span className="rounded-full bg-white/80 px-3 py-1 border border-slate-200">📝 Pendientes: {totalTareasPendientes}</span>}
          </div>
        </div>

        <Button size="sm" variant="outline" onClick={() => setExpandida(!expandida)}>
          {expandida ? 'Ocultar detalles' : 'Ver detalles completos'}
        </Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {typeof promedioGeneral !== 'undefined' && promedioGeneral !== null && (
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Promedio general</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{promedioGeneral}</div>
          </div>
        )}
        {typeof totalCalificaciones !== 'undefined' && totalCalificaciones !== null && (
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Calificaciones analizadas</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{totalCalificaciones}</div>
          </div>
        )}
        {typeof totalTareasPendientes !== 'undefined' && totalTareasPendientes !== null && Number(totalTareasPendientes) > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tareas pendientes</div>
            <div className="mt-1 text-xl font-bold text-slate-900">{totalTareasPendientes}</div>
          </div>
        )}
      </div>

      {expandida && (
        <div className="mt-5 space-y-4">
          {lines.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="text-sm font-semibold text-slate-800">Detalle de la alerta</div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {lines.map((line, index) => (
                  <div key={`${line}-${index}`} className={line.includes('**') ? 'font-semibold text-slate-900' : ''}>
                    {line.replace(/\*\*/g, '')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(asignaturasCriticas.length > 0 || asignaturasRiesgo.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {asignaturasCriticas.length > 0 && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="text-sm font-semibold text-rose-800">Asignaturas críticas</div>
                  <div className="mt-3 space-y-2">
                    {asignaturasCriticas.map((item: any, index: number) => (
                      <div key={`crit-${index}`} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-sm">
                        <span className="font-medium text-slate-800">{item?.materia || item?.asignatura || item?.nombre || `Asignatura ${index + 1}`}</span>
                        <span className="font-semibold text-rose-700">{item?.promedio ?? item?.nota ?? item?.valor ?? '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {asignaturasRiesgo.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-amber-800">Asignaturas en riesgo</div>
                  <div className="mt-3 space-y-2">
                    {asignaturasRiesgo.map((item: any, index: number) => (
                      <div key={`risk-${index}`} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-sm">
                        <span className="font-medium text-slate-800">{item?.materia || item?.asignatura || item?.nombre || `Asignatura ${index + 1}`}</span>
                        <span className="font-semibold text-amber-700">{item?.promedio ?? item?.nota ?? item?.valor ?? '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tareasPendientes.length > 0 && (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <div className="text-sm font-semibold text-sky-800">Tareas pendientes de calificar</div>
              <div className="mt-3 space-y-3">
                {tareasPendientes.map((tarea: any, index: number) => (
                  <div key={`task-${index}`} className="rounded-xl border border-sky-100 bg-white/80 p-3">
                    <div className="font-medium text-slate-900">{tarea?.titulo || tarea?.nombre || `Tarea ${index + 1}`}</div>
                    <div className="mt-1 text-sm text-slate-600">{tarea?.materia || tarea?.asignatura || 'Asignatura no disponible'}</div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      {(tarea?.fecha_entrega || tarea?.fechaEntrega) && <span>📅 Entregada: {formatDate(tarea?.fecha_entrega || tarea?.fechaEntrega)}</span>}
                      {(tarea?.tiempo_esperando || tarea?.tiempoEsperando) && <span>⏰ Esperando: {tarea?.tiempo_esperando || tarea?.tiempoEsperando}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {acciones.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-sm font-semibold text-emerald-800">Acciones recomendadas</div>
              <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                {acciones.map((accion: string, index: number) => (
                  <li key={`${accion}-${index}`} className="rounded-xl bg-white/80 px-3 py-2">{index + 1}. {accion}</li>
                ))}
              </ul>
            </div>
          )}

          {proximaAccion && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
              <span className="font-semibold">Próxima acción recomendada:</span> {proximaAccion}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
