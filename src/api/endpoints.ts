// ============================================
// API ENDPOINTS - Cátedra de Familia
// Usar apiClient centralizado para llamadas HTTP
// ============================================

import apiClient from './apiClient';
import { isBypassValidationsEnabled } from '../utils/dev';
import { 
  usuariosMock,
  usuariosListMock,
  estudiantesMock,
  estudiantesAcudientesMock,
  tareasMock, 
  entregasMock, 
  categoriasMock,
  cursosMock,
  institucionesMock,
  departamentosMock,
  municipiosMock,
  periodosMock,
  gradosMock,
  notificacionesMock,
  logsAuditoriaMock,
  type Usuario,
  type Estudiante,
  type EstudianteAcudiente,
  type Tarea,
  type Entrega,
  type Categoria,
  type Curso,
  type Institucion,
  type Departamento,
  type Municipio,
  type Periodo,
  type Grado,
  type Notificacion,
  type LogAuditoria,
  type RolUsuario
} from '../mocks/data';

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Función auxiliar para auditoría - definida temprano para uso en todo el archivo
const addLogAuditoria = (accion: 'crear' | 'actualizar' | 'eliminar' | 'login' | 'logout', entidad: string, entidadId: number, detalles: string) => {
  const session = localStorage.getItem('session');
  const userId = session ? JSON.parse(session)?.user?.id || 0 : 0;
  logsAuditoriaMock.push({
    id: Date.now(),
    accion,
    entidad,
    entidadId,
    usuarioId: userId,
    detalles,
    fecha: new Date().toISOString()
  });
};

// ============================================
// AUTENTICACIÓN
// ============================================

export const login = async (correo: string, password: string, roleHint?: 'admin' | 'rector' | 'coordinador'): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
  // Si está en modo desarrollo o bypass, usar mocks
  if (isBypassValidationsEnabled()) {
    await delay(800);
    
    // Mock: determinar rol basado en correo
    let user: Usuario | undefined;
    const correoLower = correo.toLowerCase();

    // Tratar dominios institucionales de Secretaría como admin
    if (correoLower.endsWith('@educacionpopayan.gov.co') || correoLower.endsWith('@secretariaed.gov.co') || correo.includes('@admin')) {
      user = usuariosMock.admin;
    } else if (correo.includes('@docente')) {
      // Verificar tipo de docente
      if (correo.includes('orientador')) {
        user = usuariosMock.orientador;
      } else if (correo.includes('coordinador')) {
        user = usuariosMock.coordinador;
      } else if (correo.includes('rector')) {
        user = usuariosMock.rector;
      } else {
        user = usuariosMock.docente;
      }
    } else {
      user = usuariosMock.acudiente;
    }

    if (user) {
      // Guardar sesión en localStorage
      localStorage.setItem('session', JSON.stringify({ user, isPreview: false }));
      return { success: true, user };
    }
    
    return { success: false, error: 'Credenciales incorrectas' };
  }
  
  // Detectar roleHint automáticamente si no se proporciona
  if (!roleHint) {
    const correoLower = correo.toLowerCase();
    
    // Admin: dominios gubernamentales
    if (correoLower.endsWith('@educacionpopayan.gov.co') || correoLower.endsWith('@secretariaed.gov.co')) {
      roleHint = 'admin';
    }
    // Coordinador: intentar primero (es más común)
    else if (correo.includes('.edu.co')) {
      roleHint = 'coordinador';
    }
  }
  
  // Usar API real con detección inteligente de tipo de usuario
  try {
    const result = await apiClient.login(correo, password, roleHint);
    if (result.success && result.data) {
      // Mapear rolId a nombre de rol
      const ROLES_MAP: Record<number, RolUsuario> = {
        1: 'admin_sistema',
        2: 'rector',
        3: 'coordinador',
        4: 'orientador',
        5: 'docente_aula',
        6: 'acudiente'
      };
      
      const rolNombre = ROLES_MAP[result.data.usuario.rolId] || 'admin_sistema';
      
      // Convertir respuesta del backend al formato esperado por el frontend
      const user: Usuario = {
        id: result.data.usuario.id,
        nombre: result.data.usuario.nombre || 'Usuario',
        apellidos: result.data.usuario.apellido || '',
        correo: result.data.usuario.correo,
        telefono: '',
        rol: rolNombre,
        activo: result.data.usuario.estaActivo,
        debe_cambiar_contrasena: result.data.usuario.debeCambiarContrasena,
        institucionId: result.data.usuario.institucionId
      };
      return { success: true, user };
    }
    return { success: false, error: result.message || 'Credenciales incorrectas' };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error de conexión'
    };
  }
};

export const logout = async (): Promise<void> => {
  if (isBypassValidationsEnabled()) {
    await delay(300);
    localStorage.removeItem('session');
    localStorage.removeItem('previewRole');
    return;
  }
  
  // Usar API real
  await apiClient.logout();
};

export const getSession = (): { user: Usuario; isPreview: boolean } | null => {
  const session = localStorage.getItem('session');
  if (session) {
    return JSON.parse(session);
  }
  
  // Verificar si hay modo preview
  const previewRole = localStorage.getItem('previewRole');
  if (previewRole) {
    const user = usuariosMock[previewRole as keyof typeof usuariosMock];
    if (user) {
      return { user, isPreview: true };
    }
  }
  
  return null;
};

export const setPreviewRole = (role: string): Usuario | null => {
  const user = usuariosMock[role as keyof typeof usuariosMock];
  if (user) {
    localStorage.setItem('previewRole', role);
    localStorage.setItem('session', JSON.stringify({ user, isPreview: true }));
    return user;
  }
  return null;
};

// ============================================
// REGISTRO
// ============================================

export const registrarAcudiente = async (data: any): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
  await delay(1000);
  
  // Guardar en localStorage temporalmente
  const acudientes = JSON.parse(localStorage.getItem('acudientes') || '[]');
  const newUser: Usuario = {
    id: Date.now(),
    nombre: data.nombres,
    apellidos: data.apellidos,
    correo: data.correo,
    rol: 'acudiente',
    telefono: data.telefono,
    activo: true,
  };
  acudientes.push({ ...data, ...newUser });
  localStorage.setItem('acudientes', JSON.stringify(acudientes));
  
  return { success: true, user: newUser };
};

export const registrarDocente = async (data: any): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
  await delay(1000);
  
  const docentes = JSON.parse(localStorage.getItem('docentes') || '[]');
  const newUser: Usuario = {
    id: Date.now(),
    nombre: data.nombres,
    apellidos: data.apellidos,
    correo: data.correo,
    rol: data.rol || 'docente_aula',
    telefono: data.telefono,
    institucion: data.institucion,
    activo: true,
  };
  docentes.push({ ...data, ...newUser });
  localStorage.setItem('docentes', JSON.stringify(docentes));
  
  return { success: true, user: newUser };
};

// ============================================
// CREAR RECTOR Y COORDINADOR (Admin Sistema)
// ============================================

export const crearRector = async (data: {
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  institucionId: number;
}): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
  // Si está en modo bypass, usar mock
  if (isBypassValidationsEnabled()) {
    await delay(1000);
    const newUser: Usuario = {
      id: Date.now(),
      nombre: data.nombre,
      apellidos: data.apellido,
      correo: data.correo,
      rol: 'rector',
      telefono: data.telefono,
      institucionId: data.institucionId,
      activo: true,
      debe_cambiar_contrasena: true
    };
    usuariosListMock.push(newUser);
    addLogAuditoria('crear', 'rector', newUser.id, `Rector creado: ${data.nombre} ${data.apellido}`);
    return { success: true, user: newUser };
  }
  
  // Usar API real
  const result = await apiClient.crearRector(data);
  if (result.success && result.data?.rector) {
    const user: Usuario = {
      id: result.data.usuario.id,
      nombre: result.data.rector.nombre,
      apellidos: result.data.rector.apellido,
      correo: result.data.usuario.correo,
      rol: 'rector',
      telefono: result.data.rector.telefono,
      institucionId: result.data.rector.institucionId,
      activo: true,
      debe_cambiar_contrasena: result.data.usuario.debeCambiarContrasena
    };
    return { success: true, user };
  }
  return { success: false, error: result.message };
};

export const crearCoordinador = async (data: {
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  institucionId?: number;
  documento?: string;
  tipoDocumento?: 'CC' | 'TI' | 'CE';
}): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
  // Si está en modo bypass, usar mock
  if (isBypassValidationsEnabled()) {
    await delay(1000);
    const session = getSession();
    const institucionIdFinal = data.institucionId || session?.user?.institucionId || 1;
    
    const newUser: Usuario = {
      id: Date.now(),
      nombre: data.nombre,
      apellidos: data.apellido,
      correo: data.correo,
      rol: 'coordinador',
      telefono: data.telefono,
      documento: data.documento,
      tipoDocumento: data.tipoDocumento,
      institucionId: institucionIdFinal,
      activo: true,
      debe_cambiar_contrasena: true
    };
    usuariosListMock.push(newUser);
    addLogAuditoria('crear', 'coordinador', newUser.id, `Coordinador creado: ${data.nombre} ${data.apellido}`);
    return { success: true, user: newUser };
  }
  
  // Usar API real - apiClient determina qué endpoint usar según el rol
  const result = await apiClient.crearCoordinador(data);
  if (result.success && result.data?.coordinador) {
    const user: Usuario = {
      id: result.data.usuario.id,
      nombre: result.data.coordinador.nombre,
      apellidos: result.data.coordinador.apellido,
      correo: result.data.usuario.correo,
      rol: 'coordinador',
      telefono: result.data.coordinador.telefono,
      documento: (result.data.coordinador as any).documento,
      tipoDocumento: (result.data.coordinador as any).tipoDocumento,
      institucionId: result.data.coordinador.institucionId,
      activo: true,
      debe_cambiar_contrasena: result.data.usuario.debeCambiarContrasena
    };
    return { success: true, user };
  }
  return { success: false, error: result.message };
};

/**
 * Crear coordinador específicamente como Admin (en cualquier institución)
 */
export const crearCoordinadorAdmin = async (data: {
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  institucionId: number;
}): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
  if (isBypassValidationsEnabled()) {
    return crearCoordinador(data);
  }
  
  const result = await apiClient.crearCoordinadorAdmin(data);
  if (result.success && result.data?.coordinador) {
    const user: Usuario = {
      id: result.data.usuario.id,
      nombre: result.data.coordinador.nombre,
      apellidos: result.data.coordinador.apellido,
      correo: result.data.usuario.correo,
      rol: 'coordinador',
      telefono: result.data.coordinador.telefono,
      institucionId: result.data.coordinador.institucionId,
      activo: true,
      debe_cambiar_contrasena: result.data.usuario.debeCambiarContrasena
    };
    return { success: true, user };
  }
  return { success: false, error: result.message };
};

/**
 * Crear coordinador específicamente como Rector (solo en su institución)
 */
export const crearCoordinadorRector = async (data: {
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono: string;
  documento?: string;
  tipoDocumento?: 'CC' | 'TI' | 'CE';
}): Promise<{ success: boolean; user?: Usuario; error?: string; institucionNombre?: string }> => {
  if (isBypassValidationsEnabled()) {
    return crearCoordinador(data);
  }
  
  const result = await apiClient.crearCoordinadorRector(data);
  if (result.success && result.data?.coordinador) {
    const user: Usuario = {
      id: result.data.usuario.id,
      nombre: result.data.coordinador.nombre,
      apellidos: result.data.coordinador.apellido,
      correo: result.data.usuario.correo,
      rol: 'coordinador',
      telefono: result.data.coordinador.telefono,
      documento: (result.data.coordinador as any).documento,
      tipoDocumento: (result.data.coordinador as any).tipoDocumento,
      institucionId: result.data.coordinador.institucionId,
      activo: true,
      debe_cambiar_contrasena: result.data.usuario.debeCambiarContrasena
    };
    return { 
      success: true, 
      user,
      institucionNombre: (result.data.coordinador as any).institucionNombre
    };
  }
  return { success: false, error: result.message };
};

// ============================================
// TAREAS
// ============================================

export const getTareas = async (cursoId?: number, busqueda?: string): Promise<Tarea[]> => {
  try {
    const result = await apiClient.getTareas();
    if (result.success && result.data) {
      let tareas = result.data.map((t: any) => ({
        id: t.id,
        titulo: t.titulo || t.nombre || '',
        descripcion: t.descripcion || '',
        categoriaId: t.categoriaId || t.categoria_id,
        frecuencia: t.frecuencia || 'semanal',
        fechaInicio: t.fechaInicio || t.fecha_inicio || '',
        fechaVencimiento: t.fechaVencimiento || t.fecha_vencimiento || t.fechaLimite || t.fecha_limite || '',
        cursoId: t.cursoId || t.curso_id,
        docenteId: t.docenteId || t.docente_id,
        periodoId: t.periodoId || t.periodo_id,
        incluyeEnBoletin: t.incluyeEnBoletin ?? t.incluye_en_boletin ?? true,
        estado: t.estado || 'activa',
        createdAt: t.createdAt || t.created_at || ''
      }));
      
      if (cursoId) {
        tareas = tareas.filter((t: Tarea) => t.cursoId === cursoId);
      }
      
      if (busqueda) {
        const searchLower = busqueda.toLowerCase();
        tareas = tareas.filter((t: Tarea) => 
          t.titulo.toLowerCase().includes(searchLower) ||
          t.descripcion.toLowerCase().includes(searchLower)
        );
      }
      
      return tareas;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return [];
  }
};

export const getTareaById = async (id: number): Promise<Tarea | null> => {
  try {
    const result = await apiClient.getTareas();
    if (result.success && result.data) {
      const tarea = result.data.find((t: any) => t.id === id);
      if (tarea) {
        return {
          id: tarea.id,
          titulo: tarea.titulo || tarea.nombre || '',
          descripcion: tarea.descripcion || '',
          categoriaId: tarea.categoriaId || tarea.categoria_id,
          frecuencia: tarea.frecuencia || 'semanal',
          fechaInicio: tarea.fechaInicio || tarea.fecha_inicio || '',
          fechaVencimiento: tarea.fechaVencimiento || tarea.fecha_vencimiento || tarea.fechaLimite || tarea.fecha_limite || '',
          cursoId: tarea.cursoId || tarea.curso_id,
          docenteId: tarea.docenteId || tarea.docente_id,
          periodoId: tarea.periodoId || tarea.periodo_id,
          incluyeEnBoletin: tarea.incluyeEnBoletin ?? tarea.incluye_en_boletin ?? true,
          estado: tarea.estado || 'activa',
          createdAt: tarea.createdAt || tarea.created_at || ''
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    return null;
  }
};

export const createTarea = async (data: Partial<Tarea>): Promise<{ success: boolean; tarea?: Tarea; error?: string }> => {
  await delay(800);
  
  // Validar multitenancy: docente y curso deben ser de la misma institución
  const curso = cursosMock.find(c => c.id === data.cursoId);
  const docente = usuariosListMock.find(u => u.id === data.docenteId);
  
  if (curso && docente && docente.institucionId && curso.institucionId !== docente.institucionId) {
    return { success: false, error: 'No puede crear tareas para cursos de otra institución' };
  }
  
  const newTarea: Tarea = {
    id: Date.now(),
    titulo: data.titulo || '',
    descripcion: data.descripcion || '',
    categoriaId: data.categoriaId || 1,
    frecuencia: data.frecuencia || 'semanal',
    fechaInicio: data.fechaInicio || new Date().toISOString().split('T')[0],
    fechaVencimiento: data.fechaVencimiento || '',
    cursoId: data.cursoId || 1,
    docenteId: data.docenteId || 2,
    periodoId: data.periodoId,
    incluyeEnBoletin: data.incluyeEnBoletin ?? true,
    estado: 'activa',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  tareasMock.push(newTarea);
  addLogAuditoria('crear', 'Tarea', newTarea.id, `Tarea creada: ${newTarea.titulo}`);
  
  // Enviar notificaciones a acudientes del curso
  const estudiantes = estudiantesMock.filter(e => e.cursoId === data.cursoId);
  const acudientesIds = new Set<number>();
  estudiantes.forEach(e => {
    const vinculos = estudiantesAcudientesMock.filter(v => v.estudianteId === e.id);
    vinculos.forEach(v => acudientesIds.add(v.acudienteId));
  });
  
  acudientesIds.forEach(acudienteId => {
    enviarNotificacion({
      tipo: 'tarea_nueva',
      titulo: 'Nueva tarea asignada',
      mensaje: `Se ha asignado la tarea "${newTarea.titulo}"`,
      destinatarioId: acudienteId,
      tareaId: newTarea.id
    });
  });
  
  return { success: true, tarea: newTarea };
};

export const getTareasPendientesAcudiente = async (_acudienteId: number): Promise<Tarea[]> => {
  try {
    // Por ahora retornar tareas activas - cuando el backend tenga el endpoint de vínculos 
    // se implementará la lógica completa
    const tareas = await getTareas();
    return tareas.filter(t => t.estado === 'activa');
  } catch (error) {
    console.error('Error al obtener tareas pendientes del acudiente:', error);
    return [];
  }
};

export const getTareasByDocente = async (docenteId: number): Promise<Tarea[]> => {
  try {
    const tareas = await getTareas();
    return tareas.filter(t => t.docenteId === docenteId);
  } catch (error) {
    console.error('Error al obtener tareas del docente:', error);
    return [];
  }
};

export const getEntregasPendientesCalificar = async (docenteId: number): Promise<Entrega[]> => {
  await delay(500);
  
  // Obtener tareas del docente
  const tareasDocente = tareasMock.filter(t => t.docenteId === docenteId);
  const tareaIds = tareasDocente.map(t => t.id);
  
  // Obtener entregas de esas tareas que están pendientes de calificar
  return entregasMock.filter(e => 
    tareaIds.includes(e.tareaId) && 
    e.estado === 'enviada'
  );
};

// ============================================
// ENTREGAS
// ============================================

export const getEntregas = async (_docenteId?: number): Promise<Entrega[]> => {
  await delay(500);
  // En producción filtrar por tareas del docente
  return entregasMock;
};

export const getEntregasByTarea = async (tareaId: number): Promise<Entrega[]> => {
  await delay(500);
  return entregasMock.filter(e => e.tareaId === tareaId);
};

export const getEntregasByAcudiente = async (acudienteId: number): Promise<Entrega[]> => {
  await delay(500);
  return entregasMock.filter(e => e.acudienteId === acudienteId);
};

export const enviarEvidencia = async (data: { 
  tareaId: number; 
  estudianteId: number;
  acudienteId: number;
  textoEvidencia: string; 
  archivos: string[] 
}): Promise<Entrega> => {
  await delay(1000);
  
  const newEntrega: Entrega = {
    id: Date.now(),
    tareaId: data.tareaId,
    estudianteId: data.estudianteId,
    acudienteId: data.acudienteId,
    textoEvidencia: data.textoEvidencia,
    archivos: data.archivos,
    fechaEntrega: new Date().toISOString().split('T')[0],
    estado: 'enviada'
  };
  
  console.log('Mock: Evidencia enviada', newEntrega);
  entregasMock.push(newEntrega);
  
  return newEntrega;
};

export const calificarEntrega = async (
  entregaId: number, 
  data: { calificacion: number | string; retroalimentacion: string; tipoCalificacion?: 'numerica' | 'cualitativa' }
): Promise<Entrega> => {
  await delay(800);
  
  const entrega = entregasMock.find(e => e.id === entregaId);
  if (entrega) {
    entrega.calificacion = data.calificacion;
    entrega.retroalimentacion = data.retroalimentacion;
    entrega.tipoCalificacion = data.tipoCalificacion || 'numerica';
    entrega.estado = 'calificada';
    
    addLogAuditoria('actualizar', 'Entrega', entregaId, `Entrega calificada: ${data.calificacion}`);
    
    // Enviar notificación al acudiente
    enviarNotificacion({
      tipo: 'entrega_calificada',
      titulo: 'Entrega calificada',
      mensaje: `Tu entrega ha sido calificada con ${data.calificacion}`,
      destinatarioId: entrega.acudienteId,
      tareaId: entrega.tareaId
    });
  }
  
  console.log('Mock: Entrega calificada', entrega);
  return entrega!;
};

// ============================================
// CATEGORÍAS
// ============================================
// CATEGORÍAS - CONSUMO DESDE BACKEND
// ============================================

export const getCategorias = async (institucionId?: number): Promise<Categoria[]> => {
  try {
    const result = await apiClient.getCategorias();
    if (result.success && result.data) {
      let categorias = result.data.map((c: any) => ({
        id: c.id,
        nombre: c.nombre || '',
        color: c.color || '#3B82F6',
        icono: c.icono || '📚',
        institucionId: c.institucionId || c.institucion_id
      }));
      
      if (institucionId) {
        categorias = categorias.filter((c: Categoria) => !c.institucionId || c.institucionId === institucionId);
      }
      
      return categorias;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return [];
  }
};

// === DEPARTAMENTOS ===
export const getDepartamentos = async (): Promise<Departamento[]> => {
  await delay(200);
  return departamentosMock;
};

// === MUNICIPIOS ===
export const getMunicipios = async (departamentoId?: number): Promise<Municipio[]> => {
  await delay(200);
  
  if (departamentoId) {
    return municipiosMock.filter(m => m.departamento_id === departamentoId);
  }
  
  return municipiosMock;
};

export const createCategoria = async (data: Partial<Categoria>): Promise<{ success: boolean; categoria?: Categoria; error?: string }> => {
  await delay(500);
  
  // Validar nombre único
  if (categoriasMock.some(c => c.nombre.toLowerCase() === data.nombre?.toLowerCase())) {
    return { success: false, error: 'Ya existe una categoría con ese nombre' };
  }
  
  const newCategoria: Categoria = {
    id: Date.now(),
    nombre: data.nombre || '',
    color: data.color || '#3B82F6',
    icono: data.icono || '📚',
    institucionId: data.institucionId
  };
  
  categoriasMock.push(newCategoria);
  addLogAuditoria('crear', 'Categoria', newCategoria.id, `Categoría creada: ${newCategoria.nombre}`);
  
  return { success: true, categoria: newCategoria };
};

export const updateCategoria = async (id: number, data: Partial<Categoria>): Promise<{ success: boolean; categoria?: Categoria; error?: string }> => {
  await delay(500);
  
  const categoria = categoriasMock.find(c => c.id === id);
  if (!categoria) {
    return { success: false, error: 'Categoría no encontrada' };
  }
  
  // Validar nombre único (excepto la misma categoría)
  if (data.nombre && categoriasMock.some(c => c.id !== id && c.nombre.toLowerCase() === data.nombre.toLowerCase())) {
    return { success: false, error: 'Ya existe una categoría con ese nombre' };
  }
  
  Object.assign(categoria, data);
  addLogAuditoria('actualizar', 'Categoria', id, `Categoría actualizada: ${categoria.nombre}`);
  
  return { success: true, categoria };
};

export const deleteCategoria = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(400);
  
  // Verificar que no esté en uso
  const enUso = tareasMock.some(t => t.categoriaId === id);
  if (enUso) {
    return { success: false, error: 'No se puede eliminar: hay tareas usando esta categoría' };
  }
  
  const index = categoriasMock.findIndex(c => c.id === id);
  if (index === -1) {
    return { success: false, error: 'Categoría no encontrada' };
  }
  
  categoriasMock.splice(index, 1);
  addLogAuditoria('eliminar', 'Categoria', id, 'Categoría eliminada');
  
  return { success: true };
};

// ============================================
// INSTITUCIONES - CONSUMO DESDE BACKEND
// ============================================

export const getInstituciones = async (): Promise<Institucion[]> => {
  // Verificar si hay sesión con token real (no preview)
  const session = getSession();
  if (!session?.token || session.isPreview) {
    // En modo preview o sin token, retornar mock
    return institucionesMock.filter(i => !i.eliminado_en);
  }

  try {
    // Usar endpoint público /instituciones (NO /admin/instituciones/pendientes)
    const result = await apiClient.getInstituciones();
    if (result.success && result.data) {
      // Mapear datos del backend al formato del frontend
      return result.data.map((inst: any) => ({
        id: inst.id,
        nombre: inst.nombre,
        codigo_dane: inst.codigoDane || inst.codigo_dane,
        nit: inst.nit,
        naturaleza: inst.naturaleza || 'publica',
        municipio_id: inst.municipioId || inst.municipio_id,
        municipio: inst.municipio?.nombre || '',
        departamento: inst.municipio?.departamento?.nombre || '',
        telefono_principal: inst.telefonoPrincipal || inst.telefono_principal || inst.telefono || '',
        correo_institucional: inst.correoInstitucional || inst.correo_institucional || inst.correo || '',
        direccion_completa: inst.direccionCompleta || inst.direccion_completa || inst.direccion || '',
        rector_nombre: inst.rectorNombre || inst.rector_nombre || '',
        rector_documento: inst.rectorDocumento || inst.rector_documento || '',
        rector_telefono: inst.rectorTelefono || inst.rector_telefono || '',
        activo: inst.activo !== false,
        aprobado: inst.aprobado || false,
        creado_en: inst.creadoEn || inst.creado_en
      }));
    }
    // Si falla la API, usar mock como fallback
    return institucionesMock.filter(i => !i.eliminado_en);
  } catch (error) {
    console.error('Error al obtener instituciones:', error);
    // Fallback a mock
    return institucionesMock.filter(i => !i.eliminado_en);
  }
};

export const getInstitucionById = async (id: number): Promise<Institucion | null> => {
  try {
    const result = await apiClient.getInstitucionById(id);
    if (result.success && result.data) {
      const inst = result.data;
      return {
        id: inst.id,
        nombre: inst.nombre,
        codigo_dane: inst.codigoDane || inst.codigo_dane,
        nit: inst.nit,
        naturaleza: inst.naturaleza || 'publica',
        municipio_id: inst.municipioId || inst.municipio_id,
        municipio: inst.municipio?.nombre || '',
        departamento: inst.municipio?.departamento?.nombre || '',
        telefono_principal: inst.telefonoPrincipal || inst.telefono_principal || inst.telefono || '',
        correo_institucional: inst.correoInstitucional || inst.correo_institucional || inst.correo || '',
        direccion_completa: inst.direccionCompleta || inst.direccion_completa || inst.direccion || '',
        rector_nombre: inst.rectorNombre || inst.rector_nombre || '',
        rector_documento: inst.rectorDocumento || inst.rector_documento || '',
        rector_telefono: inst.rectorTelefono || inst.rector_telefono || '',
        activo: inst.activo !== false,
        aprobado: inst.aprobado || false,
        creado_en: inst.creadoEn || inst.creado_en
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener institución por ID:', error);
    return null;
  }
};

export const createInstitucion = async (data: Partial<Institucion>): Promise<{ success: boolean; institucion?: Institucion; error?: string }> => {
  // Transformar datos de snake_case a camelCase para el backend
  const backendData = {
    nombre: data.nombre,
    codigoDane: data.codigo_dane,
    nit: data.nit,
    naturaleza: data.naturaleza,
    municipioId: data.municipio_id,
    telefonoPrincipal: data.telefono_principal,
    correoInstitucional: data.correo_institucional,
    direccionCompleta: data.direccion_completa,
    rectorNombre: data.rector_nombre,
    rectorDocumento: data.rector_documento,
    rectorTelefono: data.rector_telefono
  };
  
  // Usar API real del backend
  const result = await apiClient.createInstitucion(backendData);
  
  if (result.success && result.data) {
    return { 
      success: true, 
      institucion: result.data as Institucion 
    };
  }
  
  return { 
    success: false, 
    error: result.message || 'Error al crear la institución' 
  };
};

export const getNotificacionesPorTarea = async (tareaId: number): Promise<Notificacion[]> => {
  await delay(300);
  return notificacionesMock.filter(n => n.tareaId === tareaId);
};

export const enviarNotificacion = async (data: Partial<Notificacion>): Promise<{ success: boolean; notificacion?: Notificacion }> => {
  await delay(500);
  const newNotificacion: Notificacion = {
    id: Date.now(),
    tipo: data.tipo || 'general',
    titulo: data.titulo || '',
    mensaje: data.mensaje || '',
    destinatarioId: data.destinatarioId || 0,
    tareaId: data.tareaId,
    leida: false,
    fechaCreacion: new Date().toISOString()
  };
  notificacionesMock.push(newNotificacion);
  return { success: true, notificacion: newNotificacion };
};

export const marcarNotificacionLeida = async (id: number): Promise<{ success: boolean }> => {
  await delay(200);
  const notif = notificacionesMock.find(n => n.id === id);
  if (notif) {
    notif.leida = true;
  }
  return { success: true };
};

// ============================================
// AUDITORÍA
// ============================================

export const getLogsAuditoria = async (filtros?: { 
  entidad?: string; 
  accion?: string; 
  usuarioId?: number;
  desde?: string;
  hasta?: string;
}): Promise<LogAuditoria[]> => {
  await delay(600);
  
  let logs = [...logsAuditoriaMock];
  
  if (filtros?.entidad) {
    logs = logs.filter(l => l.entidad === filtros.entidad);
  }
  if (filtros?.accion) {
    logs = logs.filter(l => l.accion === filtros.accion);
  }
  if (filtros?.usuarioId) {
    logs = logs.filter(l => l.usuarioId === filtros.usuarioId);
  }
  if (filtros?.desde) {
    logs = logs.filter(l => l.fecha >= filtros.desde!);
  }
  if (filtros?.hasta) {
    logs = logs.filter(l => l.fecha <= filtros.hasta!);
  }
  
  return logs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

export const getEstadisticasDocente = async (docenteId: number) => {
  try {
    const tareas = await getTareas();
    const tareasDocente = tareas.filter(t => t.docenteId === docenteId);
    
    return {
      tareasActivas: tareasDocente.filter(t => t.estado === 'activa').length,
      entregasPorRevisar: 0, // Se calculará cuando el endpoint de entregas esté disponible
      entregasCalificadas: 0,
      familiasTotales: 0,
      porcentajeParticipacion: 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del docente:', error);
    return {
      tareasActivas: 0,
      entregasPorRevisar: 0,
      entregasCalificadas: 0,
      familiasTotales: 0,
      porcentajeParticipacion: 0
    };
  }
};

export const getEstadisticasAcudiente = async (_acudienteId: number) => {
  try {
    return {
      tareasPendientes: 0,
      entregasRecientes: 0,
      promedioCalificacion: 0,
      estudiantes: 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas del acudiente:', error);
    return {
      tareasPendientes: 0,
      entregasRecientes: 0,
      promedioCalificacion: 0,
      estudiantes: 0
    };
  }
};

export const getEstadisticasInstitucion = async (institucionId: number) => {
  try {
    const [cursos, estudiantes, usuarios, tareas] = await Promise.all([
      getCursos(institucionId),
      getEstudiantes(institucionId),
      getUsuarios(),
      getTareas()
    ]);
    
    const docentesInstitucion = usuarios.filter(u => 
      u.institucionId === institucionId && 
      ['docente', 'docente_aula'].includes(u.rol)
    );
    
    return {
      docentesActivos: docentesInstitucion.length,
      estudiantesActivos: estudiantes.length,
      cursosActivos: cursos.length,
      tareasDelPeriodo: tareas.length,
      porcentajeParticipacion: 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de la institución:', error);
    return {
      docentesActivos: 0,
      estudiantesActivos: 0,
      cursosActivos: 0,
      tareasDelPeriodo: 0,
      porcentajeParticipacion: 0
    };
  }
};

// ============================================
// AUTENTICACIÓN AVANZADA
// ============================================

export const solicitarRecuperacionContrasena = async (correo: string): Promise<{ success: boolean; error?: string }> => {
  await delay(800);
  
  const usuario = usuariosListMock.find(u => u.correo === correo && !u.deletedAt);
  
  if (!usuario) {
    return { success: false, error: 'No existe un usuario con ese correo electrónico' };
  }
  
  // Simular envío de correo
  console.log(`📧 Correo de recuperación enviado a: ${correo}`);
  
  return { success: true };
};

export const cambiarContrasena = async (
  usuarioId: number, 
  contrasenaActual: string, 
  contrasenaNueva: string,
  confirmarContrasena?: string
): Promise<{ success: boolean; error?: string }> => {
  // Si está en modo bypass, usar mock
  if (isBypassValidationsEnabled()) {
    await delay(500);
    
    const usuario = usuariosListMock.find(u => u.id === usuarioId);
    
    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    // Verificar contraseña actual (en mock, la contraseña es el documento o '12345678')
    const contrasenaValida = contrasenaActual === usuario.documento || contrasenaActual === '12345678';
    
    if (!contrasenaValida) {
      return { success: false, error: 'La contraseña actual es incorrecta' };
    }
    
    // Cambiar contraseña (en mock solo marcamos que ya no debe cambiarla)
    usuario.debe_cambiar_contrasena = false;
    
    // Actualizar sesión
    const session = getSession();
    if (session && session.user.id === usuarioId) {
      session.user.debe_cambiar_contrasena = false;
      localStorage.setItem('session', JSON.stringify(session));
    }
    
    return { success: true };
  }
  
  // Usar API real
  const result = await apiClient.cambiarContrasena({
    contrasenaActual,
    contrasenaNueva,
    confirmarContrasena: confirmarContrasena || contrasenaNueva
  });
  
  if (result.success) {
    // Actualizar sesión local
    const session = getSession();
    if (session && session.user.id === usuarioId) {
      session.user.debe_cambiar_contrasena = false;
      localStorage.setItem('session', JSON.stringify(session));
    }
  }
  
  return { success: result.success, error: result.message };
};

// ============================================
// ESTADÍSTICAS RECTOR (Usa endpoint real)
// ============================================

export async function getEstadisticasRector(): Promise<any> {
  // Si está en modo bypass, calcular localmente
  if (isBypassValidationsEnabled()) {
    try {
      const [usuarios, instituciones] = await Promise.all([
        getUsuarios(),
        getInstituciones()
      ]);

      const coordinadores = usuarios.filter(u => u.rol === 'coordinador');
      const orientadores = usuarios.filter(u => u.rol === 'orientador');
      const docentes = usuarios.filter(u => u.rol === 'docente_aula');
      const personalActivo = usuarios.filter(u => u.activo);

      return {
        totalInstituciones: instituciones.length,
        institucionesActivas: instituciones.filter(i => i.activo).length,
        totalCoordinadores: coordinadores.length,
        coordinadoresActivos: coordinadores.filter(u => u.activo).length,
        totalOrientadores: orientadores.length,
        orientadoresActivos: orientadores.filter(u => u.activo).length,
        totalDocentes: docentes.length,
        docentesActivos: docentes.filter(u => u.activo).length,
        totalCursos: 0,
        totalEstudiantes: 0,
        totalPersonal: usuarios.length,
        personalActivo: personalActivo.length,
        tasaActivacion: usuarios.length > 0 
          ? Math.round((personalActivo.length / usuarios.length) * 100) 
          : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas (mock):', error);
      return getDefaultEstadisticas();
    }
  }

  // Usar API real
  try {
    const result = await apiClient.getEstadisticasRector();
    if (result.success && result.data) {
      return {
        ...result.data,
        // Agregar campos calculados para compatibilidad
        totalPersonal: (result.data.totalCoordinadores || 0) + 
                       (result.data.totalOrientadores || 0) + 
                       (result.data.totalDocentes || 0),
        personalActivo: (result.data.coordinadoresActivos || 0) + 
                        (result.data.orientadoresActivos || 0) + 
                        (result.data.docentesActivos || 0),
        tasaActivacion: calcularTasaActivacion(result.data)
      };
    }
    return getDefaultEstadisticas();
  } catch (error) {
    console.error('Error al obtener estadísticas del rector:', error);
    return getDefaultEstadisticas();
  }
}

// Función auxiliar para calcular tasa de activación
function calcularTasaActivacion(data: any): number {
  const total = (data.totalCoordinadores || 0) + (data.totalOrientadores || 0) + (data.totalDocentes || 0);
  const activos = (data.coordinadoresActivos || 0) + (data.orientadoresActivos || 0) + (data.docentesActivos || 0);
  return total > 0 ? Math.round((activos / total) * 100) : 0;
}

// Valores por defecto
function getDefaultEstadisticas() {
  return {
    totalInstituciones: 0,
    institucionesActivas: 0,
    totalCoordinadores: 0,
    coordinadoresActivos: 0,
    totalOrientadores: 0,
    orientadoresActivos: 0,
    totalDocentes: 0,
    docentesActivos: 0,
    totalCursos: 0,
    totalEstudiantes: 0,
    totalPersonal: 0,
    personalActivo: 0,
    tasaActivacion: 0
  };
}

// ============================================
// DIRECTIVOS DE INSTITUCIÓN (Usa endpoint real)
// ============================================

export async function getDirectivosInstitucion(institucionId: number): Promise<{
  coordinadores: any[];
  orientadores: any[];
}> {
  // Si está en modo bypass, filtrar de mocks
  if (isBypassValidationsEnabled()) {
    const usuarios = await getUsuarios();
    return {
      coordinadores: usuarios.filter(u => u.rol === 'coordinador' && u.institucionId === institucionId),
      orientadores: usuarios.filter(u => u.rol === 'orientador' && u.institucionId === institucionId)
    };
  }

  // Usar API real
  try {
    const result = await apiClient.getDirectivosInstitucion(institucionId);
    if (result.success && result.data) {
      return result.data;
    }
    return { coordinadores: [], orientadores: [] };
  } catch (error) {
    console.error('Error al obtener directivos:', error);
    return { coordinadores: [], orientadores: [] };
  }
}

// ============================================
// DEPARTAMENTOS CRUD
// ============================================

export async function createDepartamento(data: Omit<Departamento, 'id'>): Promise<Departamento> {
  await delay(500);
  const newId = Math.max(...departamentosMock.map(d => d.id), 0) + 1;
  const newDepartamento: Departamento = {
    id: newId,
    ...data
  };
  departamentosMock.push(newDepartamento);
  return newDepartamento;
}

export async function updateDepartamento(id: number, data: Partial<Departamento>): Promise<Departamento> {
  await delay(500);
  const index = departamentosMock.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Departamento no encontrado');
  
  departamentosMock[index] = { ...departamentosMock[index], ...data };
  return departamentosMock[index];
}

export async function deleteDepartamento(id: number): Promise<void> {
  await delay(500);
  const index = departamentosMock.findIndex(d => d.id === id);
  if (index === -1) throw new Error('Departamento no encontrado');
  
  departamentosMock.splice(index, 1);
}

// ============================================
// MUNICIPIOS CRUD
// ============================================

export async function createMunicipio(data: Omit<Municipio, 'id'>): Promise<Municipio> {
  await delay(500);
  const newId = Math.max(...municipiosMock.map(m => m.id), 0) + 1;
  const newMunicipio: Municipio = {
    id: newId,
    ...data
  };
  municipiosMock.push(newMunicipio);
  return newMunicipio;
}

export async function updateMunicipio(id: number, data: Partial<Municipio>): Promise<Municipio> {
  await delay(500);
  const index = municipiosMock.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Municipio no encontrado');
  
  municipiosMock[index] = { ...municipiosMock[index], ...data };
  return municipiosMock[index];
}

export async function deleteMunicipio(id: number): Promise<void> {
  await delay(500);
  const index = municipiosMock.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Municipio no encontrado');
  
  municipiosMock.splice(index, 1);
}

// ============================================
// CARGA MASIVA DE ESTUDIANTES
// ============================================

export interface ValidacionExcelResult {
  success: boolean;
  totalFilas?: number;
  filasValidas?: number;
  filasInvalidas?: number;
  errores?: Array<{ fila: number; error: string }>;
  estudiantesValidos?: Array<{
    fila: number;
    nombres: string;
    apellidos: string;
    numeroDocumento: string;
  }>;
  error?: string;
}

export interface CargaMasivaResult {
  success: boolean;
  totalProcesados?: number;
  insertados?: number;
  rechazados?: number;
  errores?: Array<{ fila: number; error: string }>;
  error?: string;
}

/**
 * Validar archivo Excel antes de carga masiva
 */
export const validarExcelEstudiantes = async (archivo: File): Promise<ValidacionExcelResult> => {
  // Si está en modo bypass, simular validación
  if (isBypassValidationsEnabled()) {
    await delay(1000);
    // Simular validación exitosa
    return {
      success: true,
      totalFilas: 10,
      filasValidas: 8,
      filasInvalidas: 2,
      errores: [
        { fila: 3, error: 'Número de documento duplicado' },
        { fila: 7, error: 'Correo de acudiente inválido' }
      ],
      estudiantesValidos: [
        { fila: 1, nombres: 'Juan', apellidos: 'Pérez', numeroDocumento: '1234567890' },
        { fila: 2, nombres: 'María', apellidos: 'González', numeroDocumento: '0987654321' }
      ]
    };
  }
  
  // Usar API real
  const result = await apiClient.validarExcel(archivo);
  if (result.success && result.data) {
    return {
      success: true,
      totalFilas: result.data.totalFilas,
      filasValidas: result.data.filasValidas,
      filasInvalidas: result.data.filasInvalidas,
      errores: result.data.errores,
      estudiantesValidos: result.data.estudiantesValidos
    };
  }
  return { success: false, error: result.message };
};

/**
 * Ejecutar carga masiva de estudiantes
 */
export const cargaMasivaEstudiantes = async (archivo: File, cursoId: number): Promise<CargaMasivaResult> => {
  // Si está en modo bypass, simular carga
  if (isBypassValidationsEnabled()) {
    await delay(2000);
    // Simular carga exitosa
    return {
      success: true,
      totalProcesados: 8,
      insertados: 7,
      rechazados: 1,
      errores: [
        { fila: 5, error: 'El estudiante ya existe en el sistema' }
      ]
    };
  }
  
  // Usar API real
  const result = await apiClient.cargaMasivaEstudiantes(archivo, cursoId);
  if (result.success && result.data) {
    return {
      success: true,
      totalProcesados: result.data.totalProcesados,
      insertados: result.data.insertados,
      rechazados: result.data.rechazados,
      errores: result.data.errores
    };
  }
  return { success: false, error: result.message };
};

/**
 * Carga masiva dual (dos archivos: estudiantes + acudientes)
 */
export const cargaMasivaDual = async (
  archivoEstudiantes: File,
  archivoAcudientes: File,
  institucionId: number
) => {
  return await apiClient.cargaMasivaDual(archivoEstudiantes, archivoAcudientes, institucionId);
};

// ============================================
// NOTIFICACIONES FCM
// ============================================

/**
 * Registrar token FCM para notificaciones push
 */
export const registrarTokenFCM = async (tokenFcm: string): Promise<{ success: boolean; error?: string }> => {
  // Si está en modo bypass, simular registro
  if (isBypassValidationsEnabled()) {
    await delay(300);
    console.log('📱 Token FCM registrado (mock):', tokenFcm.substring(0, 20) + '...');
    return { success: true };
  }
  
  // Usar API real
  const result = await apiClient.registrarTokenFCM(tokenFcm);
  return { success: result.success, error: result.message };
};

// ============================================
// COORDINADOR ACADÉMICO
// ============================================

/**
 * Obtener estadísticas del coordinador
 * GET /coordinadores/estadisticas
 */
export const getEstadisticasCoordinador = async () => {
  const result = await apiClient.getEstadisticasCoordinador();
  return result.data || {
    totalCursos: 0,
    totalDocentes: 0,
    totalOrientadores: 0,
    totalEstudiantes: 0,
    tareasCreadas: 0,
    tareasCalificadas: 0,
    tareasPendientes: 0,
    promedioGeneral: 0,
    cursosConAlerta: 0
  };
};

/**
 * Obtener cursos con métricas académicas
 * GET /coordinadores/cursos
 */
export const getCursosCoordinador = async () => {
  const result = await apiClient.getCursosCoordinador();
  return result.data || [];
};

/**
 * Obtener alertas académicas
 * GET /coordinadores/alertas
 */
export const getAlertasCoordinador = async () => {
  const result = await apiClient.getAlertasCoordinador();
  return result.data || {
    alertas: [],
    resumen: { criticas: 0, moderadas: 0, leves: 0 }
  };
};

/**
 * Obtener docentes con seguimiento académico
 * GET /coordinadores/docentes
 */
export const getDocentesCoordinador = async () => {
  const result = await apiClient.getDocentesCoordinador();
  return result.data || [];
};

/**
 * Obtener orientadores con métricas
 * GET /coordinadores/orientadores
 */
export const getOrientadoresCoordinador = async () => {
  const result = await apiClient.getOrientadoresCoordinador();
  return result.data || [];
};

/**
 * Obtener rendimiento detallado de un curso
 * GET /coordinadores/cursos/:id/rendimiento
 */
export const getRendimientoCurso = async (cursoId: number) => {
  const result = await apiClient.getRendimientoCurso(cursoId);
  return result.data || {
    cursoId,
    promedioGeneral: 0,
    distribucionRangos: {
      superior: { cantidad: 0, porcentaje: 0 },
      alto: { cantidad: 0, porcentaje: 0 },
      basico: { cantidad: 0, porcentaje: 0 },
      bajo: { cantidad: 0, porcentaje: 0 }
    },
    promediosPorAsignatura: [],
    tendencia: 'estable' as const
  };
};

// ============================================
// CRUD ORIENTADORES (Panel Coordinador)
// ============================================

/**
 * Listar orientadores de la institución
 * GET /orientadores
 */
export const getOrientadoresCRUD = async () => {
  const result = await apiClient.getOrientadores();
  return { success: result.success, data: result.data || [], error: result.message };
};

/**
 * Ver detalle de un orientador
 * GET /orientadores/:id
 */
export const getOrientadorById = async (id: number) => {
  const result = await apiClient.getOrientador(id);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Crear orientador (usa endpoint de coordinador)
 * POST /coordinadores/orientadores
 */
export const crearOrientador = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  // Mapear al formato que espera el endpoint del coordinador
  const coordinadorData = {
    correo: data.email,
    contrasena: data.password,
    nombre: data.firstName,
    apellido: data.lastName,
    telefono: data.phone || ''
  };
  const result = await apiClient.crearOrientadorCoordinador(coordinadorData);
  return { 
    success: result.success, 
    data: result.data, 
    error: result.message
  };
};

/**
 * Actualizar orientador (usa endpoint de coordinador)
 * PUT /coordinadores/orientadores/:id
 */
export const actualizarOrientador = async (id: number, data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
}) => {
  // Mapear al formato que espera el endpoint del coordinador
  const coordinadorData: any = {};
  if (data.firstName) coordinadorData.nombre = data.firstName;
  if (data.lastName) coordinadorData.apellido = data.lastName;
  if (data.email) coordinadorData.correo = data.email;
  if (data.phone) coordinadorData.telefono = data.phone;
  
  const result = await apiClient.actualizarOrientadorCoordinador(id, coordinadorData);
  return { success: result.success, error: result.message };
};

/**
 * Desactivar/Eliminar orientador (usa endpoint de coordinador)
 * DELETE /coordinadores/orientadores/:id
 */
export const desactivarOrientador = async (id: number) => {
  const result = await apiClient.eliminarOrientadorCoordinador(id);
  return { success: result.success, message: result.message, error: result.message };
};

// ============================================
// VINCULACIÓN ESTUDIANTE-ACUDIENTE (Backend Real)
// ============================================

/**
 * Listar todos los acudientes de la institución (Coordinador)
 * GET /coordinadores/acudientes
 */
export const getAcudientesCoordinador = async () => {
  const result = await apiClient.getAcudientesCoordinador();
  return result.data || [];
};

/**
 * Listar todos los acudientes de la institución (Orientador)
 * GET /orientadores/acudientes
 */
export const getAcudientesOrientador = async () => {
  const result = await apiClient.getAcudientesOrientador();
  return result.data || [];
};

/**
 * Listar acudientes de un estudiante (Backend Real)
 * GET /estudiantes/:id/acudientes
 */
export const getAcudientesDeEstudianteAPI = async (estudianteId: number) => {
  const result = await apiClient.getAcudientesEstudiante(estudianteId);
  return { success: result.success, data: result.data || [], error: result.message };
};

/**
 * Vincular acudiente a estudiante (Backend Real)
 * POST /estudiantes/:id/acudientes
 */
export const vincularAcudienteAPI = async (estudianteId: number, data: {
  acudienteId: number;
  esPrincipal?: boolean;
  autorizacionRecogida?: boolean;
}) => {
  const result = await apiClient.vincularAcudiente(estudianteId, data);
  return { success: result.success, error: result.message };
};

/**
 * Actualizar vínculo estudiante-acudiente
 * PUT /estudiantes/:estudianteId/acudientes/:acudienteId
 */
export const actualizarVinculoAcudiente = async (
  estudianteId: number, 
  acudienteId: number, 
  data: {
    esPrincipal?: boolean;
    autorizacionRecogida?: boolean;
  }
) => {
  const result = await apiClient.updateVinculoAcudiente(estudianteId, acudienteId, data);
  return { success: result.success, error: result.message };
};

/**
 * Desvincular acudiente de estudiante
 * DELETE /estudiantes/:estudianteId/acudientes/:acudienteId
 */
export const desvincularAcudienteReal = async (estudianteId: number, acudienteId: number) => {
  const result = await apiClient.desvincularAcudiente(estudianteId, acudienteId);
  return { success: result.success, error: result.message };
};

// ============================================
// GESTIÓN AVANZADA DE ESTUDIANTES
// ============================================

/**
 * Cambiar curso de un estudiante
 * POST /estudiantes/:id/cambiar-curso
 */
export const cambiarCursoEstudiante = async (estudianteId: number, data: {
  nuevoCursoId: number;
  motivo?: string;
}) => {
  const result = await apiClient.cambiarCursoEstudiante(estudianteId, data);
  return { success: result.success, error: result.message };
};

/**
 * Retirar estudiante
 * POST /estudiantes/:id/retirar
 */
export const retirarEstudiante = async (estudianteId: number, data: {
  motivo: string;
  fechaRetiro?: string;
}) => {
  const result = await apiClient.retirarEstudiante(estudianteId, data);
  return { success: result.success, error: result.message };
};

/**
 * Historial del estudiante
 * GET /estudiantes/:id/historial
 */
export const getHistorialEstudiante = async (estudianteId: number) => {
  const result = await apiClient.getHistorialEstudiante(estudianteId);
  return { success: result.success, data: result.data || [], error: result.message };
};

// ============================================
// REPORTES COORDINADOR
// ============================================

/**
 * Reporte de entregas por curso
 * GET /reportes/cursos/:cursoId/entregas
 */
export const getReporteEntregasCurso = async (cursoId: number, periodo?: number) => {
  const result = await apiClient.getReporteEntregasCurso(cursoId, periodo);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Reporte de calificaciones por curso
 * GET /reportes/cursos/:cursoId/calificaciones
 */
export const getReporteCalificacionesCurso = async (cursoId: number, periodo?: number) => {
  const result = await apiClient.getReporteCalificacionesCurso(cursoId, periodo);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Resumen institucional
 * GET /reportes/institucion/resumen
 */
export const getResumenInstitucional = async () => {
  const result = await apiClient.getResumenInstitucional();
  return { success: result.success, data: result.data, error: result.message };
};

// ============================================
// CRUD DOCENTES (Vista /docentes)
// ============================================

/**
 * Obtener todos los docentes
 * GET /docentes
 */
export const getDocentesCRUD = async () => {
  const result = await apiClient.getDocentes();
  return result.data || [];
};

/**
 * Obtener docente por ID
 * GET /docentes/:id
 */
export const getDocenteById = async (id: number) => {
  const result = await apiClient.getDocenteById(id);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Crear docente
 * POST /docentes
 */
export const crearDocente = async (data: {
  correo: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  institucionId: number;
  cursoIds?: number[];
}) => {
  const result = await apiClient.createDocente(data);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Actualizar docente
 * PUT /docentes/:id
 */
export const actualizarDocente = async (id: number, data: {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  cursoIds?: number[];
  estaActivo?: boolean;
}) => {
  const result = await apiClient.updateDocente(id, data);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Eliminar docente
 * DELETE /docentes/:id
 */
export const eliminarDocente = async (id: number) => {
  const result = await apiClient.deleteDocente(id);
  return { success: result.success, error: result.message };
};

// ============================================
// CRUD CURSOS (Vista /cursos)
// ============================================

/**
 * Obtener todos los cursos
 * GET /cursos
 */
export const getCursosCRUD = async () => {
  const result = await apiClient.getCursos();
  return result.data || [];
};

/**
 * Obtener curso por ID (API real)
 * GET /cursos/:id
 */
export const getCursoByIdAPI = async (id: number) => {
  const result = await apiClient.getCursoById(id);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Crear curso
 * POST /cursos
 */
export const crearCurso = async (data: {
  nombre: string;
  gradoId: number;
  jornada: 'Mañana' | 'Tarde' | 'Completa';
  institucionId: number;
  docenteId?: number;
}) => {
  const result = await apiClient.createCurso(data);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Actualizar curso
 * PUT /cursos/:id
 */
export const actualizarCurso = async (id: number, data: {
  nombre?: string;
  gradoId?: number;
  jornada?: 'Mañana' | 'Tarde' | 'Completa';
  docenteId?: number;
}) => {
  const result = await apiClient.updateCurso(id, data);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Eliminar curso
 * DELETE /cursos/:id
 */
export const eliminarCurso = async (id: number) => {
  const result = await apiClient.deleteCurso(id);
  return { success: result.success, error: result.message };
};

// ============================================
// CRUD GRADOS
// ============================================

/**
 * Obtener todos los grados
 * GET /grados
 */
export const getGradosCRUD = async () => {
  const result = await apiClient.getGrados();
  return result.data || [];
};

/**
 * Obtener grado por ID
 * GET /grados/:id
 */
export const getGradoById = async (id: number) => {
  const result = await apiClient.getGradoById(id);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Crear grado
 * POST /grados
 */
export const crearGrado = async (data: {
  nombre: string;
  descripcion?: string;
  institucionId?: number;
}) => {
  const result = await apiClient.createGrado(data);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Actualizar grado
 * PUT /grados/:id
 */
export const actualizarGrado = async (id: number, data: {
  nombre?: string;
  descripcion?: string;
}) => {
  const result = await apiClient.updateGrado(id, data);
  return { success: result.success, data: result.data, error: result.message };
};

/**
 * Eliminar grado
 * DELETE /grados/:id
 */
export const eliminarGrado = async (id: number) => {
  const result = await apiClient.deleteGrado(id);
  return { success: result.success, error: result.message };
};

// ============================================
// FUNCIONES FALTANTES PARA COMPATIBILIDAD
// ============================================

/**
 * Obtener usuarios
 */
export const getUsuarios = async (): Promise<Usuario[]> => {
  try {
    const result = await apiClient.getUsuarios();
    if (result.success && result.data) {
      // Mapear datos del backend al formato del frontend
      return result.data.map((user: any) => ({
        id: user.id,
        nombre: user.nombre || '',
        apellidos: user.apellidos || user.apellido || '',
        correo: user.correo || user.email || '',
        telefono: user.telefono || '',
        documento: user.documento || '',
        tipoDocumento: user.tipoDocumento || user.tipo_documento || 'CC',
        rol: user.rol || 'docente_aula',
        activo: user.activo !== false,
        institucionId: user.institucionId || user.institucion_id,
        debe_cambiar_contrasena: user.debeCambiarContrasena || user.debe_cambiar_contrasena || false
      }));
    }
    // Fallback a mock si falla
    return usuariosListMock.filter(u => !u.deletedAt);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    // Fallback a mock
    return usuariosListMock.filter(u => !u.deletedAt);
  }
};

/**
 * Obtener cursos
 */
export const getCursos = async (institucionId?: number): Promise<Curso[]> => {
  await delay(300);
  const cursos = cursosMock.filter(c => !c.deletedAt);
  if (institucionId) {
    return cursos.filter(c => c.institucionId === institucionId);
  }
  return cursos;
};

/**
 * Crear usuario
 */
export const createUsuario = async (data: Partial<Usuario>): Promise<{ success: boolean; usuario?: Usuario; error?: string }> => {
  await delay(500);
  const newUser: Usuario = {
    id: Math.max(...usuariosListMock.map(u => u.id), 0) + 1,
    nombre: data.nombre || '',
    apellidos: data.apellidos || '',
    correo: data.correo || '',
    telefono: data.telefono || '',
    documento: data.documento || '',
    tipoDocumento: data.tipoDocumento || 'cc',
    rol: data.rol || 'docente_aula',
    activo: true,
    institucionId: data.institucionId || 1
  };
  usuariosListMock.push(newUser);
  return { success: true, usuario: newUser };
};

/**
 * Actualizar usuario
 */
export const updateUsuario = async (id: number, data: Partial<Usuario>): Promise<{ success: boolean; usuario?: Usuario; error?: string }> => {
  try {
    const result = await apiClient.updateUsuario(id, data);
    if (result.success && result.data) {
      return { 
        success: true, 
        usuario: result.data as Usuario 
      };
    }
    return { 
      success: false, 
      error: result.message || 'Error al actualizar el usuario' 
    };
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return { 
      success: false, 
      error: 'Error al actualizar el usuario' 
    };
  }
};

/**
 * Eliminar usuario
 */
export const deleteUsuario = async (id: number): Promise<{ success: boolean; error?: string }> => {
  console.log('🗑️ [endpoints.ts] deleteUsuario llamado con id:', id);
  try {
    console.log('🗑️ [endpoints.ts] Llamando apiClient.deleteUsuario...');
    const result = await apiClient.deleteUsuario(id);
    console.log('🗑️ [endpoints.ts] Resultado de apiClient:', result);
    return { 
      success: result.success, 
      error: result.message 
    };
  } catch (error) {
    console.error('🗑️ [endpoints.ts] Error al eliminar usuario:', error);
    return { 
      success: false, 
      error: 'Error al eliminar el usuario' 
    };
  }
};

/**
 * Actualizar institución
 */
export const updateInstitucion = async (id: number, data: Partial<Institucion>): Promise<{ success: boolean; institucion?: Institucion; error?: string }> => {
  try {
    // Transformar datos de snake_case a camelCase para el backend
    const backendData = {
      nombre: data.nombre,
      codigoDane: data.codigo_dane,
      nit: data.nit,
      naturaleza: data.naturaleza,
      municipioId: data.municipio_id,
      telefonoPrincipal: data.telefono_principal,
      correoInstitucional: data.correo_institucional,
      direccionCompleta: data.direccion_completa,
      rectorNombre: data.rector_nombre,
      rectorDocumento: data.rector_documento,
      rectorTelefono: data.rector_telefono
    };
    
    const result = await apiClient.updateInstitucion(id, backendData);
    if (result.success && result.data) {
      return { 
        success: true, 
        institucion: result.data as Institucion 
      };
    }
    return { 
      success: false, 
      error: result.message || 'Error al actualizar la institución' 
    };
  } catch (error) {
    console.error('Error al actualizar institución:', error);
    return { 
      success: false, 
      error: 'Error al actualizar la institución' 
    };
  }
};

/**
 * Eliminar institución
 */
export const deleteInstitucion = async (id: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await apiClient.deleteInstitucion(id);
    return { 
      success: result.success, 
      error: result.message 
    };
  } catch (error) {
    console.error('Error al eliminar institución:', error);
    return { 
      success: false, 
      error: 'Error al eliminar la institución' 
    };
  }
};

/**
 * Obtener mi institución (del usuario en sesión)
 */
export const getMiInstitucion = async (): Promise<Institucion | null> => {
  const session = getSession();
  if (!session?.user?.institucionId) return null;
  return getInstitucionById(session.user.institucionId);
};

/**
 * Obtener perfil del usuario
 */
export const getPerfilUsuario = async (usuarioId?: number): Promise<{ success: boolean; usuario?: Usuario; error?: string }> => {
  await delay(300);
  const session = getSession();
  const id = usuarioId || session?.user?.id;
  
  if (!id) {
    return { success: false, error: 'No hay usuario en sesión' };
  }
  
  const usuario = usuariosListMock.find(u => u.id === id && !u.deletedAt);
  if (!usuario) {
    return { success: false, error: 'Usuario no encontrado' };
  }
  
  return { success: true, usuario };
};

/**
 * Obtener períodos
 */
export const getPeriodos = async (institucionId?: number): Promise<Periodo[]> => {
  await delay(300);
  const periodos = periodosMock.filter(p => !p.deletedAt);
  if (institucionId) {
    return periodos.filter(p => p.institucionId === institucionId);
  }
  return periodos;
};

/**
 * Crear período
 */
export const createPeriodo = async (data: Partial<Periodo>): Promise<{ success: boolean; periodo?: Periodo; error?: string }> => {
  await delay(500);
  const newPeriodo: Periodo = {
    id: Math.max(...periodosMock.map(p => p.id), 0) + 1,
    nombre: data.nombre || '',
    fechaInicio: data.fechaInicio || '',
    fechaFin: data.fechaFin || '',
    institucionId: data.institucionId || 1,
    anio: data.anio || new Date().getFullYear(),
    estado: data.estado || 'planificado',
    activo: true
  };
  periodosMock.push(newPeriodo);
  return { success: true, periodo: newPeriodo };
};

/**
 * Actualizar período
 */
export const updatePeriodo = async (id: number, data: Partial<Periodo>): Promise<{ success: boolean; periodo?: Periodo; error?: string }> => {
  await delay(500);
  const periodo = periodosMock.find(p => p.id === id);
  if (!periodo) {
    return { success: false, error: 'Período no encontrado' };
  }
  Object.assign(periodo, data);
  return { success: true, periodo };
};

/**
 * Eliminar período
 */
export const deletePeriodo = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(300);
  const index = periodosMock.findIndex(p => p.id === id);
  if (index === -1) {
    return { success: false, error: 'Período no encontrado' };
  }
  periodosMock.splice(index, 1);
  return { success: true };
};

/**
 * Crear estudiante
 */
export const createEstudiante = async (data: {
  nombre: string;
  apellidos: string;
  documento: string;
  tipoDocumento?: string;
  fechaNacimiento?: string;
  cursoId: number;
  institucionId: number;
}): Promise<{ success: boolean; estudiante?: Estudiante; error?: string }> => {
  await delay(500);
  
  // Validar que no exista estudiante con el mismo documento
  if (estudiantesMock.some(e => e.documento === data.documento && !e.deletedAt)) {
    return { success: false, error: 'Ya existe un estudiante con este documento' };
  }
  
  const newEstudiante: Estudiante = {
    id: Math.max(...estudiantesMock.map(e => e.id), 0) + 1,
    nombre: data.nombre,
    apellidos: data.apellidos,
    documento: data.documento,
    tipoDocumento: data.tipoDocumento || 'cc',
    fechaNacimiento: data.fechaNacimiento,
    cursoId: data.cursoId,
    institucionId: data.institucionId,
    activo: true
  };
  
  estudiantesMock.push(newEstudiante);
  addLogAuditoria('crear', 'Estudiante', newEstudiante.id, `Estudiante ${newEstudiante.nombre} ${newEstudiante.apellidos} creado`);
  
  return { success: true, estudiante: newEstudiante };
};

/**
 * Vincular estudiante a acudiente
 */
export const vincularEstudianteAcudiente = async (data: {
  estudianteId: number;
  acudienteId: number;
  parentesco?: string;
  esPrincipal?: boolean;
}): Promise<{ success: boolean; error?: string }> => {
  await delay(300);
  
  // Validar que existan estudiante y acudiente
  const estudiante = estudiantesMock.find(e => e.id === data.estudianteId);
  const acudiente = usuariosListMock.find(u => u.id === data.acudienteId);
  
  if (!estudiante) {
    return { success: false, error: 'Estudiante no encontrado' };
  }
  
  if (!acudiente) {
    return { success: false, error: 'Acudiente no encontrado' };
  }
  
  // Crear vínculo en mock
  const newVinculo: EstudianteAcudiente = {
    id: Math.max(...estudiantesAcudientesMock.map(v => v.id), 0) + 1,
    estudianteId: data.estudianteId,
    acudienteId: data.acudienteId,
    parentesco: data.parentesco || 'acudiente',
    esPrincipal: data.esPrincipal || false,
    activo: true
  };
  
  estudiantesAcudientesMock.push(newVinculo);
  addLogAuditoria('crear', 'EstudianteAcudiente', newVinculo.id, `Vínculo estudiante-acudiente creado`);
  
  return { success: true };
};

/**
 * Obtener estudiantes
 */
export const getEstudiantes = async (institucionId?: number): Promise<Estudiante[]> => {
  await delay(300);
  const estudiantes = estudiantesMock.filter(e => !e.deletedAt);
  if (institucionId) {
    return estudiantes.filter(e => e.institucionId === institucionId);
  }
  return estudiantes;
};

/**
 * Actualizar estudiante
 */
export const updateEstudiante = async (id: number, data: Partial<Estudiante>): Promise<{ success: boolean; estudiante?: Estudiante; error?: string }> => {
  await delay(500);
  const estudiante = estudiantesMock.find(e => e.id === id);
  if (!estudiante) {
    return { success: false, error: 'Estudiante no encontrado' };
  }
  Object.assign(estudiante, data);
  return { success: true, estudiante };
};

/**
 * Eliminar estudiante
 */
export const deleteEstudiante = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(300);
  const estudiante = estudiantesMock.find(e => e.id === id);
  if (!estudiante) {
    return { success: false, error: 'Estudiante no encontrado' };
  }
  estudiante.deletedAt = new Date().toISOString();
  return { success: true };
};

/**
 * Descargar plantilla de estudiantes
 */
export const descargarPlantillaEstudiantes = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
  await delay(200);
  
  const plantilla = {
    estudiante_nombre: 'Juan',
    estudiante_apellidos: 'Pérez García',
    estudiante_documento: '1234567890',
    estudiante_tipo_doc: 'cc',
    estudiante_fecha_nacimiento: '2010-05-15',
    curso_id: '1',
    acudiente_nombre: 'María',
    acudiente_apellidos: 'Pérez López',
    acudiente_documento: '0987654321',
    acudiente_tipo_doc: 'cc',
    acudiente_email: 'maria@example.com',
    acudiente_telefono: '3001234567',
    parentesco: 'madre',
    es_principal: 'si'
  };
  
  return { success: true, data: plantilla };
};

// ============================================
// ALIASES DE EXPORTACIÓN PARA COMPATIBILIDAD
// ============================================

// Aliases para mantener compatibilidad con imports existentes
export const createCurso = crearCurso;
export const updateCurso = actualizarCurso;
export const deleteCurso = eliminarCurso;
export const createGrado = crearGrado;
export const updateGrado = actualizarGrado;
export const deleteGrado = eliminarGrado;
export const createDocente = crearDocente;
export const updateDocente = actualizarDocente;
export const deleteDocente = eliminarDocente;
export const getGrados = getGradosCRUD;
