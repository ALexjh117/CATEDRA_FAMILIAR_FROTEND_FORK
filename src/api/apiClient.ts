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

export interface PersonalCoordinadorItem {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  tipo: 'docente' | 'orientador';
  rolNombre: string;
  estaActivo: boolean;
  tienePerfilCompleto?: boolean;
  metricas: {
    tareasCreadas?: number;
    casosAcompanamiento?: number;
  };
}

export interface PersonalCoordinadorResponse {
  data: PersonalCoordinadorItem[];
  resumen: {
    totalDocentes: number;
    totalOrientadores: number;
    totalActivos: number;
  };
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
    errores: Array<{ fila: number; error: string }>;
  };
}

export interface CargaMasivaDualResponse {
  success: boolean;
  message: string;
  data?: {
    totalEstudiantes: number;
    estudiantesCreados: number;
    estudiantesActualizados: number;
    totalAcudientes: number;
    acudientesCreados: number;
    acudientesReutilizados: number;
    vinculosCreados: number;
    errores?: Array<{
      archivo: 'estudiantes' | 'acudientes';
      fila: number;
      campo: string;
      valor: any;
      mensaje: string;
    }>;
    detalleEstudiantes?: any[];
    detalleAcudientes?: any[];
    detalleReutilizados?: any[];
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
   * Login Acudiente (App Móvil)
   * POST /acudientes/login
   */
  async loginAcudiente(documento: string, password: string): Promise<LoginResponse> {
    try {
      const response = await httpService.post<LoginResponse>('/acudientes/login', {
        documento: documento.trim(),
        password: password.trim()
      });
      
      if (response.data.success && response.data.data?.token) {
        httpService.setAuthToken(response.data.data.token);
        
        const sessionData = {
          user: {
            id: response.data.data.usuario.id,
            correo: response.data.data.usuario.correo,
            nombre: response.data.data.usuario.nombre || 'Acudiente',
            apellidos: response.data.data.usuario.apellido || '',
            rol: 'acudiente',
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
      console.error('Login acudiente error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error de conexión'
      };
    }
  }

  /**
   * Reset Password Acudiente
   * POST /acudientes/reset-password
   */
  async resetPasswordAcudiente(documento: string): Promise<ApiResponse> {
    try {
      const response = await httpService.post<ApiResponse>('/acudientes/reset-password', {
        numeroDocumento: documento
      });
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al resetear contraseña'
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
    console.log('[DEBUG][apiClient.crearCoordinador] Session:', session);
    const rolId = session?.user?.rolId;
    const rol = session?.user?.rol;
    console.log('[DEBUG][apiClient.crearCoordinador] rolId:', rolId, 'rol:', rol);
    if (rolId === 1 || rol === 'admin' || rol === 'admin_sistema') {
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
      const baseUrl = '/api';
      
      const response = await httpService.get(`/estudiantes/plantilla-excel`, { responseType: 'blob' });
      if (response.status !== 200) throw new Error('Error al descargar plantilla');
      const blob = response.data;
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
      const baseUrl = '/api';
      const formData = new FormData();
      formData.append('archivo', archivo);
      
      const response = await httpService.post(`/estudiantes/validar-excel`, formData);
      return response.data;
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
      const baseUrl = '/api';
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('cursoId', String(cursoId));
      
      const response = await httpService.post(`/estudiantes/carga-masiva`, formData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error en carga masiva'
      };
    }
  }

  /**
   * Carga masiva dual (dos archivos: estudiantes + acudientes)
   * POST /estudiantes/carga-masiva-dual
   */
  async cargaMasivaDual(
    archivoEstudiantes: File, 
    archivoAcudientes: File, 
    institucionId: number
  ): Promise<CargaMasivaDualResponse> {
    try {
      const token = this.getToken();
      const baseUrl = '/api';
      
      console.log('🔧 [apiClient] cargaMasivaDual iniciado');
      console.log('🔑 Token:', token ? 'Presente' : 'FALTA TOKEN');
      console.log('🌐 Base URL:', baseUrl);
      console.log('📄 Archivo Estudiantes:', archivoEstudiantes.name, archivoEstudiantes.type);
      console.log('👨‍👩‍👧 Archivo Acudientes:', archivoAcudientes.name, archivoAcudientes.type);
      console.log('🏫 Institución ID:', institucionId);

      // Asegura que el token esté en el header antes de la petición
      if (token) {
        httpService.setAuthToken(token);
      }

      const formData = new FormData();
      formData.append('archivo_estudiantes', archivoEstudiantes);
      formData.append('archivo_acudientes', archivoAcudientes);
      formData.append('institucionId', String(institucionId));

      console.log('📦 FormData creado, enviando a:', `${baseUrl}/estudiantes/carga-masiva-dual`);

      const response = await httpService.post(`/estudiantes/carga-masiva-dual`, formData);
      if (response.status !== 200 && response.status !== 201) {
        return {
          success: false,
          message: `Error HTTP ${response.status}: ${response.data}`
        };
      }
      const data = response.data;
      console.log('✅ Response JSON:', data);
      return data;
    } catch (error: any) {
      console.error('💥 Error en cargaMasivaDual:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return {
        success: false,
        message: error.message || 'Error en carga masiva dual'
      };
    }
  }
  
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
  // USUARIOS - CRUD COMPLETO (API Admin)
  // ============================================

  /**
   * Obtener todos los usuarios del sistema
   * GET /admin/usuarios
   */
  async getUsuarios(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/admin/usuarios');
      console.log('📋 [apiClient.ts] getUsuarios respuesta:', response.data);
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /admin/usuarios no disponible:', error.message);
      return { success: false, message: error.message || 'Error al obtener usuarios', data: [] };
    }
  }

  /**
   * Crear usuario (cualquier rol)
   * POST /admin/usuarios
   */
  async createUsuario(data: {
    correo: string;
    contrasena: string;
    rolId: number;
    nombre?: string;
    apellido?: string;
    telefono?: string;
    institucionId?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/admin/usuarios', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear usuario';
      return { success: false, message: errorMessage, data: null };
    }
  }

  /**
   * Actualizar usuario
   * PUT /usuarios/:id
   */
  async updateUsuario(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/usuarios/${id}`, data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al actualizar usuario', data: null };
    }
  }

  /**
   * Eliminar usuario permanentemente (hard delete)
   * DELETE /admin/usuarios/:id
   */
  async deleteUsuario(id: number): Promise<ApiResponse<void>> {
    console.log('🗑️ [apiClient.ts] deleteUsuario (HARD DELETE) llamado con id:', id);
    console.log('🗑️ [apiClient.ts] Endpoint: DELETE /admin/usuarios/' + id);
    try {
      const response = await httpService.delete<ApiResponse<void>>(`/admin/usuarios/${id}`);
      console.log('🗑️ [apiClient.ts] Respuesta del servidor:', response);
      console.log('🗑️ [apiClient.ts] response.data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🗑️ [apiClient.ts] Error en la petición:', error);
      console.error('🗑️ [apiClient.ts] error.response:', error.response);
      console.error('🗑️ [apiClient.ts] error.response?.data:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al eliminar usuario';
      return { success: false, message: errorMessage };
    }
  }

  /**
   * Activar usuario
   * PUT /admin/usuarios/:id/activar
   */
  async activarUsuario(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/admin/usuarios/${id}/activar`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al activar usuario', data: null };
    }
  }

  /**
   * Desactivar usuario
   * PUT /admin/usuarios/:id/desactivar
   */
  async desactivarUsuario(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/admin/usuarios/${id}/desactivar`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al desactivar usuario', data: null };
    }
  }

  /**
   * Crear Rector
   * POST /admin/rectores
   */
  async createRector(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    institucionId: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/admin/rectores', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear rector';
      return { success: false, message: errorMessage, data: null };
    }
  }

  /**
   * Crear Coordinador (Admin)
   * POST /admin/coordinadores
   */
  async createCoordinadorAdmin(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    institucionId: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/admin/coordinadores', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear coordinador';
      return { success: false, message: errorMessage, data: null };
    }
  }

  /**
   * Crear Orientador
   * POST /admin/orientadores
   */
  async createOrientador(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    institucionId: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/admin/orientadores', data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear orientador';
      return { success: false, message: errorMessage, data: null };
    }
  }

  // ============================================
  // DOCENTES - CRUD COMPLETO
  // ============================================

  /**
   * Obtener todos los docentes
   * GET /docentes
   */
  async getDocentes(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/docentes');
      return response.data;
    } catch (error: any) {
      console.warn('Endpoint /docentes no disponible, usando respuesta vacía');
      return { success: true, message: 'Sin datos', data: [] };
    }
  }

  /**
   * Obtener un docente por ID
   * GET /docentes/:id
   */
  async getDocenteById(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.get<ApiResponse<any>>(`/docentes/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Docente no encontrado' };
    }
  }

  /**
   * Crear un nuevo docente
   * POST /docentes
   */
  async createDocente(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    institucionId: number;
    cursoIds?: number[];
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/docentes', data);
      return response.data;
    } catch (error: any) {
      console.error('Error POST /docentes:', error.message);
      return { success: false, message: error.message || 'Error al crear docente' };
    }
  }

  /**
   * Actualizar un docente
   * PUT /docentes/:id
   */
  async updateDocente(id: number, data: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    cursoIds?: number[];
    estaActivo?: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/docentes/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error PUT /docentes/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al actualizar docente' };
    }
  }

  /**
   * Eliminar un docente
   * DELETE /docentes/:id
   */
  async deleteDocente(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.delete<ApiResponse<void>>(`/docentes/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error DELETE /docentes/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al eliminar docente' };
    }
  }

  // ============================================
  // CURSOS - CRUD COMPLETO
  // ============================================
  
  /**
   * Obtener todos los cursos
   * GET /cursos
   */
  async getCursos(): Promise<ApiResponse<any[]>> {
    try {
      console.log('📡 [apiClient] Llamando GET /cursos...');
      const response = await httpService.get<any>('/cursos');
      console.log('📥 [apiClient] Respuesta de cursos:', response.data);
      
      // El backend puede devolver array directo o { data: [...] }
      const cursos = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      console.log('🔢 [apiClient] Total cursos recibidos:', cursos.length);
      
      return {
        success: true,
        message: 'Cursos obtenidos',
        data: cursos
      };
    } catch (error: any) {
      console.warn('Endpoint /cursos no disponible, usando respuesta vacía');
      return { success: true, message: 'Sin datos', data: [] };
    }
  }

  /**
   * Obtener un curso por ID
   * GET /cursos/:id
   */
  async getCursoById(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.get<ApiResponse<any>>(`/cursos/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Curso no encontrado' };
    }
  }

  /**
   * Crear un nuevo curso
   * POST /cursos
   */
  async createCurso(data: {
    nombre: string;
    gradoId: number;
    jornada: 'Mañana' | 'Tarde' | 'Completa';
    institucionId: number;
    docenteId?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/cursos', data);
      return response.data;
    } catch (error: any) {
      console.error('Error POST /cursos:', error.message);
      return { success: false, message: error.message || 'Error al crear curso' };
    }
  }

  /**
   * Actualizar un curso
   * PUT /cursos/:id
   */
  async updateCurso(id: number, data: {
    nombre?: string;
    gradoId?: number;
    jornada?: 'Mañana' | 'Tarde' | 'Completa';
    docenteId?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/cursos/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error PUT /cursos/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al actualizar curso' };
    }
  }

  /**
   * Eliminar un curso
   * DELETE /cursos/:id
   */
  async deleteCurso(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.delete<ApiResponse<void>>(`/cursos/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error DELETE /cursos/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al eliminar curso' };
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

  /**
   * Crear nueva tarea en el banco
   * POST /tareas
   */
  async createTarea(data: {
    titulo: string;
    descripcion: string;
    categoriaId: number;
    tema?: string;
    enlace?: string;
    entregableEsperado?: string;
    gradosObjetivo?: number[];
    esMultiGrado?: boolean;
    tipoCalificacion?: 'cualitativa' | 'cuantitativa';
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/tareas', data);
      return response.data;
    } catch (error: any) {
      console.error('Error POST /tareas:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al crear tarea'
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
      console.log('📡 [apiClient] Llamando GET /estudiantes...');
      const response = await httpService.get<any>('/estudiantes');
      console.log('📥 [apiClient] Respuesta completa:', response);
      console.log('📊 [apiClient] response.data:', response.data);
      
      // El backend devuelve array directo, no { data: [...] }
      const estudiantes = Array.isArray(response.data) ? response.data : [];
      console.log('🔢 [apiClient] Total estudiantes recibidos:', estudiantes.length);
      
      return {
        success: true,
        message: 'Estudiantes obtenidos',
        data: estudiantes
      };
    } catch (error: any) {
      console.error('❌ [apiClient] Error en GET /estudiantes:', error);
      console.error('📋 [apiClient] Error response:', error.response?.data);
      console.error('📋 [apiClient] Error status:', error.response?.status);
      console.warn('⚠️ [apiClient] Endpoint /estudiantes no disponible, usando respuesta vacía');
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
  // GRADOS - CRUD COMPLETO
  // ============================================
  
  /**
   * Obtener todos los grados
   * GET /grados
   */
  async getGrados(): Promise<ApiResponse<any[]>> {
    try {
      console.log('📡 [apiClient] Llamando GET /grados...');
      const response = await httpService.get<any>('/grados');
      console.log('📥 [apiClient] Respuesta de grados:', response.data);
      
      // El backend devuelve { success: true, data: [...] }
      const grados = response.data?.data || [];
      console.log('🔢 [apiClient] Total grados recibidos:', grados.length);
      
      return {
        success: true,
        message: 'Grados obtenidos',
        data: grados
      };
    } catch (error: any) {
      console.warn('Endpoint /grados no disponible, usando respuesta vacía');
      return { success: true, message: 'Sin datos', data: [] };
    }
  }

  /**
   * Obtener un grado por ID
   * GET /grados/:id
   */
  async getGradoById(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.get<ApiResponse<any>>(`/grados/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Grado no encontrado' };
    }
  }

  /**
   * Crear un nuevo grado
   * POST /grados
   */
  async createGrado(data: {
    nombre: string;
    descripcion?: string;
    institucionId?: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/grados', data);
      return response.data;
    } catch (error: any) {
      console.error('Error POST /grados:', error.message);
      
      // Detectar error de duplicado
      if (error.message && error.message.includes('grados_nombre_key')) {
        return { 
          success: false, 
          message: `El grado "${data.nombre}" ya existe. Por favor usa un nombre diferente.` 
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Error al crear grado' 
      };
    }
  }

  /**
   * Actualizar un grado
   * PUT /grados/:id
  } catch (error: any) {
    // Si falla, intentar con endpoints específicos según el rol
    const session = localStorage.getItem('session');
    if (session) {
      const parsed = JSON.parse(session);
      const rol = parsed.user?.rol;
   */
  async updateGrado(id: number, data: {
    nombre?: string;
    descripcion?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/grados/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error PUT /grados/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al actualizar grado' };
    }
  }

  /**
   * Eliminar un grado
   * DELETE /grados/:id
   */
  async deleteGrado(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.delete<ApiResponse<void>>(`/grados/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error DELETE /grados/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al eliminar grado' };
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

  /**
   * Crear categoría
   * POST /categorias
   */
  async createCategoria(data: {
    nombre: string;
    descripcion?: string | null;
    color?: string | null;
    icono?: string | null;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<any>('/categorias', data);
      const raw = response.data as any;

      if (typeof raw?.success === 'boolean') {
        return raw as ApiResponse<any>;
      }

      if (raw && (raw.id || raw.nombre)) {
        return {
          success: true,
          message: 'Categoría creada',
          data: raw
        };
      }

      return {
        success: true,
        message: 'Categoría creada',
        data: raw
      };
    } catch (error: any) {
      console.error('Error POST /categorias:', error);

      const rawMsg =
        error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Error al crear categoría';

      const msgLower = String(rawMsg).toLowerCase();
      const isDuplicada =
        msgLower.includes('categorias_nombre_key') ||
        msgLower.includes('llave duplicada') ||
        msgLower.includes('duplicate key') ||
        msgLower.includes('unique') ||
        msgLower.includes('unicidad');

      return {
        success: false,
        message: isDuplicada ? 'Ya existe una categoría con ese nombre' : rawMsg
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
      const response = await httpService.get<ApiResponse<any>>('/usuarios/me');
      return response.data;
    } catch (error: any) {
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
   * Crear institución
   * POST /instituciones
   */
  async createInstitucion(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/instituciones', data);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear institución:', error);
      
      // Manejo específico para error 409 Conflict
      if (error.response?.status === 409) {
        const conflictField = error.response?.data?.field || error.response?.data?.error || '';
        let conflictMessage = 'Ya existe una institución con ';
        
        if (conflictField.includes('codigo_dane') || conflictField.includes('codigoDane')) {
          conflictMessage += 'este código DANE';
        } else if (conflictField.includes('nit')) {
          conflictMessage += 'este NIT';
        } else if (conflictField.includes('nombre')) {
          conflictMessage += 'este nombre';
        } else {
          conflictMessage = error.response?.data?.message || 'Esta institución ya existe en el sistema';
        }
        
        return {
          success: false,
          message: conflictMessage,
          data: null
        };
      }
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Error al crear la institución';
      
      return {
        success: false,
        message: errorMessage,
        data: null
      };
    }
  }

  /**
   * Actualizar institución
   * PUT /instituciones/:id
   */
  async updateInstitucion(id: number, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/instituciones/${id}`, data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Error al actualizar la institución';
      
      return {
        success: false,
        message: errorMessage,
        data: null
      };
    }
  }

  /**
   * Eliminar institución
   * DELETE /instituciones/:id
   */
  async deleteInstitucion(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.delete<ApiResponse<void>>(`/instituciones/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Error al eliminar la institución';
      
      return {
        success: false,
        message: errorMessage
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
   * Listar coordinadores de la institución del rector
   * GET /rectores/coordinadores
   */
  async getCoordinadoresRector(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/rectores/coordinadores');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener coordinadores', data: [] };
    }
  }

  /**
   * Listar orientadores de la institución del rector
   * GET /rectores/orientadores
   */
  async getOrientadoresRector(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/rectores/orientadores');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener orientadores', data: [] };
    }
  }

  /**
   * Listar docentes de la institución del rector
   * GET /rectores/docentes
   */
  async getDocentesRector(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/rectores/docentes');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener docentes', data: [] };
    }
  }

  /**
   * Listar cursos de la institución del rector
   * GET /rectores/cursos
   */
  async getCursosRector(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/rectores/cursos');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener cursos', data: [] };
    }
  }

  /**
   * Obtener datos de la institución del rector
   * GET /rectores/mi-institucion
   */
  async getMiInstitucionRector(): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.get<ApiResponse<any>>('/rectores/mi-institucion');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener institución', data: null };
    }
  }

  /**
   * Actualizar datos de la institución del rector
   * PUT /rectores/mi-institucion
   */
  async updateMiInstitucionRector(data: {
    telefono?: string;
    correo?: string;
    direccion?: string;
    rectorNombre?: string;
    rectorDocumento?: string;
    rectorCorreo?: string;
    rectorTelefono?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>('/rectores/mi-institucion', data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al actualizar institución' };
    }
  }

  /**
   * Listar períodos académicos de la institución del rector
   * GET /rectores/periodos
   */
  async getPeriodosRector(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/rectores/periodos');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener períodos', data: [] };
    }
  }

  /**
   * Crear período académico
   * POST /rectores/periodos
   */
  async createPeriodoRector(data: {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    anio: number;
    estado?: 'activo' | 'inactivo' | 'finalizado';
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/rectores/periodos', data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al crear período' };
    }
  }

  /**
   * Actualizar período académico
   * PUT /rectores/periodos/:id
   */
  async updatePeriodoRector(id: number, data: {
    nombre?: string;
    fechaInicio?: string;
    fechaFin?: string;
    anio?: number;
    estado?: 'activo' | 'inactivo' | 'finalizado';
  }): Promise<ApiResponse<any>> {
    try {
      console.log('🔧 [updatePeriodoRector] Actualizando período:', id);
      console.log('📦 Datos enviados:', JSON.stringify(data, null, 2));
      
      const response = await httpService.put<ApiResponse<any>>(`/rectores/periodos/${id}`, data);
      
      console.log('✅ Respuesta del backend:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error al actualizar período:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error al actualizar período';
      return { 
        success: false, 
        message: errorMessage,
        data: error.response?.data 
      };
    }
  }

  /**
   * Eliminar período académico
   * DELETE /rectores/periodos/:id
   */
  async deletePeriodoRector(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.delete<ApiResponse<any>>(`/rectores/periodos/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al eliminar período' };
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

  /**
   * Crear docente en la institución del coordinador
   * POST /coordinadores/docentes
   */
  async crearDocenteCoordinador(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/coordinadores/docentes', data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || error.message || 'Error al crear docente' };
    }
  }

  /**
   * Crear orientador en la institución del coordinador
   * POST /coordinadores/orientadores
   */
  async crearOrientadorCoordinador(data: {
    correo: string;
    contrasena: string;
    nombre: string;
    apellido: string;
    telefono?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/coordinadores/orientadores', data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || error.message || 'Error al crear orientador' };
    }
  }

  /**
   * Actualizar orientador en la institución del coordinador
   * PUT /coordinadores/orientadores/:id
   */
  async actualizarOrientadorCoordinador(id: number, data: {
    nombre?: string;
    apellido?: string;
    telefono?: string;
    correo?: string;
    estaActivo?: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.put<ApiResponse<any>>(`/coordinadores/orientadores/${id}`, data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || error.message || 'Error al actualizar orientador' };
    }
  }

  /**
   * Eliminar orientador en la institución del coordinador
   * DELETE /coordinadores/orientadores/:id
   */
  async eliminarOrientadorCoordinador(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.delete<ApiResponse<any>>(`/coordinadores/orientadores/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error DELETE /coordinadores/orientadores/${id}:`, error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error al eliminar orientador';
      return { 
        success: false, 
        message: errorMessage,
        data: error.response?.data
      };
    }
  }

  /**
   * Obtener datos de la institución del coordinador (solo lectura)
   * GET /coordinadores/mi-institucion
   */
  async getMiInstitucionCoordinador(): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.get<ApiResponse<any>>('/coordinadores/mi-institucion');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener institución', data: null };
    }
  }

  /**
   * Obtener períodos académicos (solo lectura para coordinador)
   * GET /coordinadores/periodos
   */
  async getPeriodosCoordinador(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/coordinadores/periodos');
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener períodos', data: [] };
    }
  }

  /**
   * Obtener vista unificada de personal (docentes + orientadores)
   * GET /coordinadores/personal
   * ⭐ RECOMENDADO: 1 request en lugar de 2, incluye resumen automático
   */
  async getPersonalCoordinador(): Promise<ApiResponse<PersonalCoordinadorResponse>> {
    try {
      const response = await httpService.get<ApiResponse<PersonalCoordinadorResponse>>('/coordinadores/personal');
      return response.data;
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Error al obtener personal',
        data: { data: [], resumen: { totalDocentes: 0, totalOrientadores: 0, totalActivos: 0 } }
      };
    }
  }

  // ============================================
  // CRUD ORIENTADORES (Panel Coordinador)
  // ============================================

  /**
   * Listar orientadores de la institución
   * GET /orientadores
   */
  async getOrientadores(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/orientadores');
      return response.data;
    } catch (error: any) {
      console.error('Error GET /orientadores:', error.message);
      return { success: false, message: error.message || 'Error al obtener orientadores', data: [] };
    }
  }

  /**
   * Ver detalle de un orientador
   * GET /orientadores/:id
   */
  async getOrientador(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.get<ApiResponse<any>>(`/orientadores/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error GET /orientadores/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al obtener orientador', data: null };
    }
  }

  /**
   * Crear orientador
   * POST /orientadores
   */
  async createOrientadorCoordinador(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  }): Promise<ApiResponse<{ id: number; email: string; passwordTemporal: string }>> {
    try {
      const response = await httpService.post<ApiResponse<any>>('/orientadores', data);
      return response.data;
    } catch (error: any) {
      console.error('Error POST /orientadores:', error.message);
      return { success: false, message: error.message || 'Error al crear orientador', data: null as any };
    }
  }

  /**
   * Actualizar orientador
   * PUT /orientadores/:id
   */
  async updateOrientador(id: number, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.put<ApiResponse<void>>(`/orientadores/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error PUT /orientadores/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al actualizar orientador' };
    }
  }

  /**
   * Desactivar orientador (soft delete)
   * DELETE /orientadores/:id
   */
  async deleteOrientador(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.delete<ApiResponse<void>>(`/orientadores/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error DELETE /orientadores/${id}:`, error.message);
      return { success: false, message: error.message || 'Error al desactivar orientador' };
    }
  }

  /**
   * Listar todos los acudientes de la institución (Coordinador)
   * GET /coordinadores/acudientes
   */
  async getAcudientesCoordinador(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/coordinadores/acudientes');
      return response.data;
    } catch (error: any) {
      console.error('Error GET /coordinadores/acudientes:', error.message);
      return { success: false, message: error.message || 'Error al obtener acudientes', data: [] };
    }
  }

  /**
   * Listar todos los acudientes de la institución (Orientador)
   * GET /orientadores/acudientes
   */
  async getAcudientesOrientador(): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>('/orientadores/acudientes');
      return response.data;
    } catch (error: any) {
      console.error('Error GET /orientadores/acudientes:', error.message);
      return { success: false, message: error.message || 'Error al obtener acudientes', data: [] };
    }
  }

  /**
   * Listar acudientes de un estudiante específico
   * GET /estudiantes/:id/acudientes
   */
  async getAcudientesEstudiante(estudianteId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>(`/estudiantes/${estudianteId}/acudientes`);
      return response.data;
    } catch (error: any) {
      console.error(`Error GET /estudiantes/${estudianteId}/acudientes:`, error.message);
      return { success: false, message: error.message || 'Error al obtener acudientes del estudiante', data: [] };
    }
  }

  /**
   * Vincular acudiente a estudiante
   * POST /estudiantes/:id/acudientes
   */
  async vincularAcudiente(estudianteId: number, data: {
    acudienteId: number;
    esPrincipal?: boolean;
    autorizacionRecogida?: boolean;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.post<ApiResponse<void>>(`/estudiantes/${estudianteId}/acudientes`, data);
      return response.data;
    } catch (error: any) {
      console.error(`Error POST /estudiantes/${estudianteId}/acudientes:`, error.message);
      return { success: false, message: error.message || 'Error al vincular acudiente' };
    }
  }

  /**
   * Actualizar vínculo estudiante-acudiente
   * PUT /estudiantes/:estudianteId/acudientes/:acudienteId
   */
  async updateVinculoAcudiente(estudianteId: number, acudienteId: number, data: {
    esPrincipal?: boolean;
    autorizacionRecogida?: boolean;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.put<ApiResponse<void>>(
        `/estudiantes/${estudianteId}/acudientes/${acudienteId}`, 
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error PUT vinculo estudiante-acudiente:`, error.message);
      return { success: false, message: error.message || 'Error al actualizar vínculo' };
    }
  }

  /**
   * Desvincular acudiente de estudiante
   * DELETE /estudiantes/:estudianteId/acudientes/:acudienteId
   */
  async desvincularAcudiente(estudianteId: number, acudienteId: number): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.delete<ApiResponse<void>>(
        `/estudiantes/${estudianteId}/acudientes/${acudienteId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error DELETE vinculo estudiante-acudiente:`, error.message);
      return { success: false, message: error.message || 'Error al desvincular acudiente' };
    }
  }

  // ============================================
  // GESTIÓN AVANZADA DE ESTUDIANTES
  // ============================================

  /**
   * Cambiar curso de un estudiante
   * POST /estudiantes/:id/cambiar-curso
   */
  async cambiarCursoEstudiante(estudianteId: number, data: {
    nuevoCursoId: number;
    motivo?: string;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.post<ApiResponse<void>>(
        `/estudiantes/${estudianteId}/cambiar-curso`, 
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error POST /estudiantes/${estudianteId}/cambiar-curso:`, error.message);
      return { success: false, message: error.message || 'Error al cambiar curso' };
    }
  }

  /**
   * Retirar estudiante (soft delete)
   * POST /estudiantes/:id/retirar
   */
  async retirarEstudiante(estudianteId: number, data: {
    motivo: string;
    fechaRetiro?: string;
  }): Promise<ApiResponse<void>> {
    try {
      const response = await httpService.post<ApiResponse<void>>(
        `/estudiantes/${estudianteId}/retirar`, 
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error POST /estudiantes/${estudianteId}/retirar:`, error.message);
      return { success: false, message: error.message || 'Error al retirar estudiante' };
    }
  }

  /**
   * Historial de cambios del estudiante
   * GET /estudiantes/:id/historial
   */
  async getHistorialEstudiante(estudianteId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await httpService.get<ApiResponse<any[]>>(`/estudiantes/${estudianteId}/historial`);
      return response.data;
    } catch (error: any) {
      console.error(`Error GET /estudiantes/${estudianteId}/historial:`, error.message);
      return { success: false, message: error.message || 'Error al obtener historial', data: [] };
    }
  }

  // ============================================
  // REPORTES COORDINADOR
  // ============================================

  /**
   * Reporte de entregas por curso
   * GET /reportes/cursos/:cursoId/entregas
   */
  async getReporteEntregasCurso(cursoId: number, periodo?: number): Promise<ApiResponse<any>> {
    try {
      const params = periodo ? `?periodo=${periodo}` : '';
      const response = await httpService.get<ApiResponse<any>>(`/reportes/cursos/${cursoId}/entregas${params}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error GET /reportes/cursos/${cursoId}/entregas:`, error.message);
      return { success: false, message: error.message || 'Error al obtener reporte', data: null };
    }
  }

  /**
   * Reporte de calificaciones por curso
   * GET /reportes/cursos/:cursoId/calificaciones
   */
  async getReporteCalificacionesCurso(cursoId: number, periodo?: number): Promise<ApiResponse<any>> {
    try {
      const params = periodo ? `?periodo=${periodo}` : '';
      const response = await httpService.get<ApiResponse<any>>(`/reportes/cursos/${cursoId}/calificaciones${params}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error GET /reportes/cursos/${cursoId}/calificaciones:`, error.message);
      return { success: false, message: error.message || 'Error al obtener reporte', data: null };
    }
  }

  /**
   * Resumen institucional
   * GET /reportes/institucion/resumen
   */
  async getResumenInstitucional(): Promise<ApiResponse<any>> {
    try {
      const response = await httpService.get<ApiResponse<any>>('/reportes/institucion/resumen');
      return response.data;
    } catch (error: any) {
      console.error('Error GET /reportes/institucion/resumen:', error.message);
      return { success: false, message: error.message || 'Error al obtener resumen', data: null };
    }
  }
}

// Instancia singleton
export const apiClient = new ApiClient();

export default apiClient;