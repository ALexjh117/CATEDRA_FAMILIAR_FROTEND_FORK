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

export class HttpService {
  private config: ApiConfig;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly MAX_REQUESTS_PER_SECOND = 10; // Límite estricto
  private activeRequests = 0;
  private readonly MAX_CONCURRENT_REQUESTS = 5; // Máximo 5 peticiones simultáneas
  private requestQueue: Array<() => Promise<any>> = [];
  private notifyBackendDown() {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('backend:down'));
      }
    } catch {}
  }

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      // Preferir VITE_API_URL si está definida; de lo contrario usar proxy en DEV
      baseURL: config.baseURL || (import.meta as any).env?.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:3333'),
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.headers
      }
    };
  }

  private getAuthToken(): string | null {
    try {
      // PRIMERO: Limpiar TODOS los tokens viejos para evitar conflictos
      const directToken = localStorage.getItem('auth_token');
      const session = localStorage.getItem('session');
      
      if (directToken) {
        localStorage.removeItem('auth_token');
      }
      
      // Si hay sesión vieja, limpiarla también
      if (session) {
        const parsedSession = JSON.parse(session);
        const sessionTime = parsedSession?.loginTime;
        const now = new Date().toISOString();
        
        // Si la sesión es muy vieja (más de 5 minutos), limpiarla
        if (sessionTime && (new Date(now).getTime() - new Date(sessionTime).getTime()) > 5 * 60 * 1000) {
          localStorage.removeItem('session');
          return null;
        }
      }

      // SEGUNDO: Usar siempre el token de session (el más reciente)
      const currentSession = localStorage.getItem('session');
      if (currentSession) {
        const parsedSession = JSON.parse(currentSession);
        
        const rawToken =
          parsedSession?.token ||
          parsedSession?.accessToken ||
          parsedSession?.access_token ||
          parsedSession?.jwt ||
          parsedSession?.authToken ||
          parsedSession?.data?.token ||
          parsedSession?.data?.accessToken ||
          parsedSession?.data?.access_token ||
          parsedSession?.user?.token ||
          parsedSession?.user?.accessToken ||
          parsedSession?.user?.access_token ||
          null;

        if (typeof rawToken === 'string' && rawToken.trim()) {
          return rawToken.replace(/^Bearer\s+/i, '').trim();
        }
      }

      return null;
    } catch (e) {
      // Error parsing session - returning null
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

  private async handleResponse<T>(response: Response, responseType?: 'blob'): Promise<HttpResponse<T>> {
    let data: T;

    if (responseType === 'blob') {
      data = await response.blob() as T;
    } else {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonText = await response.text();
        data = JSON.parse(jsonText) as T;
      } else {
        data = await response.text() as unknown as T;
      }
    }

    if (!response.ok) {
      const error: ApiError = {
        message: response.statusText || 'Error en la solicitud',
        status: response.status
      };

      if (responseType !== 'blob') {
        if (typeof data === 'object' && data !== null) {
          if ('message' in (data as any) && typeof (data as any).message === 'string') {
            error.message = (data as any).message as string;
          } else if ('error' in (data as any)) {
            const e = (data as any).error;
            error.message = typeof e === 'string' ? e : JSON.stringify(e);
          } else {
            try {
              error.message = JSON.stringify(data);
            } catch {}
          }
        } else if (typeof data === 'string' && data.trim()) {
          error.message = data;
        }
      }

      if (response.status >= 500) {
        this.notifyBackendDown();
      }
      throw error;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      url: response.url
    };
  }

  async get<T = any>(endpoint: string, params?: Record<string, any> & { responseType?: 'blob' }): Promise<HttpResponse<T>> {
    // Detectar si es un endpoint de uploads para usar el proxy correcto
    const isUploadsEndpoint = endpoint.startsWith('/uploads/') || endpoint.startsWith('uploads/');
    
    // Construir URL correctamente
    let base: string;
    if (isUploadsEndpoint) {
      // Para uploads, usar el proxy /uploads directamente
      base = import.meta.env.DEV ? '' : this.config.baseURL;
    } else {
      // Para otros endpoints, usar el base URL configurado
      base = this.config.baseURL.endsWith('/') ? this.config.baseURL.slice(0, -1) : this.config.baseURL;
    }
    
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const url = new URL(`${base}${path}`, origin);
 
if (params) {
  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'responseType' && value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
}
 
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const headers = this.getHeaders();
      
      // Si se solicita blob, cambiar el header Accept
      if (params?.responseType === 'blob') {
        headers['Accept'] = 'application/octet-stream, image/*, application/pdf, */*';
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      return await this.handleResponse<T>(response, params?.responseType);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms`);
      }
      this.notifyBackendDown();
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
    // CONTROL DE CONCURRENCIA: Limitar peticiones simultáneas
    if (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
      // Esperar a que alguna petición termine
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.activeRequests < this.MAX_CONCURRENT_REQUESTS) {
            clearInterval(checkInterval);
            resolve(void 0);
          }
        }, 100);
      });
    }

    this.activeRequests++;

    try {
      // PRIMERO: Verificar límite de peticiones para prevenir flood
      const now = Date.now();
      if (now - this.lastRequestTime < 1000) {
        this.requestCount++;
        if (this.requestCount > this.MAX_REQUESTS_PER_SECOND) {
          throw new Error(`Límite de peticiones excedido. Por favor, espere.`);
        }
      } else {
        this.requestCount = 1;
        this.lastRequestTime = now;
      }

      // SEGUNDO: Verificar si tenemos un token válido (PERMITIR login sin token)
      const isLoginEndpoint = endpoint.includes('/login');
      const token = this.getAuthToken();
      
      if (!token && !isLoginEndpoint) {
        return {
          data: { error: 'No hay token de autenticación' } as T,
          status: 401,
          statusText: 'Unauthorized',
          headers: new Headers()
        };
      }

      // Construir URL correctamente (permitir endpoints absolutos)
      let url: string;
      if (/^https?:\/\//i.test(endpoint)) {
        url = endpoint;
      } else {
        const base = this.config.baseURL.endsWith('/') ? this.config.baseURL.slice(0, -1) : this.config.baseURL;
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        url = `${base}${path}`;
      }
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
        const response = await fetch(url, options);
        return await this.handleResponse<T>(response);
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.config.timeout}ms`);
        }
        this.notifyBackendDown();
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    } finally {
      this.activeRequests--;
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
    this.handleResponse = async function<T>(this: HttpService, response: Response, responseType?: 'blob'): Promise<HttpResponse<T>> {
      // Solo ejecutar logout en 401 si NO es un endpoint de login
      const isLoginEndpoint = response.url.includes('/login');
      
      if (response.status === 401 && !isLoginEndpoint) {
        const now = Date.now();
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
          callback();
        }
      } else if (response.ok) {
        // Reset contador en respuesta exitosa
        consecutiveUnauthorized = 0;
      }
      
      return originalHandleResponse(response, responseType);
    };
  }
}

// Instancia singleton del servicio HTTP
export const httpService = new HttpService();

// Configurar interceptor de 401 para logout automático
// TEMPORALMENTE DESHABILITADO para limpiar tokens viejos
/*
httpService.setupUnauthorizedInterceptor(() => {
  // Solo limpiar sesión si realmente existe una
  const session = localStorage.getItem('session');
  if (session) {
    localStorage.removeItem('session');
    localStorage.removeItem('previewRole');
    window.location.href = '/login';
  }
});
*/

export default httpService;
