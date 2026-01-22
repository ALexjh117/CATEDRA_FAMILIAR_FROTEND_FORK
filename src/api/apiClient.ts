// ============================================
// API CLIENT - Cliente de API para Backend Real
// Base URL: http://localhost:3333
// ============================================

import httpService from './httpService';

// ============================================
// TIPOS DE RESPUESTA DEL BACKEND
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    usuario: {
      id: number;
      correo: string;
      rolId: number;
      estaActivo: boolean;
      debeCambiarContrasena: boolean;
      nombre?: string;
      apellido?: string;
      institucionId?: number;
    };
  };
}

export interface UsuarioBackend {
  id: number;
  correo: string;
  rolId: number;
  estaActivo: boolean;
  debeCambiarContrasena: boolean;
}

export interface RectorCoordinadorResponse {
  success: boolean;
  message: string;
  data?: {
    usuario: {
      id: number;
      correo: string;
      debeCambiarContrasena: boolean;
    };
    rector?: {
      id: number;
      nombre: string;
      apellido: string;
      telefono: string;
      institucionId: number;
    };
    coordinador?: {
      id: number;
      nombre: string;
      apellido: string;
      telefono: string;
      institucionId: number;
    };
  };
}

export interface InstitucionBackend {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  naturaleza: 'Pública' | 'Privada';
  municipioId: number;
  creadoEn: string;
  actualizadoEn: string;
  municipio?: {
    id: number;
    nombre: string;
    departamentoId: number;
    departamento?: {
      id: number;
      nombre: string;
    };
  };
}

export interface CambioContrasenaRequest {
  contrasenaActual: string;
  contrasenaNueva: string;
  confirmarContrasena: string;
}

export interface EstadisticasRectorResponse {
  totalCoordinadores: number;
  coordinadoresActivos: number;
  totalOrientadores: number;
  orientadoresActivos: number;
  totalDocentes: number;
  docentesActivos: number;
  totalCursos: number;
  totalEstudiantes: number;
}

export interface EstadisticasCoordinadorResponse {
  totalCursos: number;
  totalDocentes: number;
  totalOrientadores: number;
  totalEstudiantes: number;
  tareasCreadas: number;
  tareasCalificadas: number;
  tareasPendientes: number;
  promedioGeneral: number;
  cursosConAlerta: number;
}

export interface CursoCoordinadorResponse {
  id: number;
  nombre: string;
  grado: { id: number; nombre: string };
  jornada: string;
  docenteTitular: { id: number; nombre: string; apellido: string };
  orientador: { id: number; nombre: string; apellido: string } | null;
  totalEstudiantes: number;
  promedioGeneral: number;
  distribucionRendimiento: {
    superior: number;
    alto: number;
    basico: number;
    bajo: number;
  };
  tareasCreadas: number;
  entregasRealizadas: number;
  entregasPendientes: number;
  tieneAlertas: boolean;
}

export interface DocenteCoordinadorResponse {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  cursosAsignados: number;
  cursos: Array<{ id: number; nombre: string }>;
  tareasCreadas: number;
  tareasCalificadas: number;
  tareasPendientesCalificar: number;
  tiempoPromedioCalificacion: number;
  participacionAcudientes: number;
  estadoAcademico: 'bien' | 'alerta' | 'critico';
}

export interface OrientadorCoordinadorResponse {
  id: number;
  nombre: string;
  apellido: string;
  gradosAsignados: Array<{ id: number; nombre: string }>;
  cursosAcompanados: number;
  intervencionesAcademicas: number;
  casosAcompanamiento: number;
  cursosConAlerta: number;
}

export interface AlertaAcademica {
  tipo: 'promedio_bajo' | 'entregas_pendientes' | 'sin_tareas' | 'sin_calificaciones';
  nivel: 'critico' | 'moderado' | 'leve';
  curso: { id: number; nombre: string };
  mensaje: string;
  fecha: string;
}

export interface AlertasCoordinadorResponse {
  alertas: AlertaAcademica[];
  resumen: {
    criticas: number;
    moderadas: number;
    leves: number;
  };
}

export interface RendimientoCursoResponse {
  cursoId: number;
  promedioGeneral: number;
  distribucionRangos: {
    superior: { cantidad: number; porcentaje: number };
    alto: { cantidad: number; porcentaje: number };
    basico: { cantidad: number; porcentaje: number };
    bajo: { cantidad: number; porcentaje: number };
  };
  promediosPorAsignatura: Array<{ asignatura: string; promedio: number }>;
  tendencia: 'mejorando' | 'estable' | 'bajando';
}

export interface DirectivosInstitucionResponse {
  coordinadores: Array<{
    id: number;
    nombre: string;
    apellido: string;
    telefono: string;
    activo: boolean;
  }>;
  orientadores: Array<{
    id: number;
    nombre: string;
    apellido: string;
    telefono: string;
    activo: boolean;
  }>;
}

export interface ValidacionExcelResponse {
  success: boolean;
  message: string;
  data?: {
    totalFilas: number;
    filasValidas: number;
    filasInvalidas: number;
    errores: Array<{ fila: number; error: string }>;
    estudiantesValidos: Array<{
      fila: number;
      nombres: string;
      apellidos: string;
      numeroDocumento: string;
    }>;
  };
}

export interface CargaMasivaResponse {
  success: boolean;
  message: string;
  data?: {
    totalProcesados: number;
    insertados: number;
    rechazados: number;
    errores: Array<{ fila: number; error: string }>;
  };
}

// ============================================
// VALIDACIONES
// ============================================

export const validaciones = {
  // Validar contraseña según requisitos del backend
  contrasena: (password: string): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];
    
    if (password.length < 8) {
      errores.push('Mínimo 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errores.push('Al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errores.push('Al menos una letra minúscula');
    }
    if (!/\d/.test(password)) {
      errores.push('Al menos un número');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errores.push('Al menos un carácter especial (!@#$%^&*)');
    }
    
    return { valido: errores.length === 0, errores };
  },
  
  // Validar email
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  // Validar teléfono (10 dígitos)
  telefono: (telefono: string): boolean => {
    const regex = /^\d{10}$/;
    return regex.test(telefono.replace(/\D/g, ''));
  }
};

// ============================================
// MAPEO DE ROLES
// ============================================
const ROLES_MAP: Record<number, string> = {
  1: 'admin_sistema',  // Admin del sistema (Secretaría)
  2: 'rector',
  3: 'coordinador',
  4: 'orientador',
  5: 'docente_aula',
  6: 'acudiente'
};

// Alias para compatibilidad frontend
const ROL_ADMIN_ALIASES = ['admin', 'admin_sistema'];

// ============================================
// CLIENTE API
// ============================================

class ApiClient {
  // ============================================
  // AUTENTICACIÓN
  // ============================================
  
  /**
   * Login Admin Sistema
   * POST /admin/login
   */
  async loginAdmin(correo: string, contrasena: string): Promise<LoginResponse> {
    try {
      const response = await httpService.post<LoginResponse>('/admin/login', {
        correo,
        contrasena
      });
      
      if (response.data.success && response.data.data?.token) {
        // Guardar token y sesión
        httpService.setAuthToken(response.data.data.token);
        
        const rolNombre = ROLES_MAP[response.data.data.usuario.rolId] || 'admin';
        
        const sessionData = {
          user: {
            id: response.data.data.usuario.id,
            correo: response.data.data.usuario.correo,
            nombre: 'Administrador', // El backend no devuelve nombre en login
            rol: rolNombre,
            rolId: response.data.data.usuario.rolId,
            activo: response.data.data.usuario.estaActivo,
            debe_cambiar_contrasena: response.data.data.usuario.debeCambiarContrasena
          },
          token: response.data.data.token,
          isPreview: false
        };
        
        localStorage.setItem('session', JSON.stringify(sessionData));
      }
      
      return response.data;
    } catch (error: any) {
      // No loguear errores 401/403/422 - son esperados cuando probamos múltiples endpoints
      if (error.status !== 401 && error.status !== 403 && error.status !== 422) {
        console.error('Login admin error:', error);
      }
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Login Rector
   * POST /rectores/login
   */
  async loginRector(correo: string, contrasena: string): Promise<LoginResponse> {
    try {
      const response = await httpService.post<LoginResponse>('/rectores/login', {
        correo,
        contrasena
      });
      
      if (response.data.success && response.data.data?.token) {
        httpService.setAuthToken(response.data.data.token);
        
        const sessionData = {
          user: {
            id: response.data.data.usuario.id,
            correo: response.data.data.usuario.correo,
            nombre: response.data.data.usuario.nombre || 'Usuario',
            apellidos: response.data.data.usuario.apellido || '',
            rol: 'rector',
            rolId: response.data.data.usuario.rolId,
            activo: response.data.data.usuario.estaActivo,
            debe_cambiar_contrasena: response.data.data.usuario.debeCambiarContrasena,
            institucionId: response.data.data.usuario.institucionId
          },
          token: response.data.data.token,
          isPreview: false
        };
        
        localStorage.setItem('session', JSON.stringify(sessionData));
      }
      
      return response.data;
    } catch (error: any) {
      // No loguear errores 401/403/422 - son esperados cuando probamos múltiples endpoints
      if (error.status !== 401 && error.status !== 403 && error.status !== 422) {
        console.error('Login rector error:', error);
      }
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Login Coordinador
   * POST /coordinadores/login
   */
  async loginCoordinador(correo: string, contrasena: string): Promise<LoginResponse> {
    try {
      const response = await httpService.post<LoginResponse>('/coordinadores/login', {
        correo,
        contrasena
      });
      
      if (response.data.success && response.data.data?.token) {
        httpService.setAuthToken(response.data.data.token);
        
        const sessionData = {
          user: {
            id: response.data.data.usuario.id,
            correo: response.data.data.usuario.correo,
            nombre: response.data.data.usuario.nombre || 'Usuario',
            apellidos: response.data.data.usuario.apellido || '',
            rol: 'coordinador',
            rolId: response.data.data.usuario.rolId,
            activo: response.data.data.usuario.estaActivo,
            debe_cambiar_contrasena: response.data.data.usuario.debeCambiarContrasena,
            institucionId: response.data.data.usuario.institucionId
          },
          token: response.data.data.token,
          isPreview: false
        };
        
        localStorage.setItem('session', JSON.stringify(sessionData));
      }
      
      return response.data;
    } catch (error: any) {
      // No loguear errores 401/403/422 - son esperados cuando probamos múltiples endpoints
      if (error.status !== 401 && error.status !== 403 && error.status !== 422) {
        console.error('Login coordinador error:', error);
      }
      return {
        success: false,
        message: error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Login inteligente - Detecta rol por dominio/hint o intenta coordinador primero
   * El backend valida las credenciales y retorna el rol correcto
   */
  async login(correo: string, contrasena: string, roleHint?: 'admin' | 'rector' | 'coordinador'): Promise<LoginResponse> {
    const correoLower = correo.toLowerCase();
    
    // 1. Si hay un hint de rol, intentar directamente ese endpoint
    if (roleHint === 'admin') {
      const result = await this.loginAdmin(correo, contrasena);
      if (result.success) return result;
    } else if (roleHint === 'rector') {
      const result = await this.loginRector(correo, contrasena);
      if (result.success) return result;
    } else if (roleHint === 'coordinador') {
      const result = await this.loginCoordinador(correo, contrasena);
      if (result.success) return result;
    }
    
    // 2. Optimización por dominio: Si es dominio admin, intentar directamente
    const isAdmin = correoLower.endsWith('@educacionpopayan.gov.co') || 
                    correoLower.endsWith('@secretariaed.gov.co');
    
    if (isAdmin && !roleHint) {
      const result = await this.loginAdmin(correo, contrasena);
      if (result.success) return result;
    }
    
    // 3. Intentar en orden: coordinador → rector → admin
    // (Coordinador es más común que rector/admin)
    if (!roleHint || roleHint !== 'coordinador') {
      const resultCoordinador = await this.loginCoordinador(correo, contrasena);
      if (resultCoordinador.success) return resultCoordinador;
    }
    
    if (!roleHint || roleHint !== 'rector') {
      const resultRector = await this.loginRector(correo, contrasena);
      if (resultRector.success) return resultRector;
    }
    
    if (!isAdmin && (!roleHint || roleHint !== 'admin')) {
      const resultAdmin = await this.loginAdmin(correo, contrasena);
      if (resultAdmin.success) return resultAdmin;
    }
    
    // TODO: Cuando estén implementados, intentar docente y orientador
    
    // Si ninguno funcionó, retornar error genérico
    return {
      success: false,
      message: 'Credenciales incorrectas o usuario no autorizado para la plataforma web.'
    };
  }

  /**
   * Logout - Limpia sesión local
   */
  async logout(): Promise<void> {
    httpService.setAuthToken(null);
    localStorage.removeItem('session');
    localStorage.removeItem('previewRole');
  }

  // ============================================
  // CAMBIO DE CONTRASEÑA
  // ============================================
  
  /**
   * Cambiar contraseña
   * POST /usuarios/cambiar-password
   */
  async cambiarContrasena(data: CambioContrasenaRequest): Promise<ApiResponse> {
    // Validar contraseña antes de enviar
    const validacion = validaciones.contrasena(data.contrasenaNueva);
    if (!validacion.valido) {
      return {
        success: false,
        message: 'La contraseña no cumple los requisitos',
        errors: { password: validacion.errores }
      };
    }
    
    if (data.contrasenaNueva !== data.confirmarContrasena) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden'
      };
    }
    
    try {
      const response = await httpService.post<ApiResponse>('/usuarios/cambiar-password', data);
      
      // Si cambio exitoso, actualizar sesión
      if (response.data.success) {
        const session = localStorage.getItem('session');
        if (session) {
          const parsed = JSON.parse(session);
          parsed.user.debe_cambiar_contrasena = false;
          localStorage.setItem('session', JSON.stringify(parsed));
        }
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al cambiar contraseña'
      };
    }
  }

  // ============================================
  // GESTIÓN DE RECTORES
  // ============================================
  
  /**
   * Crear Rector
   * POST /admin/rectores
   */
  async crearRector(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono: string;
    institucionId: number;
  }): Promise<RectorCoordinadorResponse> {
    // Validaciones previas
    if (!validaciones.email(data.correo)) {
      return { success: false, message: 'Correo electrónico inválido' };
    }
    
    const validacionPass = validaciones.contrasena(data.contrasena);
    if (!validacionPass.valido) {
      return { 
        success: false, 
        message: 'La contraseña no cumple los requisitos: ' + validacionPass.errores.join(', ')
      };
    }
    
    if (!validaciones.telefono(data.telefono)) {
      return { success: false, message: 'Teléfono inválido (debe tener 10 dígitos)' };
    }
    
    try {
      const response = await httpService.post<RectorCoordinadorResponse>('/admin/rectores', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear rector'
      };
    }
  }

  // ============================================
  // GESTIÓN DE COORDINADORES
  // ============================================
  
  /**
   * Crear Coordinador (Admin Sistema)
   * POST /admin/coordinadores
   * Admin puede crear coordinadores en CUALQUIER institución
   */
  async crearCoordinadorAdmin(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono: string;
    institucionId: number;
  }): Promise<RectorCoordinadorResponse> {
    // Validaciones previas
    if (!validaciones.email(data.correo)) {
      return { success: false, message: 'Correo electrónico inválido' };
    }
    
    const validacionPass = validaciones.contrasena(data.contrasena);
    if (!validacionPass.valido) {
      return { 
        success: false, 
        message: 'La contraseña no cumple los requisitos: ' + validacionPass.errores.join(', ')
      };
    }
    
    if (!validaciones.telefono(data.telefono)) {
      return { success: false, message: 'Teléfono inválido (debe tener 10 dígitos)' };
    }
    
    try {
      const response = await httpService.post<RectorCoordinadorResponse>('/admin/coordinadores', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear coordinador'
      };
    }
  }

  /**
   * Crear Coordinador (Rector)
   * POST /rectores/coordinadores
   * Rector solo puede crear coordinadores en SU institución (automático)
   */
  async crearCoordinadorRector(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono: string;
    documento?: string;
    tipoDocumento?: 'CC' | 'TI' | 'CE';
  }): Promise<RectorCoordinadorResponse> {
    // Validaciones previas
    if (!validaciones.email(data.correo)) {
      return { success: false, message: 'Correo electrónico inválido' };
    }
    
    const validacionPass = validaciones.contrasena(data.contrasena);
    if (!validacionPass.valido) {
      return { 
        success: false, 
        message: 'La contraseña no cumple los requisitos: ' + validacionPass.errores.join(', ')
      };
    }
    
    if (!validaciones.telefono(data.telefono)) {
      return { success: false, message: 'Teléfono inválido (debe tener 10 dígitos)' };
    }
    
    try {
      const response = await httpService.post<RectorCoordinadorResponse>('/rectores/coordinadores', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear coordinador'
      };
    }
  }

  /**
   * Crear Coordinador (compatible con código existente)
   * Determina automáticamente qué endpoint usar según el rol del usuario
   */
  async crearCoordinador(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono: string;
    institucionId?: number;
    documento?: string;
    tipoDocumento?: 'CC' | 'TI' | 'CE';
  }): Promise<RectorCoordinadorResponse> {
    // Determinar rol del usuario actual
    const session = this.getSession();
    const rolId = session?.user?.rolId;
    
    if (rolId === 1) {
      // Admin Sistema - requiere institucionId
      if (!data.institucionId) {
        return { success: false, message: 'Debe seleccionar una institución' };
      }
      return this.crearCoordinadorAdmin({
        correo: data.correo,
        contrasena: data.contrasena,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        institucionId: data.institucionId
      });
    } else if (rolId === 2 || session?.user?.rol === 'rector') {
      // Rector - usa su institución automáticamente
      return this.crearCoordinadorRector({
        correo: data.correo,
        contrasena: data.contrasena,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        documento: data.documento,
        tipoDocumento: data.tipoDocumento
      });
    } else {
      return { success: false, message: 'No tiene permisos para crear coordinadores' };
    }
  }

  // Helper para obtener la sesión
  private getSession(): any {
    try {
      const session = localStorage.getItem('session');
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  // ============================================
  // INSTITUCIONES
  // ============================================
  
  /**
   * Listar instituciones pendientes
   * GET /admin/instituciones/pendientes
   */
  async getInstitucionesPendientes(): Promise<ApiResponse<InstitucionBackend[]>> {
    try {
      const response = await httpService.get<ApiResponse<InstitucionBackend[]>>('/admin/instituciones/pendientes');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener instituciones'
      };
    }
  }

  /**
   * Aprobar institución
   * PUT /admin/instituciones/:id/aprobar
   */
  async aprobarInstitucion(institucionId: number): Promise<ApiResponse<InstitucionBackend>> {
    try {
      const response = await httpService.put<ApiResponse<InstitucionBackend>>(
        `/admin/instituciones/${institucionId}/aprobar`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al aprobar institución'
      };
    }
  }

  // ============================================
  // CARGA MASIVA DE ESTUDIANTES
  // ============================================
  
  /**
   * Descargar plantilla Excel
   * GET /estudiantes/plantilla-excel
   */
  async descargarPlantillaExcel(): Promise<void> {
    try {
      const token = this.getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      
      const response = await fetch(`${baseUrl}/estudiantes/plantilla-excel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Error al descargar plantilla');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla_estudiantes.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      throw error;
    }
  }

  /**
   * Validar Excel
   * POST /estudiantes/validar-excel
   */
  async validarExcel(archivo: File): Promise<ValidacionExcelResponse> {
    try {
      const token = this.getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const formData = new FormData();
      formData.append('archivo', archivo);
      
      const response = await fetch(`${baseUrl}/estudiantes/validar-excel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al validar archivo'
      };
    }
  }

  /**
   * Carga masiva de estudiantes
   * POST /estudiantes/carga-masiva
   */
  async cargaMasivaEstudiantes(archivo: File, cursoId: number): Promise<CargaMasivaResponse> {
    try {
      const token = this.getToken();
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('cursoId', String(cursoId));
      
      const response = await fetch(`${baseUrl}/estudiantes/carga-masiva`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      return await response.json();
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error en carga masiva'
      };
    }
  }

  // ============================================
  // NOTIFICACIONES FCM
  // ============================================
  
  /**
   * Registrar token FCM
   * POST /notificaciones/token
   */
  async registrarTokenFCM(tokenFcm: string): Promise<ApiResponse> {
    try {
      const response = await httpService.post<ApiResponse>('/notificaciones/token', {
        tokenFcm
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al registrar token FCM'
      };
    }
  }

  // ============================================
  // USUARIOS - Listar todos
  // ============================================
  
  /**
   * Obtener todos los usuarios del sistema
   * GET /usuarios (endpoint que debe existir en backend)
   */
  async getUsuarios(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/usuarios');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /usuarios no disponible, usando respuesta vacía');
      return {
        success: true,
        message: 'Sin datos',
        data: []
      };
    }
  }

  // ============================================
  // CURSOS - Listar todos
  // ============================================
  
  /**
   * Obtener todos los cursos
   * GET /cursos
   */
  async getCursos(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/cursos');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /cursos no disponible, usando respuesta vacía');
      return {
        success: true,
        message: 'Sin datos',
        data: []
      };
    }
  }

  // ============================================
  // TAREAS - Listar todas
  // ============================================
  
  /**
   * Obtener todas las tareas
   * GET /tareas
   */
  async getTareas(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/tareas');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /tareas no disponible, usando respuesta vacía');
      return {
        success: true,
        message: 'Sin datos',
        data: []
      };
    }
  }

  // ============================================
  // ESTUDIANTES - CRUD
  // ============================================
  
  /**
   * Obtener todos los estudiantes
   * GET /estudiantes
   */
  async getEstudiantes(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/estudiantes');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /estudiantes no disponible, usando respuesta vacía');
      return {
        success: true,
        message: 'Sin datos',
        data: []
      };
    }
  }

  /**
   * Obtener un estudiante por ID
   * GET /estudiantes/:id
   */
  async getEstudianteById(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.get<ApiResponse<any>>(`/estudiantes/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener estudiante'
      };
    }
  }

  /**
   * Crear estudiante
   * POST /estudiantes
   */
  async createEstudiante(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/estudiantes', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear estudiante'
      };
    }
  }

  /**
   * Actualizar estudiante
   * PUT /estudiantes/:id
   */
  async updateEstudiante(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/estudiantes/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar estudiante'
      };
    }
  }

  /**
   * Eliminar estudiante
   * DELETE /estudiantes/:id
   */
  async deleteEstudiante(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.delete<ApiResponse<any>>(`/estudiantes/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar estudiante'
      };
    }
  }

  // ============================================
  // GRADOS
  // ============================================
  
  /**
   * Obtener todos los grados
   * GET /grados
   */
  async getGrados(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/grados');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /grados no disponible, usando respuesta vacía');
      return {
        success: true,
        message: 'Sin datos',
        data: []
      };
    }
  }

  // ============================================
  // PERIODOS
  // ============================================
  
  /**
   * Obtener todos los periodos
   * GET /periodos
   */
  async getPeriodos(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/periodos');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /periodos no disponible, usando respuesta vacía');
      return {
        success: true,
        message: 'Sin datos',
        data: []
      };
    }
  }

  // ============================================
  // CATEGORÍAS
  // ============================================
  
  /**
   * Obtener todas las categorías
   * GET /categorias
   */
  async getCategorias(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/categorias');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /categorias no disponible, usando respuesta vacía');
      return {
        success: true,
        message: 'Sin datos',
        data: []
      };
    }
  }

  // ============================================
  // PERFIL DE USUARIO
  // ============================================
  
  /**
   * Obtener perfil completo del usuario autenticado
   * GET /usuarios/me (o /rectores/me, /coordinadores/me según el rol)
   */
  async getPerfilUsuario(): Promise<ApiResponse<any>> {
    try {
      // Intentar endpoint genérico primero
      const response = await httpService.get<ApiResponse<any>>('/usuarios/me');
      return response.data;
    } catch (error: any) {
      // Si falla, intentar con endpoints específicos según el rol
      const session = localStorage.getItem('session');
      if (session) {
        const parsed = JSON.parse(session);
        const rol = parsed.user?.rol;
        
        if (rol === 'rector') {
          try {
            const resp = await httpService.get<ApiResponse<any>>('/rectores/me');
            return resp.data;
          } catch (e) { /* continuar */ }
        }
        if (rol === 'coordinador') {
          try {
            const resp = await httpService.get<ApiResponse<any>>('/coordinadores/me');
            return resp.data;
          } catch (e) { /* continuar */ }
        }
      }
      
      console.warn('Endpoint de perfil no disponible');
      return {
        success: false,
        message: 'No se pudo obtener el perfil'
      };
    }
  }

  /**
   * Actualizar perfil del usuario
   * PUT /usuarios/:id
   */
  async actualizarPerfil(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/usuarios/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar perfil'
      };
    }
  }

  // ============================================
  // INSTITUCIONES - Detalles
  // ============================================
  
  /**
   * Obtener una institución por ID
   * GET /instituciones/:id
   */
  async getInstitucionById(id: number): Promise<ApiResponse<InstitucionBackend>> {
    try {
      const response = await httpService.get<ApiResponse<InstitucionBackend>>(`/instituciones/${id}`);
      return response.data;
    } catch (error: any) {
      console.warn(`Endpoint /instituciones/${id} no disponible`);
      return {
        success: false,
        message: error.message || 'Error al obtener institución'
      };
    }
  }

  /**
   * Obtener todas las instituciones
   * GET /instituciones (endpoint público)
   */
  async getInstituciones(): Promise<ApiResponse<InstitucionBackend[]>> {
    try {
      const response = await httpService.get<ApiResponse<InstitucionBackend[]>>('/instituciones');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /instituciones no disponible:', error.message);
      return {
        success: false,
        message: error.message || 'Error al obtener instituciones',
        data: []
      };
    }
  }

  /**
   * Obtener estadísticas del rector
   * GET /rectores/estadisticas
   */
  async getEstadisticasRector(): Promise<ApiResponse<EstadisticasRectorResponse>> {
    try {
      const response = await httpService.get<ApiResponse<EstadisticasRectorResponse>>('/rectores/estadisticas');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /rectores/estadisticas no disponible:', error.message);
      return {
        success: false,
        message: error.message || 'Error al obtener estadísticas'
      };
    }
  }

  /**
   * Obtener directivos de una institución
   * GET /instituciones/:id/directivos
   */
  async getDirectivosInstitucion(institucionId: number): Promise<ApiResponse<DirectivosInstitucionResponse>> {
    try {
      const response = await httpService.get<ApiResponse<DirectivosInstitucionResponse>>(`/instituciones/${institucionId}/directivos`);
      return response.data;
    } catch (error: any) {
      console.warn(`Endpoint /instituciones/${institucionId}/directivos no disponible`);
      return {
        success: false,
        message: error.message || 'Error al obtener directivos',
        data: { coordinadores: [], orientadores: [] }
      };
    }
  }

  // ============================================
  // UTILIDADES
  // ============================================
  
  private getToken(): string | null {
    try {
      const session = localStorage.getItem('session');
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.token || null;
      }
    } catch (e) {
      console.warn('Error getting token:', e);
    }
    return null;
  }

  // ============================================
  // COORDINADOR ACADÉMICO
  // ============================================
  
  /**
   * Obtener estadísticas del coordinador
   * GET /coordinadores/estadisticas
   */
  async getEstadisticasCoordinador(): Promise<ApiResponse<EstadisticasCoordinadorResponse>> {
    try {
      const response = await httpService.get<ApiResponse<EstadisticasCoordinadorResponse>>('/coordinadores/estadisticas');
      return response.data;
    } catch (error: any) {
      console.error('Endpoint /coordinadores/estadisticas no disponible:', error.message);
      // Fallback con datos calculados localmente
      return {
        success: false,
        message: 'Endpoint no disponible',
        data: {
          totalCursos: 0,
          totalDocentes: 0,
          totalOrientadores: 0,
          totalEstudiantes: 0,
          tareasCreadas: 0,
          tareasCalificadas: 0,
          tareasPendientes: 0,
          promedioGeneral: 0,
          cursosConAlerta: 0
        }
      };
    }
  }

  /**
   * Obtener cursos con métricas académicas
   * GET /coordinadores/cursos
   */
  async getCursosCoordinador(): Promise<ApiResponse<CursoCoordinadorResponse[]>> {
    try {
      const response = await httpService.get<ApiResponse<CursoCoordinadorResponse[]>>('/coordinadores/cursos');
      return response.data;
    } catch (error: any) {
      console.error('Endpoint /coordinadores/cursos no disponible:', error.message);
      return {
        success: false,
        message: 'Endpoint no disponible',
        data: []
      };
    }
  }

  /**
   * Obtener alertas académicas
   * GET /coordinadores/alertas
   */
  async getAlertasCoordinador(): Promise<ApiResponse<AlertasCoordinadorResponse>> {
    try {
      const response = await httpService.get<ApiResponse<AlertasCoordinadorResponse>>('/coordinadores/alertas');
      return response.data;
    } catch (error: any) {
      console.error('Endpoint /coordinadores/alertas no disponible:', error.message);
      return {
        success: false,
        message: 'Endpoint no disponible',
        data: {
          alertas: [],
          resumen: { criticas: 0, moderadas: 0, leves: 0 }
        }
      };
    }
  }

  /**
   * Obtener docentes con seguimiento académico
   * GET /coordinadores/docentes
   */
  async getDocentesCoordinador(): Promise<ApiResponse<DocenteCoordinadorResponse[]>> {
    try {
      const response = await httpService.get<ApiResponse<DocenteCoordinadorResponse[]>>('/coordinadores/docentes');
      return response.data;
    } catch (error: any) {
      console.error('Endpoint /coordinadores/docentes no disponible:', error.message);
      return {
        success: false,
        message: 'Endpoint no disponible',
        data: []
      };
    }
  }

  /**
   * Obtener orientadores con métricas
   * GET /coordinadores/orientadores
   */
  async getOrientadoresCoordinador(): Promise<ApiResponse<OrientadorCoordinadorResponse[]>> {
    try {
      const response = await httpService.get<ApiResponse<OrientadorCoordinadorResponse[]>>('/coordinadores/orientadores');
      return response.data;
    } catch (error: any) {
      console.error('Endpoint /coordinadores/orientadores no disponible:', error.message);
      return {
        success: false,
        message: 'Endpoint no disponible',
        data: []
      };
    }
  }

  /**
   * Obtener rendimiento detallado de un curso
   * GET /coordinadores/cursos/:id/rendimiento
   */
  async getRendimientoCurso(cursoId: number): Promise<ApiResponse<RendimientoCursoResponse>> {
    try {
      const response = await httpService.get<ApiResponse<RendimientoCursoResponse>>(`/coordinadores/cursos/${cursoId}/rendimiento`);
      return response.data;
    } catch (error: any) {
      console.error(`Endpoint /coordinadores/cursos/${cursoId}/rendimiento no disponible:`, error.message);
      return {
        success: false,
        message: 'Endpoint no disponible',
        data: {
          cursoId,
          promedioGeneral: 0,
          distribucionRangos: {
            superior: { cantidad: 0, porcentaje: 0 },
            alto: { cantidad: 0, porcentaje: 0 },
            basico: { cantidad: 0, porcentaje: 0 },
            bajo: { cantidad: 0, porcentaje: 0 }
          },
          promediosPorAsignatura: [],
          tendencia: 'estable'
        }
      };
    }
  }
}

// Instancia singleton
export const apiClient = new ApiClient();

export default apiClient;