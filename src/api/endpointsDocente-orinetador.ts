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
  2: 'acudiente',
  3: 'docente_aula',
  4: 'coordinador',
  5: 'orientador',
  6: 'rector',
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

export async function loginUnicoMultiRol(correo: string, contrasena: string): Promise<LoginUnicoResult> {
  try {
    const response = await httpService.post<any>('/login', {
      correo,
      email: correo,
      usuario: correo,
      contrasena,
      password: contrasena
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

    const rolId: number | undefined =
      raw?.rolId ??
      usuarioRaw?.rolId ??
      usuarioRaw?.rol_id;

    const rolNombre: RolUsuario | undefined =
      (typeof rolId === 'number' ? ROLES_MAP[rolId] : undefined) ??
      normalizeRol(raw?.rol ?? raw?.rolNombre ?? usuarioRaw?.rol ?? usuarioRaw?.rolNombre) ??
      extractRolFromMessage(message);

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

    return { success: true, user, token, message, context };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Error de conexión'
    };
  }
}
