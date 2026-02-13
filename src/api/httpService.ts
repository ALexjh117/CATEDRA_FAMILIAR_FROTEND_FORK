// ============================================
// HTTP SERVICE - Servicio centralizado para llamadas API
// ============================================

interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class HttpService {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    const envBase = (typeof import.meta !== 'undefined' ? (import.meta as any)?.env?.VITE_API_URL : undefined) as string | undefined;
    this.config = {
      // Preferir VITE_API_URL; si no, usar '/api' para aprovechar el proxy de Vite
      baseURL: config.baseURL || envBase || '/api',
      timeout: config.timeout || 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers
      }
    };
    try {
      console.log('[HTTP][INIT] Base URL:', this.config.baseURL);
    } catch {}
  }

  private getAuthToken(): string | null {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const parsedSession = JSON.parse(session);
        return parsedSession.token || null;
      }
    } catch (e) {
      console.warn('Error parsing session:', e);
    }
    return null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 
      ...this.config.headers,
      'ngrok-skip-browser-warning': 'true' // Evitar página de advertencia de ngrok
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<HttpResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: T;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as unknown as T;
    }

    if (!response.ok) {
      const error: ApiError = {
        message: response.statusText || 'Error en la solicitud',
        status: response.status
      };

      // Si hay data con mensaje de error del servidor
      if (typeof data === 'object' && data !== null && 'message' in data) {
        error.message = (data as any).message;
      }
      // Adjuntar detalles útiles del backend para mapeo aguas arriba
      try {
        (error as any).body = data;
        const maybeCode = (data as any)?.code ?? (data as any)?.error_code ?? (data as any)?.error?.code;
        if (maybeCode) error.code = String(maybeCode);
      } catch {}

      try {
        const url = response.url;
        const isAuth = typeof window !== 'undefined' ? Boolean(localStorage.getItem('session')) : false;
        const hint = typeof data === 'string' ? data.slice(0, 200) : JSON.stringify(data)?.slice(0, 200);
        if (response.status === 401 || response.status === 403) {
          console.warn(`[DEBUG][API] Respuesta no autorizada/forbidden`, {
            url,
            status: response.status,
            statusText: response.statusText,
            tieneSesion: isAuth,
            cuerpoPreview: hint
          });
        } else {
          console.error(`[DEBUG][API] Error HTTP`, {
            url,
            status: response.status,
            statusText: response.statusText,
            cuerpoPreview: hint
          });
        }
      } catch {}

      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<HttpResponse<T>> {
    // Construir URL correctamente
const base = this.config.baseURL.endsWith('/') ? this.config.baseURL.slice(0, -1) : this.config.baseURL;
const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
const url = new URL(`${base}${path}`, origin);
 
if (params) {
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
}
 
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const headers = this.getHeaders();
      try {
        const hasAuth = Boolean((headers as any)['Authorization']);
        const authLen = hasAuth ? String((headers as any)['Authorization']).length : 0;
        console.log(`[DEBUG][API] GET:`, {
          url: url.toString(),
          tieneAuthorization: hasAuth,
          authorizationLen: authLen,
          contentType: (headers as any)['Content-Type']
        });
      } catch {}
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      console.log(`[DEBUG][API] GET Response:`, response.status, response.statusText);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async post<T = any>(endpoint: string, data?: any): Promise<HttpResponse<T>> {
    return this.request<T>('POST', endpoint, data);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', endpoint, data);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', endpoint, data);
  }

  async delete<T = any>(endpoint: string): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }

  private async request<T = any>(method: string, endpoint: string, data?: any): Promise<HttpResponse<T>> {
    // Construir URL correctamente
    const base = this.config.baseURL.endsWith('/') ? this.config.baseURL.slice(0, -1) : this.config.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${base}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = this.getHeaders();
    if (isFormData) {
      // Let the browser set the correct multipart boundary
      delete (headers as any)['Content-Type'];
    }

    const options: RequestInit = {
      method,
      headers,
      signal: controller.signal
    };

    if (data && method !== 'GET' && method !== 'DELETE') {
      options.body = isFormData ? data : JSON.stringify(data);
    }

    try {
      try {
        const hasAuth = Boolean((headers as any)['Authorization']);
        const authLen = hasAuth ? String((headers as any)['Authorization']).length : 0;
        const isLogin = path.includes('/login');
        let bodyPreview: any = undefined;
        if (!isFormData && data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
          const clone: any = { ...data };
          if ('password' in clone) clone.password = '***';
          if ('contrasena' in clone) clone.contrasena = '***';
          bodyPreview = clone;
        } else if (isFormData) {
          bodyPreview = '[FormData]';
        }
        console.log(`[DEBUG][API] ${method}:`, {
          url: url.toString(),
          endpoint: path,
          isLogin,
          tieneAuthorization: hasAuth,
          authorizationLen: authLen,
          contentType: (headers as any)['Content-Type'],
          bodyPreview
        });
      } catch {}
      console.log(`[DEBUG][API] ${method}:`, url.toString());
      const response = await fetch(url, options);
      console.log(`[DEBUG][API] ${method} Response:`, response.status, response.statusText);
      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Método para actualizar token de autorización
  setAuthToken(token: string | null) {
    if (token) {
      this.config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.config.headers['Authorization'];
    }
  }

  // Método para interceptar respuestas 401 y redirigir al login
  setupUnauthorizedInterceptor(callback: () => void) {
    let consecutiveUnauthorized = 0;
    let lastUnauthorizedTime = 0;
    
    const originalHandleResponse = this.handleResponse.bind(this);
    this.handleResponse = async function<T>(this: HttpService, response: Response): Promise<HttpResponse<T>> {
      // Solo ejecutar logout en 401 si NO es un endpoint de login
      const isLoginEndpoint = response.url.includes('/login');
      
      if (response.status === 401 && !isLoginEndpoint) {
        const now = Date.now();
        console.warn('⚠️ [HTTP] 401 Unauthorized en:', response.url);
        
        // Si es el mismo segundo que el último 401, incrementar contador
        if (now - lastUnauthorizedTime < 1000) {
          consecutiveUnauthorized++;
        } else {
          consecutiveUnauthorized = 1;
        }
        lastUnauthorizedTime = now;
        
        // Solo cerrar sesión si hay múltiples 401 consecutivos (indica sesión realmente expirada)
        // O si es un endpoint crítico que no debería fallar nunca
        const isCriticalEndpoint = response.url.includes('/me') || response.url.includes('/estadisticas');
        
        if (consecutiveUnauthorized >= 3 || isCriticalEndpoint) {
          console.error('💥 [HTTP] Múltiples 401 o endpoint crítico - Sesión expirada, cerrando sesión');
          callback();
        } else {
          console.warn(`📊 [HTTP] 401 #${consecutiveUnauthorized} - Permitiendo fallback...`);
        }
      } else if (response.ok) {
        // Reset contador en respuesta exitosa
        consecutiveUnauthorized = 0;
      }
      
      return originalHandleResponse(response);
    };
  }
}

// Instancia singleton del servicio HTTP
export const httpService = new HttpService();

// Configurar interceptor de 401 para logout automático
httpService.setupUnauthorizedInterceptor(() => {
  // Solo limpiar sesión si realmente existe una
  const session = localStorage.getItem('session');
  if (session) {
    console.warn('🚪 [HTTP] Limpiando sesión y redirigiendo a login...');
    localStorage.removeItem('session');
    localStorage.removeItem('previewRole');
    window.location.href = '/login';
  }
});

export default httpService;
