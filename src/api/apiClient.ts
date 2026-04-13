// ============================================
// API CLIENT - Wrapper para httpService
// ============================================

import httpService from './httpService';

// Utilidad local para leer el payload del JWT sin dependencias
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

const getSessionRolId = (): number | null => {
  try {
    const sessionRaw = localStorage.getItem('session');
    if (!sessionRaw) return null;
    const session = JSON.parse(sessionRaw);
    const rolId = session?.user?.rolId;
    if (typeof rolId === 'number') return rolId;
    // Mapear desde string si es necesario
    const rolStr: string | undefined = session?.user?.rol;
    if (rolStr) {
      const map: Record<string, number> = {
        admin_sistema: 1,
        rector: 2,
        coordinador: 3,
        orientador: 4,
        docente_aula: 5,
        acudiente: 6,
        admin: 7,
      };
      return map[rolStr] ?? null;
    }
    return null;
  } catch {
    return null;
  }
};

const getSessionInstitucionId = (): number | null => {
  try {
    const sessionRaw = localStorage.getItem('session');
    
    if (!sessionRaw) {
      return null;
    }
    
    const session = JSON.parse(sessionRaw);
    
    // Intentar múltiples fuentes: user, user.institucion, context y, como último recurso, el token JWT
    let rawInstitucionId = session?.user?.institucionId ?? 
                           session?.user?.institucion_id ?? 
                           session?.user?.institucion?.id ??
                           session?.context?.institucionId ??
                           session?.context?.institucion_id;

    if (!rawInstitucionId && session?.token) {
      const payload = parseJwtPayload(session.token);
      if (payload) {
        rawInstitucionId = payload.institucionId ?? payload.institucion_id ?? payload['institucion.id'];
      }
    }
    
    const institucionId = Number(rawInstitucionId);
    const result = institucionId && !Number.isNaN(institucionId) ? institucionId : null;
    
    return result;
  } catch (error) {
    return null;
  }
};

// Crear un wrapper que mantenga la compatibilidad con el código existente
class ApiClient {
  // Métodos HTTP básicos
  async get(endpoint: string, params?: any) {
    return await httpService.get(endpoint, params);
  }

  async post(endpoint: string, data?: any) {
    return await httpService.post(endpoint, data);
  }

  async put(endpoint: string, data?: any) {
    return await httpService.put(endpoint, data);
  }

  async delete(endpoint: string) {
    return await httpService.delete(endpoint);
  }

  // Autenticación
  async login(correo: string, password: string, roleHint?: string) {
    return await httpService.post('/login', { correo, password, roleHint });
  }

  async logout() {
    return await httpService.post('/auth/logout');
  }

  // Instituciones
  async getInstituciones() {
    return await httpService.get('/instituciones');
  }

  async getInstitucionById(id: number) {
    return await httpService.get(`/instituciones/${id}`);
  }

  async getInstitucionCompleta() {
    const institucionId = getSessionInstitucionId();
    if (!institucionId) {
      throw new Error('No se encontró institucionId en la sesión');
    }
    return await httpService.get(`/instituciones/${institucionId}`);
  }

  async createInstitucion(data: any) {
    return await httpService.post('/instituciones', data);
  }

  // Usuarios
  async getUsuarios() {
    return await httpService.get('/usuarios');
  }

  async crearRector(data: any) {
    return await httpService.post('/usuarios/rector', data);
  }

  async crearCoordinador(data: any) {
    return await httpService.post('/usuarios/coordinador', data);
  }

  async crearCoordinadorAdmin(data: any) {
    return await httpService.post('/admin/coordinadores', data);
  }

  async crearCoordinadorRector(data: any) {
    return await httpService.post('/rector/coordinadores', data);
  }

  // Edición completa de usuario (solo admin_sistema)
  async updateUsuario(id: number, data: any) {
    // Endpoint documentado: PUT /admin/usuarios/:id/editar
    return await httpService.put(`/admin/usuarios/${id}/editar`, data);
  }

  // Eliminar usuario (compatibilidad con llamadas existentes)
  async deleteUsuario(id: number) {
    // Si existe un endpoint admin específico, ajústese aquí cuando esté disponible
    return await httpService.delete(`/usuarios/${id}`);
  }

  // Tareas
  async getTareas() {
    return await httpService.get('/tareas');
  }

  async createTarea(data: any) {
    return await httpService.post('/tareas', data);
  }

  // Categorías
  async getCategorias() {
    return await httpService.get('/categorias');
  }

  // Estadísticas
  async getEstadisticasRector() {
    const res = await httpService.get<any>('/rector/estadisticas');
    const raw = (res as any)?.data ?? res;
    const data = raw?.data ?? raw;
    return { success: raw?.success !== false, data, message: raw?.message, status: (res as any)?.status };
  }

  // Endpoints específicos del rector
  async getCoordinadoresRector() {
    const res = await httpService.get<any>('/rector/coordinadores');
    const raw = (res as any)?.data ?? res;
    const arr = raw?.data ?? raw?.coordinadores ?? (Array.isArray(raw) ? raw : []);
    return { success: raw?.success !== false, data: Array.isArray(arr) ? arr : [], message: raw?.message, status: (res as any)?.status };
  }

  async getOrientadoresRector() {
    const res = await httpService.get<any>('/rector/orientadores');
    const raw = (res as any)?.data ?? res;
    const arr = raw?.data ?? raw?.orientadores ?? (Array.isArray(raw) ? raw : []);
    return { success: raw?.success !== false, data: Array.isArray(arr) ? arr : [], message: raw?.message, status: (res as any)?.status };
  }

  async getDocentesRector() {
    const res = await httpService.get<any>('/rector/docentes');
    const raw = (res as any)?.data ?? res;
    const arr = raw?.data ?? raw?.docentes ?? (Array.isArray(raw) ? raw : []);
    return { success: raw?.success !== false, data: Array.isArray(arr) ? arr : [], message: raw?.message, status: (res as any)?.status };
  }

  async getEstadisticasCoordinador() {
    return await httpService.get('/coordinadores/estadisticas');
  }

  // Directivos
  async getDirectivosInstitucion(institucionId: number) {
    const res = await httpService.get<any>(`/instituciones/${institucionId}/directivos`);
    const raw = (res as any)?.data ?? res;
    const data = raw?.data ?? raw ?? {};
    // Esperado: { coordinadores: [], orientadores: [] }
    const normalized = {
      coordinadores: Array.isArray((data as any)?.coordinadores) ? (data as any).coordinadores : [],
      orientadores: Array.isArray((data as any)?.orientadores) ? (data as any).orientadores : []
    };
    return { success: raw?.success !== false, data: normalized, message: raw?.message, status: (res as any)?.status };
  }

  // Cursos para rector (usado en algunos paneles)
  async getCursosRector() {
    const res = await httpService.get<any>('/rector/cursos');
    const raw = (res as any)?.data ?? res;
    const arr = raw?.data ?? raw?.cursos ?? (Array.isArray(raw) ? raw : []);
    return { success: raw?.success !== false, data: Array.isArray(arr) ? arr : [], message: raw?.message, status: (res as any)?.status };
  }

  // Cambiar contraseña
  async cambiarContrasena(data: any) {
    return await httpService.post('/auth/cambiar-contrasena', data);
  }

  // Carga masiva
  async validarExcel(archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return await httpService.post('/carga/validar-excel', formData);
  }

  async cargaMasivaEstudiantes(archivo: File, cursoId: number) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('cursoId', cursoId.toString());
    return await httpService.post('/carga/estudiantes', formData);
  }

  async cargaMasivaDual(archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return await httpService.post('/estudiantes/carga-masiva-completa', formData);
  }

  // Notificaciones
  async registrarTokenFCM(tokenFcm: string) {
    return await httpService.post('/notificaciones/token', { tokenFcm });
  }

  // Coordinadores
  async getCursosCoordinador() {
    return await httpService.get('/coordinadores/cursos');
  }

  async getCursosConEstudiantesCoordinador() {
    return await httpService.get('/coordinadores/cursos-con-estudiantes');
  }

  // Orientadores
  async crearOrientador(data: any) {
    const res = await httpService.post<any>('/orientadores', data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, passwordTemporal: (raw as any)?.passwordTemporal, status: (res as any)?.status };
  }

  async getAlertasCoordinador() {
    return await httpService.get('/coordinadores/alertas');
  }

  async getDocentesCoordinador() {
    return await httpService.get('/coordinadores/docentes');
  }

  async getOrientadoresCoordinador() {
    return await httpService.get('/coordinadores/orientadores');
  }

  async getRendimientoCurso(cursoId: number) {
    return await httpService.get(`/coordinadores/cursos/${cursoId}/rendimiento`);
  }

  // Orientadores
  async getOrientadores() {
    return await httpService.get('/orientadores');
  }

  async getOrientador(id: number) {
    return await httpService.get(`/orientadores/${id}`);
  }

  async crearOrientadorCoordinador(data: any) {
    const res = await httpService.post<any>('/coordinadores/orientadores', data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, passwordTemporal: (raw as any)?.passwordTemporal, status: (res as any)?.status };
  }

  async actualizarOrientadorCoordinador(id: number, data: any) {
    const res = await httpService.put<any>(`/coordinadores/orientadores/${id}`, data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async eliminarOrientadorCoordinador(id: number) {
    const res = await httpService.delete<any>(`/coordinadores/orientadores/${id}`);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async getAcudientesCoordinador() {
    return await httpService.get('/coordinadores/acudientes');
  }

  async getAcudientesOrientador() {
    return await httpService.get('/orientadores/acudientes');
  }

  async getAcudientesEstudiante(estudianteId: number) {
    return await httpService.get(`/estudiantes/${estudianteId}/acudientes`);
  }

  // Estudiantes
  async createEstudiante(data: any) {
    const res = await httpService.post<any>('/estudiantes', data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async updateEstudiante(id: number, data: any) {
    const res = await httpService.put<any>(`/estudiantes/${id}`, data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async deleteEstudiante(id: number) {
    const res = await httpService.delete<any>(`/estudiantes/${id}`);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async cambiarCursoEstudiante(estudianteId: number, data: any) {
    return await httpService.post(`/estudiantes/${estudianteId}/cambiar-curso`, data);
  }

  async retirarEstudiante(estudianteId: number, data: any) {
    return await httpService.post(`/estudiantes/${estudianteId}/retirar`, data);
  }

  async getHistorialEstudiante(estudianteId: number) {
    return await httpService.get(`/estudiantes/${estudianteId}/historial`);
  }

  // Reportes
  async getReporteEntregasCurso(cursoId: number, periodo?: number) {
    const url = periodo ? `/reportes/cursos/${cursoId}/entregas?periodo=${periodo}` : `/reportes/cursos/${cursoId}/entregas`;
    return await httpService.get(url);
  }

  async getReporteCalificacionesCurso(cursoId: number, periodo?: number) {
    const url = periodo ? `/reportes/cursos/${cursoId}/calificaciones?periodo=${periodo}` : `/reportes/cursos/${cursoId}/calificaciones`;
    return await httpService.get(url);
  }

  async getResumenInstitucional() {
    return await httpService.get('/reportes/institucion/resumen');
  }

  // Docentes
  async getDocentes() {
    return await httpService.get('/docentes');
  }

  async getDocenteById(id: number) {
    return await httpService.get(`/docentes/${id}`);
  }

  async createDocente(data: any) {
    return await httpService.post('/docentes', data);
  }

  async createDocenteOrientador(data: any) {
    return await httpService.post('/orientadores/docentes', data);
  }

  async updateDocente(id: number, data: any) {
    return await httpService.put(`/docentes/${id}`, data);
  }

  async deleteDocente(id: number) {
    return await httpService.delete(`/docentes/${id}`);
  }

  // Cursos
  async getCursos() {
    return await httpService.get('/cursos');
  }

  async getCursoById(id: number) {
    return await httpService.get(`/cursos/${id}`);
  }

  async createCurso(data: any) {
    return await httpService.post('/cursos', data);
  }

  async updateCurso(id: number, data: any) {
    return await httpService.put(`/cursos/${id}`, data);
  }

  async deleteCurso(id: number) {
    return await httpService.delete(`/cursos/${id}`);
  }

  // Grados
  async getGrados() {
    return await httpService.get('/grados');
  }

  async getGradosCoordinador() {
    return await httpService.get('/coordinadores/grados');
  }

  async getGradoById(id: number) {
    return await httpService.get(`/grados/${id}`);
  }

  async createGrado(data: any) {
    const res = await httpService.post<any>('/grados', data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async updateGrado(id: number, data: any) {
    const res = await httpService.put<any>(`/grados/${id}`, data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async deleteGrado(id: number) {
    const res = await httpService.delete<any>(`/grados/${id}`);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  // Vincular acudiente
  async vincularAcudiente(estudianteId: number, data: any) {
    return await httpService.post(`/estudiantes/${estudianteId}/acudientes`, data);
  }

  async updateVinculoAcudiente(estudianteId: number, acudienteId: number, data: any) {
    return await httpService.put(`/estudiantes/${estudianteId}/acudientes/${acudienteId}`, data);
  }

  async desvincularAcudiente(estudianteId: number, acudienteId: number) {
    return await httpService.delete(`/estudiantes/${estudianteId}/acudientes/${acudienteId}`);
  }

  // Periodos
  async getPeriodos(institucionId?: number) {
    const rolId = getSessionRolId();
    const isRector = rolId === 2;
    const endpoint = isRector ? '/rectores/periodos' : '/periodos';
    const params = !isRector && institucionId ? { institucionid: institucionId } : undefined;
    const res = await httpService.get<any>(endpoint, params);
    const raw = (res as any)?.data ?? res;
    const data = raw?.data ?? raw?.periodos ?? (Array.isArray(raw) ? raw : []);
    return { success: raw?.success !== false, data: Array.isArray(data) ? data : [], message: raw?.message, status: (res as any)?.status };
  }

  async createPeriodo(data: any) {
    const rolId = getSessionRolId();
    const isRector = rolId === 2;
    const endpoint = isRector ? '/rectores/periodos' : '/periodos';
    const res = await httpService.post<any>(endpoint, data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async updatePeriodo(id: number, data: any) {
    const rolId = getSessionRolId();
    const isRector = rolId === 2;
    const endpoint = isRector ? `/rectores/periodos/${id}` : `/periodos/${id}`;
    const res = await httpService.put<any>(endpoint, data);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  async deletePeriodo(id: number) {
    const rolId = getSessionRolId();
    const isRector = rolId === 2;
    const endpoint = isRector ? `/rectores/periodos/${id}` : `/periodos/${id}`;
    const res = await httpService.delete<any>(endpoint);
    const raw = (res as any)?.data ?? res;
    return { success: raw?.success !== false, data: raw?.data ?? raw, message: raw?.message, status: (res as any)?.status };
  }

  // Coordinadores - Personal y datos institucionales
  async getMiInstitucion() {
    return await httpService.get('/coordinadores/mi-institucion');
  }


  async getEstudiantesCoordinador(params?: { page?: number; perPage?: number; gradoId?: number; cursoId?: number; search?: string }) {
    return await httpService.get('/coordinadores/estudiantes', params as any);
  }
}

export default new ApiClient();
