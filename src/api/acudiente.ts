import { httpService } from './httpService';

export interface TareaAsignadaMovil {
  id: number; // asignacionId
  titulo: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaVencimiento?: string;
  estado: 'pendiente' | 'entregada' | 'calificada' | 'vencida' | 'entregada_tardia';
  cursoId?: number;
  cursoNombre?: string;
}

// Obtiene estudiantes vinculados al acudiente autenticado (y opcionalmente asignaciones)
export async function getMisEstudiantesAcudiente(): Promise<Array<{ id: number; nombres?: string; apellidos?: string; cursoId?: number }>> {
  const res = await httpService.get('/acudientes/mis-estudiantes');
  const body: any = res.data;
  const data = (body && typeof body === 'object' && 'data' in body) ? (body as any).data : body;
  return Array.isArray(data?.estudiantes) ? data.estudiantes : (Array.isArray(data) ? data : []);
}

// Opcional: helper para páginas que quieran usar el paquete combinado
export async function getMisTareasAcudiente(): Promise<{ estudiantes: Array<{ id: number; nombres?: string; apellidos?: string; cursoId?: number }>; asignaciones?: any[] }> {
  const res = await httpService.get('/acudientes/mis-tareas');
  const body: any = res.data;
  const data = (body && typeof body === 'object' && 'data' in body) ? (body as any).data : body;
  const estudiantes = Array.isArray(data?.estudiantes) ? data.estudiantes : (Array.isArray(data) ? data : []);
  const asignaciones = Array.isArray(data?.asignaciones) ? data.asignaciones : undefined;
  return { estudiantes, asignaciones } as any;
}

export interface DetalleAsignacionMovil {
  id: number; // asignacionId
  titulo: string;
  descripcion?: string;
  fechaVencimiento?: string;
  curso?: { id: number; nombre: string };
  entrega?: {
    id: number;
    descripcion?: string;
    fechaEntrega: string;
    estado: string;
    archivos?: Array<{ url: string; nombre?: string; originalName?: string; fileName?: string; size?: number; mimeType?: string; extname?: string }>;
    nombreEnvio?: string;
    calificacion?: any;
  } | null;
  calificacion?: {
    nota: number;
    escala: 'Superior' | 'Alto' | 'Básico' | 'Bajo';
    esAutomatica?: boolean;
    retroalimentacion?: string;
    notaCualitativa?: string;
    calificadoPor?: string;
    fechaCalificacion?: string;
  } | null;
}

export async function listarTareasEstudiante(estudianteId: number | 'me', opts: { periodo?: number | string; periodoId?: number | string } = {}): Promise<TareaAsignadaMovil[]> {
  const params: any = {};
  const periodoParam = opts.periodoId ?? opts.periodo;
  if (periodoParam) params.periodo = periodoParam;
  // Endpoint general
  const idSeg = typeof estudianteId === 'string' ? estudianteId : String(estudianteId);
  const res = await httpService.get(`/estudiantes/${idSeg}/tareas`, params);
  const body: any = res.data;
  const dataGeneral = (body && typeof body === 'object' && 'data' in body) ? (body as any).data : body;

  if (Array.isArray(dataGeneral) && dataGeneral.length > 0) {
    const mapped = dataGeneral.map((a: any) => {
      const estadoRaw = a.estado || a.status || 'pendiente';
      const estadoNorm: TareaAsignadaMovil['estado'] = (
        ['pendiente','entregada','calificada','vencida','entregada_tardia'] as const
      ).includes(estadoRaw) ? estadoRaw : 'pendiente';
      return {
        id: Number(a.id),
        titulo: a.titulo || a.nombre || 'Tarea',
        descripcion: a.descripcion || a.detalle || '',
        fechaInicio: a.fechaInicio || a.fecha_inicio,
        fechaVencimiento: a.fechaVencimiento || a.fecha_vencimiento,
        estado: estadoNorm,
        cursoId: a.cursoId || a.curso_id || a.curso?.id,
        cursoNombre: a.cursoNombre || a.curso?.nombre,
      } as TareaAsignadaMovil;
    });
    return mapped;
  }

  // No usar /tareas aquí: corresponde al Banco de Tareas, no a asignaciones por curso

  // Fallback: historial (para tareas ya entregadas/calificadas)
  try {
    if (typeof estudianteId !== 'number') return [];
    const hist = await listarHistorialEstudiante(estudianteId, opts);
    if (!Array.isArray(hist) || hist.length === 0) return [];
    const mapped: TareaAsignadaMovil[] = hist.map((h: any) => {
      const asign = h.asignacion || h.tarea || h;
      const fechaV = asign.fechaVencimiento || asign.fecha_vencimiento || h.fechaVencimiento || h.fecha_vencimiento;
      const fechaE = h.fechaEntrega || h.fecha_entrega || h.entrega?.fechaEntrega;
      const tardia = (fechaV && fechaE) ? (new Date(fechaE).getTime() > new Date(fechaV).getTime()) : false;
      const tieneCalif = !!(h.calificacion || asign.calificacion);
      const estado: TareaAsignadaMovil['estado'] = tieneCalif ? 'calificada' : (tardia ? 'entregada_tardia' : 'entregada');
      return {
        id: Number(asign.id || h.asignacionId || h.tareaId || h.id),
        titulo: asign.titulo || asign.nombre || 'Tarea',
        descripcion: asign.descripcion || asign.detalle || '',
        fechaInicio: asign.fechaInicio || asign.fecha_inicio,
        fechaVencimiento: fechaV || undefined,
        estado,
        cursoId: asign.cursoId || asign.curso_id,
        cursoNombre: asign.cursoNombre || asign.curso?.nombre,
      } as TareaAsignadaMovil;
    });
    const unique = new Map<number, TareaAsignadaMovil>();
    for (const m of mapped) { if (typeof m.id === 'number') unique.set(m.id, m); }
    return Array.from(unique.values());
  } catch {
    return [];
  }
}

export async function getDetalleAsignacionMovil(asignacionId: number): Promise<DetalleAsignacionMovil> {
  try {
    const res = await httpService.get(`/asignaciones/${asignacionId}/detalle`);
    const body: any = res.data;
    const data = (body && typeof body === 'object' && 'data' in body) ? (body as any).data : body;
    return data as DetalleAsignacionMovil;
  } catch (err: any) {
    const res = await httpService.get(`/movil/asignaciones/${asignacionId}/detalle`);
    const body: any = res.data;
    const data = (body && typeof body === 'object' && 'data' in body) ? (body as any).data : body;
    return data as DetalleAsignacionMovil;
  }
}

export async function enviarEntregaMovil(asignacionId: number, payload: {
  estudianteId: number;
  descripcion?: string;
  archivos?: File[];
  archivosUrl?: string[];
  nombreEnvio?: string;
}): Promise<any> {
  const base = '/api';
  const token = (() => { try { const s = localStorage.getItem('session'); return s ? JSON.parse(s).token : null; } catch { return null; } })();
  const urlPrimary = `${base}/asignaciones/${asignacionId}/entregas`;
  const hasFiles = (payload.archivos && payload.archivos.length > 0);
  if (hasFiles) {
    const form = new FormData();
    form.append('estudianteId', String(payload.estudianteId));
    if (payload.descripcion) form.append('descripcion', payload.descripcion);
    if (payload.nombreEnvio) form.append('nombreEnvio', payload.nombreEnvio);
    (payload.archivos || []).forEach((f) => form.append('archivos', f));
    (payload.archivosUrl || []).forEach((u) => form.append('archivosUrl', u));

    const response = await httpService.post(`/asignaciones/${asignacionId}/entregas`, form);
    if (response.status !== 200 && response.status !== 201) throw new Error(response.data);
    return response.data;
  } else {
    const response = await httpService.post(`/asignaciones/${asignacionId}/entregas`, {
      estudianteId: payload.estudianteId,
      descripcion: payload.descripcion,
      archivosUrl: payload.archivosUrl,
      nombreEnvio: payload.nombreEnvio,
    });
    if (response.status !== 200 && response.status !== 201) throw new Error(response.data);
    return response.data;
  }
}

export async function editarEntregaMovil(entregaId: number, payload: {
  descripcion?: string;
  archivosNuevos?: Array<{ url: string; nombre?: string }>;
  archivosEliminar?: number[];
}) {
  const res = await httpService.put(`/entregas/${entregaId}`, payload);
  return res.data;
}

// Historial de entregas del estudiante (acudiente)
export async function listarHistorialEstudiante(estudianteId: number, opts: { periodo?: number | string } = {}): Promise<any[]> {
  const params: any = {};
  if (opts.periodo) params.periodo = opts.periodo;
  const res = await httpService.get(`/estudiantes/${estudianteId}/historial`, params);
  const body: any = res.data;
  const data = (body && typeof body === 'object' && 'data' in body) ? (body as any).data : body;
  return Array.isArray(data) ? data : [];
}
