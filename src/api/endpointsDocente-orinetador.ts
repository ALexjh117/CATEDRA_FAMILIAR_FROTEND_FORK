// ============================================
// API ENDPOINTS - Docente y Orientador (CORREGIDO)
// Archivo para APIs de docente y orientador
// ============================================

import httpService from './httpService';
import type { RolUsuario, Usuario } from '../mocks/data';

import { fetchOfflineSession } from '../services/offlineSessionService';

type LoginUnicoResult = {
  success: boolean;
  user?: Usuario;
  token?: string;
  message?: string;
  error?: string;
  estudiantes?: any[]; // Estudiantes asociados (para acudientes)
  context?: Record<string, any>;
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

const ENDPOINTS_BY_ROL: Record<RolUsuario, string> = {
  'admin_sistema': '/admin/login',
  'admin': '/admin/login',
  'rector': '/rectores/login',
  'coordinador': '/coordinadores/login',
  'orientador': '/docentes/login',
  'docente_aula': '/docentes/login',
  'acudiente': '/acudientes/login'  // Usar el endpoint que funciona
};

const ALLOWED_ROLES_BY_ENDPOINT: Record<string, number[]> = {
  '/docentes/login': [4, 5], // Orientadores, Docentes
  '/acudientes/login': [6], // Acudientes - endpoint que funciona
  '/rectores/login': [2], // Rectores
  '/coordinadores/login': [3], // Coordinadores
  '/admin/login': [1, 7] // Admin sistema, Admin
};

function normalizeRol(input?: unknown): RolUsuario | undefined {
  if (!input) return undefined;
  if (typeof input !== 'string') return undefined;

  const raw = input.toLowerCase().trim();

  // Mejorar detección de roles con más variaciones
  if (raw.includes('admin')) {
    if (raw.includes('sistema')) return 'admin_sistema';
    return 'admin';
  }
  if (raw.includes('administrador')) {
    if (raw.includes('sistema')) return 'admin_sistema';
    return 'admin';
  }
  if (raw.includes('rector')) return 'rector';
  if (raw.includes('coordin') || raw.includes('coodin')) return 'coordinador';
  if (raw.includes('orient')) return 'orientador';
  if (raw.includes('docente')) return 'docente_aula';
  if (raw.includes('acud')) return 'acudiente';
  
  // Detectar por palabras clave específicas
  if (raw.includes('teacher')) return 'docente_aula';
  if (raw.includes('parent') || raw.includes('padre') || raw.includes('madre')) return 'acudiente';
  if (raw.includes('counselor') || raw.includes('advisor')) return 'orientador';
  if (raw.includes('principal') || raw.includes('director')) return 'rector';
  if (raw.includes('coordinator')) return 'coordinador';

  return undefined;
}

function extractRolFromMessage(message?: unknown): RolUsuario | undefined {
  if (!message || typeof message !== 'string') return undefined;
  
  // Buscar múltiples patrones de rol en el mensaje
  const patterns = [
    /rol\s*:\s*([^\n\r]+)/i,
    /role\s*:\s*([^\n\r]+)/i,
    /tipo\s*:\s*([^\n\r]+)/i,
    /perfil\s*:\s*([^\n\r]+)/i,
    /accediste\s+como\s+([^\n\r]+)/i,
    /bienvenido\s+([^\n\r]+)/i,
    /sesión\s+iniciada\s+como\s+([^\n\r]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const rol = normalizeRol(match[1]);
      if (rol) return rol;
    }
  }
  
  // Buscar palabras clave de rol directamente en el mensaje
  const messageLower = message.toLowerCase();
  if (messageLower.includes('admin') || messageLower.includes('administrador')) {
    return messageLower.includes('sistema') ? 'admin_sistema' : 'admin';
  }
  if (messageLower.includes('rector')) return 'rector';
  if (messageLower.includes('coordin')) return 'coordinador';
  if (messageLower.includes('orient')) return 'orientador';
  if (messageLower.includes('docente')) return 'docente_aula';
  if (messageLower.includes('acud') || messageLower.includes('padre') || messageLower.includes('madre')) return 'acudiente';
  
  return undefined;
}

const parseJwtPayload = (token: string): Record<string, any> | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = typeof window !== 'undefined' ? window.atob(padded) : atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

function determineEndpoint(correo: string, isDocumento: boolean): { endpoint: string; expectedRol?: RolUsuario } {
  // DETECCIÓN ESPECÍFICA PARA zaguito@gmail.com (coordinador)
  if (correo === 'zaguito@gmail.com') {
    return { endpoint: '/coordinadores/login', expectedRol: 'coordinador' };
  }
  
  // DETECCIÓN ESPECÍFICA PARA tirado90@gmail.com (rector)
  if (correo === 'tirado90@gmail.com') {
    return { endpoint: '/rectores/login', expectedRol: 'rector' };
  }
  
  // DETECCIÓN ESPECÍFICA PARA orientador@gmail.com (orientador)
  if (correo === 'orientador@gmail.com') {
    return { endpoint: '/docentes/login', expectedRol: 'orientador' };
  }
  
  // DETECCIÓN ESPECÍFICA PARA goldo1179@gmail.com (orientador)
  if (correo === 'goldo1179@gmail.com') {
    return { endpoint: '/docentes/login', expectedRol: 'orientador' };
  }
  
  if (isDocumento) {
    // Login de acudiente por documento - usar el endpoint que funciona
    return { endpoint: '/acudientes/login', expectedRol: 'acudiente' };
  }
  
  // Para login por correo, intentaremos detectar el rol por el dominio
  const emailLower = correo.toLowerCase();
  
  // Dominios admin
  if (emailLower.includes('@educacionpopayan.gov.co') || emailLower.includes('@secretariaed.gov.co')) {
    return { endpoint: '/admin/login', expectedRol: 'admin_sistema' };
  }
  
  // Dominios institucionales - no podemos determinar el rol exacto, 
  // así que necesitamos intentar múltiples endpoints
  return { endpoint: '/docentes/login' }; // Intentar primero el más común
}

// Función para obtener el dashboard según el rolId
export function getDashboardByRol(rolId: number): string {
  const dashboards: Record<number, string> = {
    1: '/dashboard/admin',
    2: '/dashboard/rector',
    3: '/dashboard/coordinador',
    4: '/dashboard/orientador',
    5: '/dashboard/docente',
    6: '/dashboard/acudiente',
    7: '/dashboard/admin'
  };
  
  const dashboard = dashboards[rolId];
  if (!dashboard) {
    throw new Error(`Rol no reconocido: ${rolId}`);
  }
  return dashboard;
}

export async function loginUnicoMultiRol(correo: string, contrasena: string, captchaToken?: string | null): Promise<LoginUnicoResult> {
  try {
    try {
      // Debug removido
    } catch {}

    const correoTrim = (correo || '').trim();
    const passTrim = (contrasena || '').trim();
    const normalizedDocumento = typeof correoTrim === 'string' ? correoTrim.replace(/\D/g, '') : '';
    const isEmail = typeof correoTrim === 'string' && correoTrim.includes('@');
    const isDocumento = !isEmail && normalizedDocumento.length >= 5;

    // Determinar endpoint inicial
    const { endpoint: initialEndpoint, expectedRol } = determineEndpoint(correoTrim, isDocumento);
    
    // Lista de endpoints a intentar (en orden de prioridad)
    const endpointsToTry = isDocumento 
      ? ['/acudientes/login']  // Usar el endpoint que funciona
      : [
          '/login',               // Intentar primero login genérico (incluye institucionId en token y usuario)
          '/docentes/login',       // Luego docentes (orientadores y docentes)
          '/coordinadores/login',  // Luego coordinadores
          '/rectores/login',       // Luego rectores
          '/admin/login',          // Luego admins
          '/acudientes/login'      // Finalmente acudientes (por si acaso)
        ];

    // Si tenemos un expectedRol específico, intentar solo ese endpoint
    const finalEndpointsToTry = expectedRol 
      ? ['/login', ENDPOINTS_BY_ROL[expectedRol]].filter(Boolean)
      : endpointsToTry;

    // Debug removido

    // Intentar cada endpoint secuencialmente
    for (const endpoint of finalEndpointsToTry) {
      try {
        // Debug removido
        
        const body: any = isDocumento 
          ? { numeroDocumento: normalizedDocumento, contrasena: passTrim }  // Usar numeroDocumento (sin guion bajo)
          : { correo: correoTrim, contrasena: passTrim };

        // Agregar captcha si está disponible
        if (captchaToken) {
          body.recaptcha = captchaToken;
        }

        // Debug removido

        const response = await httpService.post<any>(endpoint, body);
        const raw = response.data as any;

        // Debug removido

        // Verificar si el login fue exitoso
        // El backend responde con "message": "Login exitoso" en lugar de "success": true
        const isLoginSuccess = raw?.success === true || raw?.message === "Login exitoso";
        
        if (isLoginSuccess) {
          // Extraer token de múltiples ubicaciones
          let token: string | undefined =
            raw?.token ?? 
            raw?.data?.token ?? 
            raw?.jwt ?? 
            raw?.access_token ?? 
            raw?.accessToken ?? 
            raw?.bearerToken ?? 
            raw?.bearer ?? 
            raw?.data?.bearerToken ?? 
            raw?.token_acceso ?? 
            raw?.tokenAcceso ?? 
            raw?.data?.token_acceso ?? 
            raw?.tokenBearer ?? 
            raw?.api_token ?? 
            raw?.sessionToken ?? 
            raw?.data?.accessToken;

          // Extraer información del usuario - soportar estructura enriquecida de acudientes
          const usuarioRaw: any = raw?.usuario ?? raw?.user ?? raw?.data?.usuario ?? raw?.data?.user;
          const funcionarioRaw: any = raw?.funcionario ?? raw?.data?.funcionario;
          // Soportar funcionario anidado dentro de usuario y el fallback directo del backend
          const usuarioFuncionarioRaw: any = raw?.data?.usuario?.funcionario;
          const funcionarioDirectoRaw: any = raw?.data?.funcionarioDirecto;
          const docenteRaw: any = raw?.docente ?? raw?.data?.docente;
          const acudienteRaw: any = raw?.acudiente ?? raw?.data?.acudiente;

          // Priorizar el rolId del backend
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
            typeof rolIdRaw === 'number' ? rolIdRaw :
            typeof rolIdRaw === 'string' ? parseInt(rolIdRaw, 10) : undefined;

          const rolStr: string | undefined =
            raw?.rol ??
            raw?.rolNombre ??
            raw?.rol_nombre ??
            usuarioRaw?.rol ??
            usuarioRaw?.rolNombre ??
            usuarioRaw?.rol_nombre ??
            funcionarioRaw?.rol ??
            funcionarioRaw?.rolNombre ??
            funcionarioRaw?.rol_nombre ??
            docenteRaw?.rol ??
            docenteRaw?.rolNombre ??
            docenteRaw?.rol_nombre ??
            acudienteRaw?.rol ??
            acudienteRaw?.rolNombre ??
            acudienteRaw?.rol_nombre;

          let rol: RolUsuario | undefined = rolId ? ROLES_MAP[rolId] : undefined;
          if (!rol && rolStr) {
            rol = normalizeRol(rolStr);
          }
          if (!rol && raw?.message) {
            rol = extractRolFromMessage(raw.message);
          }

          // Extraer estudiantes asociados (solo para acudientes)
          const estudiantesAsociados = raw?.estudiantes ?? raw?.data?.estudiantes ?? raw?.data?.estudiantesAsociados ?? [];

          // Debug removido

          // Construir usuario unificado
          // Resolver institucionId desde múltiples fuentes (usuario, funcionario anidado, funcionario directo, payload raíz)
          const resolvedInstitucionId = (
            usuarioRaw?.institucionId ??
            usuarioRaw?.institucion_id ??
            usuarioFuncionarioRaw?.institucionId ??
            usuarioFuncionarioRaw?.institucion_id ??
            funcionarioDirectoRaw?.institucionId ??
            funcionarioDirectoRaw?.institucion_id ??
            funcionarioRaw?.institucionId ??
            funcionarioRaw?.institucion_id ??
            raw?.institucionId ??
            raw?.data?.institucionId ??
            raw?.institucion_id ??
            raw?.data?.institucion_id
          );

          // Resolver nombre/objeto de institución si viene incluido
          const resolvedInstitucionObj = (
            (typeof usuarioRaw?.institucion === 'object' && usuarioRaw?.institucion) ? usuarioRaw.institucion :
            (typeof usuarioFuncionarioRaw?.institucion === 'object' && usuarioFuncionarioRaw?.institucion) ? usuarioFuncionarioRaw.institucion :
            (funcionarioDirectoRaw?.institucion && typeof funcionarioDirectoRaw?.institucion === 'object') ? funcionarioDirectoRaw.institucion :
            undefined
          );

          const usuario: Usuario = {
            id: usuarioRaw?.id ?? funcionarioRaw?.id ?? docenteRaw?.id ?? acudienteRaw?.id ?? rolId ?? 0,
            nombre: usuarioRaw?.nombre ?? funcionarioRaw?.nombre ?? docenteRaw?.nombre ?? acudienteRaw?.nombre ?? '',
            apellidos: usuarioRaw?.apellidos ?? funcionarioRaw?.apellidos ?? docenteRaw?.apellidos ?? acudienteRaw?.apellidos ?? '',
            correo: usuarioRaw?.correo ?? funcionarioRaw?.correo ?? docenteRaw?.correo ?? acudienteRaw?.correo ?? correoTrim,
            rol: rol ?? (isDocumento ? 'acudiente' : 'docente_aula'),
            rolId: rolId, // Guardar el rolId numérico del backend
            institucionId: resolvedInstitucionId,
            telefono: usuarioRaw?.telefono ?? funcionarioRaw?.telefono ?? docenteRaw?.telefono ?? acudienteRaw?.telefono ?? '',
            documento: usuarioRaw?.documento ?? funcionarioRaw?.documento ?? docenteRaw?.documento ?? acudienteRaw?.documento ?? acudienteRaw?.numeroDocumento ?? normalizedDocumento,
            activo: usuarioRaw?.activo ?? funcionarioRaw?.activo ?? docenteRaw?.activo ?? acudienteRaw?.activo ?? true,
            debe_cambiar_contrasena: usuarioRaw?.debe_cambiar_contrasena ?? funcionarioRaw?.debe_cambiar_contrasena ?? docenteRaw?.debe_cambiar_contrasena ?? acudienteRaw?.debe_cambiar_contrasena ?? false,
            ...(raw?.context && { context: raw.context }),
            ...(resolvedInstitucionObj ? { institucion: resolvedInstitucionObj } : {})
          };

          // Debug removido

          return {
            success: true,
            user: usuario,
            token,
            message: 'Login exitoso',
            estudiantes: estudiantesAsociados, // Incluir estudiantes asociados para acudientes
            ...(raw?.context && { context: raw.context })
          };
        }

        // Manejar específicamente errores de rol no autorizado
        if (raw?.message?.includes('Acceso denegado') || raw?.message?.includes('rol no autorizado')) {
          // Debug removido
          continue;
        }

        // Si es error de acudiente sin estudiantes asociados
        if (raw?.message?.includes('estudiantes asociados') || raw?.message?.includes('no tiene estudiantes')) {
          // Debug removido
          return { 
            success: false, 
            error: 'El acudiente no tiene estudiantes asociados. Por favor, contacte al administrador de la institución.' 
          };
        }

        // Si es error de credenciales, no intentar más endpoints
        if (raw?.message?.includes('incorrectos') || raw?.message?.includes('credenciales')) {
          // Debug removido
          return { 
            success: false, 
            error: raw?.message || 'Credenciales incorrectas' 
          };
        }

        // Otro tipo de error, continuar con siguiente endpoint
        // Debug removido
        continue;

      } catch (err: any) {
        // Debug removido
        // Continuar con el siguiente endpoint
        continue;
      }
    }

    // Si todos los endpoints fallaron
    // Debug removido
    
    return { 
      success: false, 
      error: 'No se pudo validar el usuario con ningún endpoint disponible. Por favor, verifica tus credenciales e intenta nuevamente.' 
    };

  } catch (err: any) {
    // Debug removido
    return { 
      success: false, 
      error: 'Error inesperado. Intenta nuevamente.' 
    };
  }
}

// Public: GET /grados -> { success, data: [ { id, nombre, orden, cursos: [...] } ] }
export async function getGradosPublic(): Promise<{ success: boolean; data: any[]; message?: string; status?: number }> {
  try {
    const response = await httpService.get<any>('/grados');
    const raw = response.data as any;
    if (raw?.success === false) {
      return { success: false, data: [], message: raw?.message || 'Error al obtener grados' };
    }
    const data = raw?.data ?? raw?.grados ?? raw;
    return { success: true, data: Array.isArray(data) ? data : [], message: raw?.message };
  } catch (error: any) {
    return { success: false, data: [], message: error?.message || 'Error de conexión', status: error?.status };
  }
}

// Public: GET /tareas -> { success, data: [ { ... } ] }
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

export async function getCategorias(): Promise<{ success: boolean; data?: any[]; message?: string; status?: number }> {
  try {
    const response = await httpService.get<any>('/categorias');
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, data: [], message: raw?.message || 'Error al obtener categorías', status: response.status };
    }

    const data = raw?.data ?? raw?.categorias ?? raw;
    return { success: true, data: Array.isArray(data) ? data : [], message: raw?.message };
  } catch (error: any) {
    return { success: false, data: [], message: error?.message || 'Error de conexión', status: error?.status };
  }
}

export async function getEstudiantesInstitucionOrientador(): Promise<{ success: boolean; data?: any[]; message?: string; status?: number }> {
  try {
    const response = await httpService.get<any>('/orientadores/estudiantes');
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, data: [], message: raw?.message || 'Error al obtener estudiantes', status: response.status };
    }

    const data = raw?.data ?? raw?.estudiantes ?? raw;
    return { success: true, data: Array.isArray(data) ? data : [], message: raw?.message };
  } catch (error: any) {
    return { success: false, data: [], message: error?.message || 'Error de conexión', status: error?.status };
  }
}

export async function getTareaById(id: number): Promise<{ success: boolean; data?: any; message?: string; status?: number }> {
  try {
    const response = await httpService.get<any>(`/tareas/${id}`);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, message: raw?.message || 'Error al obtener tarea', status: response.status };
    }

    return { success: true, data: raw?.data ?? raw, message: raw?.message, status: response.status };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Error de conexión', status: error?.status };
  }
}

export async function getCursosPorInstitucion(institucionId?: number): Promise<{ success: boolean; data?: any[]; message?: string; status?: number }> {
  try {
    const endpoint = institucionId ? `/instituciones/${institucionId}/cursos` : '/cursos';
    const response = await httpService.get<any>(endpoint);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, data: [], message: raw?.message || 'Error al obtener cursos', status: response.status };
    }

    const data = raw?.data ?? raw?.cursos ?? raw;
    return { success: true, data: Array.isArray(data) ? data : [], message: raw?.message };
  } catch (error: any) {
    return { success: false, data: [], message: error?.message || 'Error de conexión', status: error?.status };
  }
}

export async function updateEstudianteOrientador(id: number, data: Record<string, any>): Promise<{ success: boolean; data?: any; message?: string; status?: number }> {
  try {
    const response = await httpService.put<any>(`/orientadores/estudiantes/${id}`, data);
    const raw = response.data as any;

    if (raw?.success === false) {
      return { success: false, message: raw?.message || 'Error al actualizar estudiante', status: response.status };
    }

    return { success: true, data: raw?.data ?? raw, message: raw?.message, status: response.status };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Error de conexión', status: error?.status };
  }
}
