import httpService from '../api/httpService';
import type { Usuario } from '../mocks/data';

export interface OfflineSessionData {
  userId: number;
  email: string;
  rolId?: number;
  institucionId?: number;
  tipo: string;
  sessionToken: string;
  expiresAt: string;
  createdAt: string;
  datosEspecificos?: Record<string, any>;
}

interface OfflineLoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    usuario?: {
      id?: number;
      correo?: string;
      email?: string;
      rolId?: number;
      institucionId?: number;
      tipo?: string;
      nombre?: string;
      apellido?: string;
    };
    token?: string;
    offline?: boolean;
    session?: OfflineSessionData;
  };
}

const STORAGE_KEY = 'offlineSession';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

function getStoredAppSession(): any | null {
  return safeJsonParse<any>(localStorage.getItem('session'));
}

function normalizeIdentityValue(value?: string | null): string {
  return String(value || '').trim().toLowerCase();
}

function isSameOfflineIdentity(offlineSession: OfflineSessionData, storedUser?: Partial<Usuario> | null): boolean {
  if (!storedUser) return false;

  const offlineUserId = Number(offlineSession.userId || 0);
  const storedUserId = Number((storedUser as any)?.id || 0);
  const offlineEmail = normalizeIdentityValue(offlineSession.email);
  const storedEmail = normalizeIdentityValue((storedUser as any)?.correo || (storedUser as any)?.email);

  if (offlineUserId && storedUserId) {
    return offlineUserId === storedUserId;
  }

  if (offlineEmail && storedEmail) {
    return offlineEmail === storedEmail;
  }

  return false;
}

function getCompatibleStoredUser(offlineSession: OfflineSessionData): Partial<Usuario> | null {
  const storedSession = getStoredAppSession();
  const storedUser = storedSession?.user ?? null;
  return isSameOfflineIdentity(offlineSession, storedUser) ? storedUser : null;
}

function getDisplayNameFromEmail(email: string): string {
  const raw = (email || 'Usuario').split('@')[0] || 'Usuario';
  return raw
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function base64Encode(input: string): string {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(unescape(encodeURIComponent(input)));
  }
  return btoa(unescape(encodeURIComponent(input)));
}

function buildFallbackSession(): OfflineSessionData | null {
  const session = getStoredAppSession();
  if (!session?.user) return null;

  const createdAt = new Date().toISOString();
  const offlineSession: OfflineSessionData = {
    userId: Number(session.user.id || 0),
    email: session.user.correo || session.user.email || 'usuario@offline.local',
    rolId: session.user.rolId,
    institucionId: session.user.institucionId ?? session.context?.institucionId,
    tipo: session.user.rol || 'usuario',
    sessionToken: base64Encode(JSON.stringify({
      userId: session.user.id,
      email: session.user.correo || session.user.email,
      rol: session.user.rol,
      institucionId: session.user.institucionId ?? session.context?.institucionId,
      createdAt,
    })),
    createdAt,
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
    datosEspecificos: {
      institucion: session.context?.institucion,
      institucionId: session.context?.institucionId ?? session.user.institucionId,
      estudiantes: session.context?.estudiantes,
      cursos: session.context?.cursos,
    },
  };

  return offlineSession;
}

function buildOfflineUser(session: OfflineSessionData): Usuario {
  const storedUser = getCompatibleStoredUser(session) ?? {};
  const fallbackName = getDisplayNameFromEmail(session.email);

  return {
    id: Number(session.userId || storedUser.id || 0),
    nombre: storedUser.nombre || session.datosEspecificos?.nombre || fallbackName,
    apellidos: storedUser.apellidos || session.datosEspecificos?.apellidos || '',
    correo: session.email || storedUser.correo || storedUser.email || 'usuario@offline.local',
    email: session.email || storedUser.email || storedUser.correo || 'usuario@offline.local',
    telefono: storedUser.telefono || session.datosEspecificos?.telefono || '',
    rol: (session.tipo || storedUser.rol || 'acudiente') as Usuario['rol'],
    activo: true,
    institucionId: session.institucionId ?? session.datosEspecificos?.institucionId ?? storedUser.institucionId,
    institucion: storedUser.institucion || session.datosEspecificos?.institucion,
    documento: storedUser.documento || session.datosEspecificos?.documento,
    tipoDocumento: storedUser.tipoDocumento || session.datosEspecificos?.tipoDocumento,
    debe_cambiar_contrasena: false,
  };
}

function normalizeOfflineRole(role?: string, rolId?: number): Usuario['rol'] {
  if (role === 'docente') return 'docente_aula';
  if (role === 'estudiante') return 'acudiente';
  if (role === 'admin' || role === 'admin_sistema' || role === 'rector' || role === 'coordinador' || role === 'orientador' || role === 'acudiente' || role === 'docente_aula') {
    return role;
  }
  switch (rolId) {
    case 5:
      return 'docente_aula';
    case 3:
      return 'coordinador';
    case 4:
      return 'acudiente';
    default:
      return 'acudiente';
  }
}

function buildAppSessionFromOffline(current: OfflineSessionData, override?: { token?: string; usuario?: OfflineLoginResponse['data']['usuario'] }) {
  const apiUser = override?.usuario;
  const normalizedSession: OfflineSessionData = {
    ...current,
    userId: Number(apiUser?.id ?? current.userId ?? 0),
    email: apiUser?.correo ?? apiUser?.email ?? current.email,
    rolId: apiUser?.rolId ?? current.rolId,
    institucionId: apiUser?.institucionId ?? current.institucionId,
    tipo: normalizeOfflineRole(apiUser?.tipo ?? current.tipo, apiUser?.rolId ?? current.rolId),
    datosEspecificos: {
      ...current.datosEspecificos,
      nombre: apiUser?.nombre ?? current.datosEspecificos?.nombre,
      apellidos: apiUser?.apellido ?? current.datosEspecificos?.apellidos,
    },
  };

  const user = buildOfflineUser(normalizedSession);
  const token = override?.token ?? current.sessionToken;
  const context = {
    institucion: normalizedSession.datosEspecificos?.institucion,
    institucionId: normalizedSession.institucionId ?? normalizedSession.datosEspecificos?.institucionId,
    estudiantes: normalizedSession.datosEspecificos?.estudiantes,
    cursos: normalizedSession.datosEspecificos?.cursos,
  };

  return {
    normalizedSession,
    appSession: {
      token,
      user,
      context,
      isPreview: false,
      isOffline: true,
      offlineSessionToken: normalizedSession.sessionToken,
    },
  };
}

export function saveOfflineSession(session: OfflineSessionData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getOfflineSession(): OfflineSessionData | null {
  const current = safeJsonParse<OfflineSessionData>(localStorage.getItem(STORAGE_KEY));
  if (!current) return null;

  const storedSession = getStoredAppSession();
  const storedUser = storedSession?.user;
  if (storedUser && !isSameOfflineIdentity(current, storedUser)) {
    clearOfflineSession();
    return null;
  }

  return current;
}

export function clearOfflineSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function activateOfflineSession(session?: OfflineSessionData | null): { user: Usuario; isPreview: boolean; token?: string } | null {
  const current = session ?? getOfflineSession();
  if (!current || isOfflineSessionExpired(current)) return null;

  const { normalizedSession, appSession } = buildAppSessionFromOffline(current);

  localStorage.setItem('session', JSON.stringify(appSession));
  localStorage.setItem('auth_token', appSession.token);
  saveOfflineSession(normalizedSession);

  try {
    httpService.setAuthToken(appSession.token);
  } catch {}

  return { user: appSession.user, isPreview: false, token: appSession.token };
}

export function isOfflineSessionExpired(session?: OfflineSessionData | null): boolean {
  if (!session) return true;
  const expiresAt = new Date(session.expiresAt).getTime();
  if (Number.isNaN(expiresAt)) return true;
  return Date.now() > expiresAt;
}

export function isOfflineSessionAvailable(): boolean {
  const session = getOfflineSession();
  return Boolean(session && !isOfflineSessionExpired(session));
}

export async function fetchOfflineSession(): Promise<OfflineSessionData> {
  try {
    let lastError: any;
    for (const endpoint of ['/auth/get-offline-session', '/offline/session']) {
      try {
        const response = await httpService.post(endpoint);
        const raw = response.data as any;
        const data = raw?.data ?? raw;
        if (!data?.sessionToken) {
          throw new Error(raw?.message || 'La sesión offline no fue retornada por el backend');
        }
        saveOfflineSession(data as OfflineSessionData);
        return data as OfflineSessionData;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  } catch (error) {
    const fallback = buildFallbackSession();
    if (!fallback) throw error;
    saveOfflineSession(fallback);
    return fallback;
  }
}

export async function refreshOfflineSession(): Promise<OfflineSessionData | null> {
  const current = getOfflineSession();
  if (!current?.sessionToken) return null;

  try {
    for (const endpoint of ['/offline/refresh-session', '/auth/get-offline-session']) {
      try {
        const response = endpoint === '/auth/get-offline-session'
          ? await httpService.post(endpoint)
          : await httpService.post(endpoint, { sessionToken: current.sessionToken });
        const raw = response.data as any;
        const data = raw?.data ?? raw;
        if (!data?.sessionToken) throw new Error(raw?.message || 'No se pudo refrescar la sesión offline');
        saveOfflineSession(data as OfflineSessionData);
        return data as OfflineSessionData;
      } catch {
      }
    }
    throw new Error('No se pudo refrescar la sesión offline');
  } catch {
    if (!isOfflineSessionExpired(current)) {
      return current;
    }
    return null;
  }
}

export async function validateOfflineSession(): Promise<boolean> {
  const current = getOfflineSession();
  if (!current?.sessionToken || isOfflineSessionExpired(current)) return false;

  try {
    for (const endpoint of ['/auth/validate-offline-session', '/offline/validate-session']) {
      try {
        const response = await httpService.post(endpoint, { sessionToken: current.sessionToken });
        const raw = response.data as any;
        return Boolean(raw?.success ?? true);
      } catch {
      }
    }
    return !isOfflineSessionExpired(current);
  } catch {
    return !isOfflineSessionExpired(current);
  }
}

export async function loginWithOfflineSession(correo?: string): Promise<{ user: Usuario; isPreview: boolean; token?: string } | null> {
  const current = getOfflineSession();
  if (!current || isOfflineSessionExpired(current)) return null;

  try {
    const response = await httpService.post('/auth/login-offline', {
      sessionToken: current.sessionToken,
      correo: correo || current.email,
    });
    const raw = (response.data ?? {}) as OfflineLoginResponse;
    const data = raw?.data;
    if (!data?.token) {
      throw new Error(raw?.message || 'No se recibió token de login offline');
    }

    const { normalizedSession, appSession } = buildAppSessionFromOffline(data.session ?? current, {
      token: data.token,
      usuario: data.usuario,
    });

    saveOfflineSession(normalizedSession);
    localStorage.setItem('session', JSON.stringify(appSession));
    localStorage.setItem('auth_token', appSession.token);

    try {
      httpService.setAuthToken(appSession.token);
    } catch {}

    return { user: appSession.user, isPreview: false, token: appSession.token };
  } catch {
    return activateOfflineSession(current);
  }
}

export async function ensureOfflineSession(): Promise<OfflineSessionData | null> {
  const current = getOfflineSession();
  if (current && !isOfflineSessionExpired(current)) {
    if (typeof navigator === 'undefined' || !navigator.onLine) return current;
    const isValid = await validateOfflineSession();
    if (isValid) return current;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      return await fetchOfflineSession();
    } catch {
      return buildFallbackSession();
    }
  }

  return current && !isOfflineSessionExpired(current) ? current : null;
}
