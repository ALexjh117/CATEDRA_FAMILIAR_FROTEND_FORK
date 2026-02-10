// ============================================
// API ENDPOINTS - Docente y Orientador
// Archivo para APIs de docente y orientador
// ============================================

import httpService from './httpService';
import type { RolUsuario, Usuario } from '../mocks/data';

type LoginUnicoResult = {
  success: boolean;
  user?: Usuario;
  token?: string;
  message?: string;
  context?: Record<string, any>;
  error?: string;
};

const ROLES_MAP: Record<number, RolUsuario> = {
  1: 'admin_sistema',
  2: 'rector',
  3: 'coordinador',
  4: 'orientador',
  5: 'docente_aula',
  6: 'acudiente',
  7: 'admin'
};

function normalizeRol(input?: unknown): RolUsuario | undefined {
  if (!input) return undefined;
  if (typeof input !== 'string') return undefined;

  const raw = input.toLowerCase().trim();

  if (raw.includes('admin')) return raw.includes('sistema') ? 'admin_sistema' : 'admin';
  if (raw.includes('administrador')) return raw.includes('sistema') ? 'admin_sistema' : 'admin';
  if (raw.includes('rector')) return 'rector';
  if (raw.includes('coordin') || raw.includes('coodin')) return 'coordinador';
  if (raw.includes('orient')) return 'orientador';
  if (raw.includes('docente')) return 'docente_aula';
  if (raw.includes('acud')) return 'acudiente';

  return undefined;
}

function extractRolFromMessage(message?: unknown): RolUsuario | undefined {
  if (!message || typeof message !== 'string') return undefined;
  const match = message.match(/rol\s*:\s*([^\n\r]+)/i);
  return normalizeRol(match?.[1]);
}

export async function loginUnicoMultiRol(correo: string, contrasena: string, captchaToken?: string | null): Promise<LoginUnicoResult> {
  try {
    const response = await httpService.post<any>('/login', {
      correo,
      email: correo,
      usuario: correo,
      contrasena,
      password: contrasena,
      // Enviar token de reCAPTCHA usando claves comunes para maximizar compatibilidad
      recaptcha: captchaToken,
      reCaptcha: captchaToken,
      recaptchaToken: captchaToken,
      token_captcha: captchaToken,
      captchaToken: captchaToken
    });

    const raw = response.data as any;

    const token: string | undefined =
      raw?.token ??
      raw?.data?.token ??
      raw?.jwt ??
      raw?.access_token;

    const message: string | undefined = raw?.message ?? raw?.mensaje ?? raw?.data?.message;

    const usuarioRaw: any = raw?.usuario ?? raw?.user ?? raw?.data?.usuario ?? raw?.data?.user;
    const funcionarioRaw: any = raw?.funcionario ?? raw?.data?.funcionario;
    const docenteRaw: any = raw?.docente ?? raw?.data?.docente;
    const acudienteRaw: any = raw?.acudiente ?? raw?.data?.acudiente;

    const rolIdRaw: unknown =
      raw?.rolId ??
      raw?.rol_id ??
      usuarioRaw?.rolId ??
      usuarioRaw?.rol_id ??
      funcionarioRaw?.rolId ??
      funcionarioRaw?.rol_id ??
      docenteRaw?.rolId ??
      docenteRaw?.rol_id;

    const rolId: number | undefined =
      typeof rolIdRaw === 'number'
        ? rolIdRaw
        : typeof rolIdRaw === 'string' && rolIdRaw.trim() !== '' && !Number.isNaN(Number(rolIdRaw))
          ? Number(rolIdRaw)
          : undefined;

    const rolNombre: RolUsuario | undefined =
      // 1) PRIORIDAD: nombre de rol (es estable aunque cambien los IDs entre ambientes)
      normalizeRol(
        // estructura más común en tus respuestas
        usuarioRaw?.rolNombre ??
          usuarioRaw?.rol_nombre ??
          usuarioRaw?.rol ??
          // otros posibles
          raw?.rolNombre ??
          raw?.rol_nombre ??
          raw?.rol ??
          funcionarioRaw?.rolNombre ??
          funcionarioRaw?.rol_nombre ??
          funcionarioRaw?.rol
      ) ??
      // 2) mensaje ("Iniciaste con rol: ...")
      extractRolFromMessage(message) ??
      // 3) FALLBACK: rolId (solo si no viene nombre)
      (typeof rolId === 'number' ? ROLES_MAP[rolId] : undefined);

    if (!token) {
      return { success: false, error: message || 'Login inválido: no se recibió token.' };
    }

    if (!rolNombre) {
      return { success: false, error: message || 'Login inválido: no se pudo determinar el rol.' };
    }

    const user: Usuario = {
      id: Number(usuarioRaw?.id ?? raw?.id ?? 0),
      nombre: usuarioRaw?.nombre || raw?.nombre || 'Usuario',
      apellidos: usuarioRaw?.apellido || usuarioRaw?.apellidos || raw?.apellido || raw?.apellidos || '',
      correo: usuarioRaw?.correo || usuarioRaw?.email || raw?.correo || raw?.email || correo,
      telefono: usuarioRaw?.telefono || raw?.telefono || '',
      rol: rolNombre,
      activo: Boolean(usuarioRaw?.estaActivo ?? usuarioRaw?.activo ?? raw?.estaActivo ?? raw?.activo ?? true),
      debe_cambiar_contrasena: Boolean(usuarioRaw?.debeCambiarContrasena ?? usuarioRaw?.debe_cambiar_contrasena ?? raw?.debeCambiarContrasena ?? raw?.debe_cambiar_contrasena ?? false),
      institucionId: usuarioRaw?.institucionId ?? raw?.institucionId ?? funcionarioRaw?.institucionId ?? funcionarioRaw?.institucion?.id ?? docenteRaw?.institucionId
    };

    const context = {
      cursos: docenteRaw?.cursos ?? raw?.cursos ?? raw?.data?.cursos ?? usuarioRaw?.cursos,
      estudiantes: acudienteRaw?.estudiantes ?? raw?.estudiantes ?? raw?.data?.estudiantes ?? usuarioRaw?.estudiantes,
      institucion: funcionarioRaw?.institucion ?? raw?.institucion ?? raw?.data?.institucion ?? usuarioRaw?.institucion,
      institucionId: funcionarioRaw?.institucionId ?? funcionarioRaw?.institucion?.id ?? raw?.institucionId ?? raw?.data?.institucionId ?? usuarioRaw?.institucionId ?? docenteRaw?.institucionId
    };

    localStorage.removeItem('previewRole');
    localStorage.setItem('session', JSON.stringify({
      token,
      user,
      context,
      isPreview: false
    }));
    // Imprimir el token en consola tras login exitoso (pedido del admin)
    try {
      console.log('[LOGIN][DEBUG] JWT:', token);
    } catch {}

    return { success: true, user, token, message, context };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Error de conexión'
    };
  }
}

export async function getTareaById(tareaId: number): Promise<{ success: boolean; data?: any; message?: string; status?: number }> {
  try {
    const response = await httpService.get<any>(`/tareas/${tareaId}`);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, message: raw?.message || 'Error al obtener tarea', status: response.status };
    }

    return { success: true, data: raw?.data ?? raw, message: raw?.message, status: response.status };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Error de conexión', status: error?.status };
  }
}

export async function updateEstudianteOrientador(estudianteId: number, data: Record<string, any>): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await httpService.put<any>(`/estudiantes/${estudianteId}`, data);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, message: raw?.message || 'Error al actualizar estudiante' };
    }

    return { success: true, data: raw?.data, message: raw?.message };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Error de conexión' };
  }
}
 
export async function patchEstudiante(estudianteId: number, data: Record<string, any>): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await httpService.patch<any>(`/estudiantes/${estudianteId}`, data);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, message: raw?.message || 'Error al actualizar estudiante' };
    }

    return { success: true, data: raw?.data ?? raw, message: raw?.message };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Error de conexión' };
  }
}

export async function getEstudianteById(estudianteId: number): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const response = await httpService.get<any>(`/estudiantes/${estudianteId}`);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, message: raw?.message || 'Error al obtener estudiante' };
    }

    const data = raw?.data ?? raw?.estudiante ?? raw;
    return { success: true, data, message: raw?.message };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Error de conexión' };
  }
}

export async function getCursosPorInstitucion(institucionId: number): Promise<{ success: boolean; data: any[]; message?: string }> {
  try {
    const response = await httpService.get<any>(`/cursos/institucion/${institucionId}`);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, data: [], message: raw?.message || 'Error al obtener cursos' };
    }

    const data = raw?.cursos ?? raw?.data ?? [];
    return { success: true, data: Array.isArray(data) ? data : [], message: raw?.message };
  } catch (error: any) {
    return { success: false, data: [], message: error?.message || 'Error de conexión' };
  }
}
///////////////////////////////////////////

export async function getEstudiantesInstitucionOrientador(): Promise<any[]> {
  try {
    const response = await httpService.get<any>('/orientadores/estudiantes');
    const raw = response.data as any;

    if (raw?.success === false) {
      throw new Error(raw?.message || 'Error al obtener estudiantes');
    }

    const data = raw?.data ?? raw?.estudiantes ?? [];
    if (Array.isArray(data) && data.length > 0) return data;

    // Fallback: si no hay estudiantes por el endpoint de orientador,
    // intentar obtener el listado general de estudiantes.
    try {
      const resp2 = await httpService.get<any>('/estudiantes');
      const raw2 = resp2.data as any;
      const data2 = raw2?.data ?? raw2?.estudiantes ?? [];
      return Array.isArray(data2) ? data2 : [];
    } catch {
      return [];
    }
  } catch (error: any) {
    throw new Error(error?.message || 'Error de conexión');
  }
}

export async function getCategorias(): Promise<{ success: boolean; data: any[]; message?: string; status?: number }> {
  try {
    const response = await httpService.get<any>('/categorias');
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, data: [], message: raw?.message || 'Error al obtener categorías' };
    }

    const data = raw?.data ?? raw?.categorias ?? raw;
    return { success: true, data: Array.isArray(data) ? data : [], message: raw?.message };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      status: error?.status,
      message: error?.message || 'Error de conexión'
    };
  }
}

export async function getTareas(): Promise<{ success: boolean; data: any[]; message?: string; status?: number }> {
  try {
    const response = await httpService.get<any>('/tareas');
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, data: [], message: raw?.message || 'Error al obtener tareas' };
    }

    const data = raw?.data ?? raw?.tareas ?? raw;
    return { success: true, data: Array.isArray(data) ? data : [], message: raw?.message };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      status: error?.status,
      message: error?.message || 'Error de conexión'
    };
  }
}

export async function createTarea(data: Record<string, any> | FormData): Promise<{ success: boolean; data?: any; message?: string; status?: number }> {
  try {
    const response = await httpService.post<any>('/tareas', data);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, message: raw?.message || 'Error al crear tarea', status: response.status };
    }

    return { success: true, data: raw?.data ?? raw, message: raw?.message, status: response.status };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Error de conexión', status: error?.status };
  }
}

export async function createCategoria(data: {
  nombre: string;
  descripcion?: string | null;
  color?: string | null;
  icono?: string | null;
}): Promise<{ success: boolean; data?: any; message?: string; status?: number }> {
  try {
    const response = await httpService.post<any>('/categorias', data);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, message: raw?.message || 'Error al crear categoría', status: response.status };
    }

    return { success: true, data: raw?.data ?? raw, message: raw?.message, status: response.status };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Error de conexión', status: error?.status };
  }
}
