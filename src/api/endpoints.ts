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
        direccion: inst.direccion || '',
        telefono: inst.telefono || '',
        correo: inst.correo || '',
        naturaleza: inst.naturaleza || 'Pública',
        municipio_id: inst.municipioId,
        municipio: inst.municipio?.nombre || '',
        departamento: inst.municipio?.departamento?.nombre || '',
        activo: true,
        aprobado: inst.aprobado || false,
        createdAt: inst.creadoEn
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
  await delay(300);
  return institucionesMock.find(i => i.id === id && !i.eliminado_en) || null;
};

export const createInstitucion = async (data: Partial<Institucion>): Promise<{ success: boolean; institucion?: Institucion; error?: string }> => {
  await delay(800);
  
  // Validar correo único
  // @ts-ignore
  if (data.correo && institucionesMock.some(i => i.correo === data.correo && !i.deletedAt)) {
    return { success: false, error: 'Ya existe una institución con este correo' };
  }
  
  const newInstitucion: Institucion = {
    id: Date.now(),
    nombre: data.nombre || '',
    direccion: data.direccion || '',
    telefono: data.telefono || '',
    correo: data.correo,
    // @ts-ignore
    rectorId: data.rectorId,
    activo: true,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  institucionesMock.push(newInstitucion);
  addLogAuditoria('crear', 'Institucion', newInstitucion.id, `Institución creada: ${newInstitucion.nombre}`);
  
  return { success: true, institucion: newInstitucion };
};

export const updateInstitucion = async (id: number, data: Partial<Institucion>): Promise<{ success: boolean; institucion?: Institucion; error?: string }> => {
  await delay(600);
  
  const index = institucionesMock.findIndex(i => i.id === id);
  if (index === -1) {
    return { success: false, error: 'Institución no encontrada' };
  }
  
  // Validar correo único si se está cambiando
  // @ts-ignore
  if (data.correo && institucionesMock.some(i => i.correo === data.correo && i.id !== id && !i.deletedAt)) {
    return { success: false, error: 'Ya existe una institución con este correo' };
  }
  
  institucionesMock[index] = { ...institucionesMock[index], ...data };
  addLogAuditoria('actualizar', 'Institucion', id, `Institución actualizada: ${institucionesMock[index].nombre}`);
  
  return { success: true, institucion: institucionesMock[index] };
};

export const deleteInstitucion = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(500);
  
  const institucion = institucionesMock.find(i => i.id === id);
  if (!institucion) {
    return { success: false, error: 'Institución no encontrada' };
  }
  
  // Eliminación suave
  institucion.eliminado_en = new Date().toISOString();
  institucion.activo = false;
  addLogAuditoria('eliminar', 'Institucion', id, `Institución eliminada: ${institucion.nombre}`);
  
  return { success: true };
};

// ============================================
// INSTITUCIONES PENDIENTES (Admin Sistema)
// ============================================

export const getInstitucionesPendientes = async (): Promise<{ success: boolean; instituciones?: Institucion[]; error?: string }> => {
  // Si está en modo bypass o preview, usar mock
  const session = getSession();
  if (isBypassValidationsEnabled() || !session?.token || session.isPreview) {
    await delay(500);
    // Simular instituciones pendientes de aprobación
    const pendientes = institucionesMock
      .filter(i => !i.activo && !i.eliminado_en)
      .map(i => ({ ...i, estado: 'pendiente' as const }));
    return { success: true, instituciones: pendientes };
  }
  
  // Usar API real
  const result = await apiClient.getInstitucionesPendientes();
  if (result.success && result.data) {
    // Mapear respuesta del backend al formato del frontend
    const instituciones: Institucion[] = result.data.map(inst => ({
      id: inst.id,
      nombre: inst.nombre,
      direccion: inst.direccion,
      direccion_completa: inst.direccion,
      telefono: inst.telefono,
      telefono_principal: inst.telefono,
      correo: inst.correo,
      correo_institucional: inst.correo,
      naturaleza: (inst.naturaleza?.toLowerCase() || 'publica') as 'publica' | 'privada' | 'mixta',
      municipio_id: inst.municipioId,
      niveles_educativos: [],
      modalidad: '',
      jornadas: [],
      confesional: false,
      activo: false,
      creado_en: inst.creadoEn
    }));
    return { success: true, instituciones };
  }
  return { success: false, error: result.message };
};

export const aprobarInstitucion = async (institucionId: number): Promise<{ success: boolean; institucion?: Institucion; error?: string }> => {
  // Si está en modo bypass, usar mock
  if (isBypassValidationsEnabled()) {
    await delay(800);
    const institucion = institucionesMock.find(i => i.id === institucionId);
    if (!institucion) {
      return { success: false, error: 'Institución no encontrada' };
    }
    institucion.activo = true;
    addLogAuditoria('actualizar', 'Institucion', institucionId, `Institución aprobada: ${institucion.nombre}`);
    return { success: true, institucion };
  }
  
  // Usar API real
  const result = await apiClient.aprobarInstitucion(institucionId);
  if (result.success && result.data) {
    const institucion: Institucion = {
      id: result.data.id,
      nombre: result.data.nombre,
      direccion: result.data.direccion,
      direccion_completa: result.data.direccion,
      telefono: result.data.telefono,
      telefono_principal: result.data.telefono,
      correo: result.data.correo,
      correo_institucional: result.data.correo,
      naturaleza: (result.data.naturaleza?.toLowerCase() || 'publica') as 'publica' | 'privada' | 'mixta',
      municipio_id: result.data.municipioId,
      niveles_educativos: [],
      modalidad: '',
      jornadas: [],
      confesional: false,
      activo: true,
      creado_en: result.data.creadoEn
    };
    return { success: true, institucion };
  }
  return { success: false, error: result.message };
};

// ============================================
// PERIODOS - CONSUMO DESDE BACKEND
// ============================================

export const getPeriodos = async (institucionId?: number): Promise<Periodo[]> => {
  try {
    const result = await apiClient.getPeriodos();
    if (result.success && result.data) {
      let periodos = result.data.map((p: any) => ({
        id: p.id,
        nombre: p.nombre || '',
        fechaInicio: p.fechaInicio || p.fecha_inicio || '',
        fechaFin: p.fechaFin || p.fecha_fin || '',
        institucionId: p.institucionId || p.institucion_id || 1,
        anio: p.anio || p.año || new Date().getFullYear(),
        estado: p.estado || 'planificado',
        createdAt: p.createdAt || p.created_at || p.creadoEn || ''
      }));
      
      if (institucionId) {
        periodos = periodos.filter((p: Periodo) => p.institucionId === institucionId);
      }
      
      return periodos;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener periodos:', error);
    return [];
  }
};

export const getPeriodoActivo = async (institucionId: number): Promise<Periodo | null> => {
  try {
    const periodos = await getPeriodos(institucionId);
    return periodos.find(p => p.estado === 'activo') || null;
  } catch (error) {
    console.error('Error al obtener periodo activo:', error);
    return null;
  }
};

export const createPeriodo = async (data: Partial<Periodo>): Promise<{ success: boolean; periodo?: Periodo; error?: string }> => {
  await delay(800);
  
  // Validar fechas
  if (!data.fechaInicio || !data.fechaFin) {
    return { success: false, error: 'Las fechas de inicio y fin son requeridas' };
  }
  
  if (new Date(data.fechaFin) <= new Date(data.fechaInicio)) {
    return { success: false, error: 'La fecha de fin debe ser posterior a la fecha de inicio' };
  }
  
  // Validar que no haya otro período activo
  if (data.estado === 'activo') {
    const periodoActivo = periodosMock.find(p => 
      p.institucionId === data.institucionId && p.estado === 'activo'
    );
    if (periodoActivo) {
      return { success: false, error: 'Ya existe un período activo. Ciérrelo primero.' };
    }
  }
  
  const newPeriodo: Periodo = {
    id: Date.now(),
    nombre: data.nombre || '',
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    institucionId: data.institucionId || 1,
    anio: data.anio || new Date().getFullYear(),
    estado: data.estado || 'planificado',
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  periodosMock.push(newPeriodo);
  addLogAuditoria('crear', 'Periodo', newPeriodo.id, `Período creado: ${newPeriodo.nombre}`);
  
  return { success: true, periodo: newPeriodo };
};

export const updatePeriodo = async (id: number, data: Partial<Periodo>): Promise<{ success: boolean; periodo?: Periodo; error?: string }> => {
  await delay(600);
  
  const index = periodosMock.findIndex(p => p.id === id);
  if (index === -1) {
    return { success: false, error: 'Período no encontrado' };
  }
  
  // Validar fechas si se están actualizando
  const fechaInicio = data.fechaInicio || periodosMock[index].fechaInicio;
  const fechaFin = data.fechaFin || periodosMock[index].fechaFin;
  
  if (new Date(fechaFin) <= new Date(fechaInicio)) {
    return { success: false, error: 'La fecha de fin debe ser posterior a la fecha de inicio' };
  }
  
  // Validar que no haya otro período activo
  if (data.estado === 'activo' && periodosMock[index].estado !== 'activo') {
    const periodoActivo = periodosMock.find(p => 
      p.institucionId === periodosMock[index].institucionId && 
      p.estado === 'activo' && 
      p.id !== id
    );
    if (periodoActivo) {
      return { success: false, error: 'Ya existe un período activo. Ciérrelo primero.' };
    }
  }
  
  periodosMock[index] = { ...periodosMock[index], ...data };
  addLogAuditoria('actualizar', 'Periodo', id, `Período actualizado: ${periodosMock[index].nombre}`);
  
  return { success: true, periodo: periodosMock[index] };
};

export const deletePeriodo = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(500);
  
  const index = periodosMock.findIndex(p => p.id === id);
  if (index === -1) {
    return { success: false, error: 'Período no encontrado' };
  }
  
  // No permitir eliminar período activo
  if (periodosMock[index].estado === 'activo') {
    return { success: false, error: 'No se puede eliminar un período activo' };
  }
  
  const nombre = periodosMock[index].nombre;
  periodosMock.splice(index, 1);
  addLogAuditoria('eliminar', 'Periodo', id, `Período eliminado: ${nombre}`);
  
  return { success: true };
};

// ============================================
// GRADOS - CONSUMO DESDE BACKEND
// ============================================

export const getGrados = async (institucionId?: number): Promise<Grado[]> => {
  try {
    const result = await apiClient.getGrados();
    if (result.success && result.data) {
      let grados = result.data.map((g: any) => ({
        id: g.id,
        nombre: g.nombre || '',
        orden: g.orden || 0,
        institucionId: g.institucionId || g.institucion_id || 1,
        activo: g.activo ?? true
      }));
      
      if (institucionId) {
        grados = grados.filter((g: Grado) => g.institucionId === institucionId);
      }
      
      return grados.filter((g: Grado) => g.activo).sort((a: Grado, b: Grado) => a.orden - b.orden);
    }
    return [];
  } catch (error) {
    console.error('Error al obtener grados:', error);
    return [];
  }
};

export const createGrado = async (data: Partial<Grado>): Promise<{ success: boolean; grado?: Grado; error?: string }> => {
  await delay(600);
  
  // Validar nombre único en la institución
  if (gradosMock.some(g => g.nombre === data.nombre && g.institucionId === data.institucionId && g.activo)) {
    return { success: false, error: 'Ya existe un grado con este nombre' };
  }
  
  const newGrado: Grado = {
    id: Date.now(),
    nombre: data.nombre || '',
    orden: data.orden || gradosMock.length,
    institucionId: data.institucionId || 1,
    activo: true
  };
  
  gradosMock.push(newGrado);
  addLogAuditoria('crear', 'Grado', newGrado.id, `Grado creado: ${newGrado.nombre}`);
  
  return { success: true, grado: newGrado };
};

export const updateGrado = async (id: number, data: Partial<Grado>): Promise<{ success: boolean; grado?: Grado; error?: string }> => {
  await delay(500);
  
  const index = gradosMock.findIndex(g => g.id === id);
  if (index === -1) {
    return { success: false, error: 'Grado no encontrado' };
  }
  
  gradosMock[index] = { ...gradosMock[index], ...data };
  addLogAuditoria('actualizar', 'Grado', id, `Grado actualizado: ${gradosMock[index].nombre}`);
  
  return { success: true, grado: gradosMock[index] };
};

export const deleteGrado = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(500);
  
  const grado = gradosMock.find(g => g.id === id);
  if (!grado) {
    return { success: false, error: 'Grado no encontrado' };
  }
  
  // Verificar si hay cursos asociados
  const cursosAsociados = cursosMock.filter(c => c.gradoId === id && c.activo);
  if (cursosAsociados.length > 0) {
    return { success: false, error: 'No se puede eliminar un grado con cursos asociados' };
  }
  
  grado.activo = false;
  addLogAuditoria('eliminar', 'Grado', id, `Grado eliminado: ${grado.nombre}`);
  
  return { success: true };
};

// ============================================
// CURSOS - CONSUMO DESDE BACKEND
// ============================================

export const getCursos = async (institucionId?: number): Promise<Curso[]> => {
  try {
    // Consumir desde backend real
    const result = await apiClient.getCursos();
    if (result.success && result.data) {
      let cursos = result.data.map((c: any) => ({
        id: c.id,
        nombre: c.nombre || '',
        gradoId: c.gradoId || 1,
        jornada: c.jornada || 'mañana',
        institucionId: c.institucionId || 1,
        docenteDirectorId: c.docenteDirectorId,
        activo: c.activo !== false
      }));
      
      if (institucionId) {
        cursos = cursos.filter((c: Curso) => c.institucionId === institucionId);
      }
      
      return cursos;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return [];
  }
};

export const getCursoById = async (id: number): Promise<Curso | null> => {
  try {
    const cursos = await getCursos();
    return cursos.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Error al obtener curso:', error);
    return null;
  }
};

export const getCursosByDocente = async (docenteId: number): Promise<Curso[]> => {
  try {
    const cursos = await getCursos();
    return cursos.filter(c => c.docenteDirectorId === docenteId && c.activo);
  } catch (error) {
    console.error('Error al obtener cursos del docente:', error);
    return [];
  }
};

export const createCurso = async (data: Partial<Curso>): Promise<{ success: boolean; curso?: Curso; error?: string }> => {
  await delay(700);
  
  // Validar que el docente pertenezca a la misma institución
  if (data.docenteDirectorId) {
    const docente = usuariosListMock.find(u => u.id === data.docenteDirectorId);
    if (docente && docente.institucionId !== data.institucionId) {
      return { success: false, error: 'El docente debe pertenecer a la misma institución del curso' };
    }
  }
  
  const newCurso: Curso = {
    id: Date.now(),
    nombre: data.nombre || '',
    gradoId: data.gradoId || 1,
    jornada: data.jornada || 'mañana',
    institucionId: data.institucionId || 1,
    docenteDirectorId: data.docenteDirectorId,
    activo: true
  };
  
  cursosMock.push(newCurso);
  addLogAuditoria('crear', 'Curso', newCurso.id, `Curso creado: ${newCurso.nombre}`);
  
  return { success: true, curso: newCurso };
};

export const updateCurso = async (id: number, data: Partial<Curso>): Promise<{ success: boolean; curso?: Curso; error?: string }> => {
  await delay(600);
  
  const index = cursosMock.findIndex(c => c.id === id);
  if (index === -1) {
    return { success: false, error: 'Curso no encontrado' };
  }
  
  // Validar multitenancy
  if (data.docenteDirectorId) {
    const docente = usuariosListMock.find(u => u.id === data.docenteDirectorId);
    const institucionId = data.institucionId || cursosMock[index].institucionId;
    if (docente && docente.institucionId !== institucionId) {
      return { success: false, error: 'El docente debe pertenecer a la misma institución del curso' };
    }
  }
  
  cursosMock[index] = { ...cursosMock[index], ...data };
  addLogAuditoria('actualizar', 'Curso', id, `Curso actualizado: ${cursosMock[index].nombre}`);
  
  return { success: true, curso: cursosMock[index] };
};

export const deleteCurso = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(500);
  
  const curso = cursosMock.find(c => c.id === id);
  if (!curso) {
    return { success: false, error: 'Curso no encontrado' };
  }
  
  // Verificar si hay estudiantes asociados
  const estudiantesAsociados = estudiantesMock.filter(e => e.cursoId === id && e.activo);
  if (estudiantesAsociados.length > 0) {
    return { success: false, error: 'No se puede eliminar un curso con estudiantes asociados' };
  }
  
  curso.activo = false;
  addLogAuditoria('eliminar', 'Curso', id, `Curso eliminado: ${curso.nombre}`);
  
  return { success: true };
};

// ============================================
// USUARIOS - CRUD COMPLETO
// ============================================

export const getUsuarios = async (institucionId?: number, rol?: RolUsuario): Promise<Usuario[]> => {
  try {
    // Consumir desde backend real
    const result = await apiClient.getUsuarios();
    if (result.success && result.data) {
      let usuarios = result.data.map((u: any) => ({
        id: u.id,
        nombre: u.nombre || '',
        apellidos: u.apellido || u.apellidos || '',
        correo: u.correo || '',
        rol: u.rol || 'acudiente',
        telefono: u.telefono || '',
        institucionId: u.institucionId,
        activo: u.estaActivo !== false,
        debe_cambiar_contrasena: u.debeCambiarContrasena
      }));
      
      // Aplicar filtros si se proporcionan
      if (institucionId) {
        usuarios = usuarios.filter((u: Usuario) => u.institucionId === institucionId || u.rol === 'admin' || u.rol === 'admin_sistema');
      }
      
      if (rol) {
        usuarios = usuarios.filter((u: Usuario) => u.rol === rol);
      }
      
      return usuarios;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

export const getUsuarioById = async (id: number): Promise<Usuario | null> => {
  try {
    const usuarios = await getUsuarios();
    return usuarios.find(u => u.id === id) || null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

export const createUsuario = async (data: Partial<Usuario> & { password?: string }): Promise<{ success: boolean; usuario?: Usuario; error?: string }> => {
  await delay(800);
  
  // Validar documento único
  if (data.documento && usuariosListMock.some(u => u.documento === data.documento && !u.deletedAt)) {
    return { success: false, error: 'Ya existe un usuario con este documento' };
  }
  
  // Validar correo único (excepto si es acudiente sin correo)
  if (data.correo && usuariosListMock.some(u => u.correo === data.correo && !u.deletedAt)) {
    return { success: false, error: 'Ya existe un usuario con este correo' };
  }
  
  // Correo requerido para roles que no sean acudiente
  if (data.rol !== 'acudiente' && !data.correo) {
    return { success: false, error: 'El correo es requerido para este rol' };
  }
  
  const newUsuario: Usuario = {
    id: Date.now(),
    nombre: data.nombre || '',
    apellidos: data.apellidos || '',
    correo: data.correo || '',
    rol: data.rol || 'acudiente',
    telefono: data.telefono || '',
    documento: data.documento,
    tipoDocumento: data.tipoDocumento,
    institucionId: data.institucionId,
    activo: true,
    debe_cambiar_contrasena: data.password ? true : false, // Si se establece password inicial, debe cambiarlo
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  // En una implementación real, la contraseña se almacenaría hasheada
  // Aquí solo la registramos en console para fines de demostración
  if (data.password) {
    console.log(`🔐 Usuario ${newUsuario.correo} creado con contraseña inicial: ${data.password}`);
  }
  
  usuariosListMock.push(newUsuario);
  addLogAuditoria('crear', 'Usuario', newUsuario.id, `Usuario creado: ${newUsuario.nombre} ${newUsuario.apellidos} (${newUsuario.rol})`);
  
  return { success: true, usuario: newUsuario };
};

export const updateUsuario = async (id: number, data: Partial<Usuario>): Promise<{ success: boolean; usuario?: Usuario; error?: string }> => {
  // Intentar con API real primero
  try {
    const result = await apiClient.actualizarPerfil(id, {
      nombre: data.nombre,
      apellido: data.apellidos,
      telefono: data.telefono,
      documento: data.documento,
      tipoDocumento: data.tipoDocumento
    });
    
    if (result.success) {
      return { success: true, usuario: data as Usuario };
    }
  } catch (error) {
    console.warn('API de actualización no disponible, usando mock');
  }

  // Fallback a mock
  await delay(600);
  
  const index = usuariosListMock.findIndex(u => u.id === id);
  if (index === -1) {
    return { success: false, error: 'Usuario no encontrado' };
  }
  
  // Validar documento único si se está cambiando
  if (data.documento && usuariosListMock.some(u => u.documento === data.documento && u.id !== id && !u.deletedAt)) {
    return { success: false, error: 'Ya existe un usuario con este documento' };
  }
  
  // Validar correo único si se está cambiando
  if (data.correo && usuariosListMock.some(u => u.correo === data.correo && u.id !== id && !u.deletedAt)) {
    return { success: false, error: 'Ya existe un usuario con este correo' };
  }
  
  usuariosListMock[index] = { 
    ...usuariosListMock[index], 
    ...data,
    updatedAt: new Date().toISOString().split('T')[0]
  };
  addLogAuditoria('actualizar', 'Usuario', id, `Usuario actualizado: ${usuariosListMock[index].nombre} ${usuariosListMock[index].apellidos}`);
  
  return { success: true, usuario: usuariosListMock[index] };
};

// Obtener perfil completo del usuario logueado
export const getPerfilUsuario = async (): Promise<{ success: boolean; usuario?: any; error?: string }> => {
  try {
    const result = await apiClient.getPerfilUsuario();
    if (result.success && result.data) {
      return { success: true, usuario: result.data };
    }
  } catch (error) {
    console.warn('Endpoint de perfil no disponible');
  }
  
  // Fallback: retornar datos de sesión
  const session = getSession();
  if (session?.user) {
    return { success: true, usuario: session.user };
  }
  
  return { success: false, error: 'No se pudo obtener el perfil' };
};

// Obtener institución del usuario logueado
export const getMiInstitucion = async (): Promise<Institucion | null> => {
  const session = getSession();
  const institucionId = session?.user?.institucionId;
  
  if (!institucionId) return null;
  
  // Intentar obtener de API real
  try {
    const result = await apiClient.getInstitucionById(institucionId);
    if (result.success && result.data) {
      return {
        id: result.data.id,
        nombre: result.data.nombre,
        direccion: result.data.direccion,
        telefono: result.data.telefono,
        correo: result.data.correo,
        naturaleza: result.data.naturaleza?.toLowerCase() as 'publica' | 'privada',
        activo: true,
        municipio: result.data.municipio?.nombre,
        departamento: result.data.municipio?.departamento?.nombre
      };
    }
  } catch (error) {
    console.warn('API de institución no disponible');
  }
  
  // Fallback a mock
  return institucionesMock.find(i => i.id === institucionId) || null;
};

export const deleteUsuario = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(500);
  
  const usuario = usuariosListMock.find(u => u.id === id);
  if (!usuario) {
    return { success: false, error: 'Usuario no encontrado' };
  }
  
  // Eliminación suave
  usuario.deletedAt = new Date().toISOString();
  usuario.activo = false;
  addLogAuditoria('eliminar', 'Usuario', id, `Usuario eliminado: ${usuario.nombre} ${usuario.apellidos}`);
  
  return { success: true };
};

// ============================================
// ESTUDIANTES - CRUD COMPLETO
// ============================================

export const getEstudiantes = async (institucionId?: number, cursoId?: number): Promise<Estudiante[]> => {
  try {
    const result = await apiClient.getEstudiantes();
    if (result.success && result.data) {
      let estudiantes = result.data.map((e: any) => ({
        id: e.id,
        nombre: e.nombre || e.nombres || '',
        apellidos: e.apellidos || e.apellido || '',
        documento: e.documento || e.numeroDocumento || '',
        tipoDocumento: e.tipoDocumento || e.tipo_documento || 'ti',
        fechaNacimiento: e.fechaNacimiento || e.fecha_nacimiento,
        cursoId: e.cursoId || e.curso_id,
        institucionId: e.institucionId || e.institucion_id,
        activo: e.activo ?? e.estaActivo ?? true,
        createdAt: e.createdAt || e.created_at || e.creadoEn || ''
      }));
      
      if (institucionId) {
        estudiantes = estudiantes.filter((e: Estudiante) => e.institucionId === institucionId);
      }
      
      if (cursoId) {
        estudiantes = estudiantes.filter((e: Estudiante) => e.cursoId === cursoId);
      }
      
      return estudiantes;
    }
    return [];
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    return [];
  }
};

export const getEstudianteById = async (id: number): Promise<Estudiante | null> => {
  try {
    const result = await apiClient.getEstudianteById(id);
    if (result.success && result.data) {
      const e = result.data;
      return {
        id: e.id,
        nombre: e.nombre || e.nombres || '',
        apellidos: e.apellidos || e.apellido || '',
        documento: e.documento || e.numeroDocumento || '',
        tipoDocumento: e.tipoDocumento || e.tipo_documento || 'ti',
        fechaNacimiento: e.fechaNacimiento || e.fecha_nacimiento,
        cursoId: e.cursoId || e.curso_id,
        institucionId: e.institucionId || e.institucion_id,
        activo: e.activo ?? e.estaActivo ?? true,
        createdAt: e.createdAt || e.created_at || e.creadoEn || ''
      };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    return null;
  }
};

export const getEstudiantesByCurso = async (cursoId: number): Promise<Estudiante[]> => {
  try {
    const estudiantes = await getEstudiantes(undefined, cursoId);
    return estudiantes;
  } catch (error) {
    console.error('Error al obtener estudiantes del curso:', error);
    return [];
  }
};

export const createEstudiante = async (data: Partial<Estudiante>): Promise<{ success: boolean; estudiante?: Estudiante; error?: string }> => {
  await delay(800);
  
  // Validar documento único
  if (data.documento && estudiantesMock.some(e => e.documento === data.documento && !e.deletedAt)) {
    return { success: false, error: 'Ya existe un estudiante con este documento' };
  }
  
  const newEstudiante: Estudiante = {
    id: Date.now(),
    nombre: data.nombre || '',
    apellidos: data.apellidos || '',
    documento: data.documento || '',
    tipoDocumento: data.tipoDocumento || 'ti',
    fechaNacimiento: data.fechaNacimiento,
    cursoId: data.cursoId || 1,
    institucionId: data.institucionId || 1,
    activo: true,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  estudiantesMock.push(newEstudiante);
  addLogAuditoria('crear', 'Estudiante', newEstudiante.id, `Estudiante creado: ${newEstudiante.nombre} ${newEstudiante.apellidos}`);
  
  return { success: true, estudiante: newEstudiante };
};

export const updateEstudiante = async (id: number, data: Partial<Estudiante>): Promise<{ success: boolean; estudiante?: Estudiante; error?: string }> => {
  await delay(600);
  
  const index = estudiantesMock.findIndex(e => e.id === id);
  if (index === -1) {
    return { success: false, error: 'Estudiante no encontrado' };
  }
  
  // Validar documento único si se está cambiando
  if (data.documento && estudiantesMock.some(e => e.documento === data.documento && e.id !== id && !e.deletedAt)) {
    return { success: false, error: 'Ya existe un estudiante con este documento' };
  }
  
  estudiantesMock[index] = { ...estudiantesMock[index], ...data };
  addLogAuditoria('actualizar', 'Estudiante', id, `Estudiante actualizado: ${estudiantesMock[index].nombre} ${estudiantesMock[index].apellidos}`);
  
  return { success: true, estudiante: estudiantesMock[index] };
};

export const deleteEstudiante = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(500);
  
  const estudiante = estudiantesMock.find(e => e.id === id);
  if (!estudiante) {
    return { success: false, error: 'Estudiante no encontrado' };
  }
  
  // Eliminación suave
  estudiante.deletedAt = new Date().toISOString();
  estudiante.activo = false;
  addLogAuditoria('eliminar', 'Estudiante', id, `Estudiante eliminado: ${estudiante.nombre} ${estudiante.apellidos}`);
  
  return { success: true };
};

// ============================================
// VINCULACIÓN ESTUDIANTE-ACUDIENTE
// ============================================

export const getAcudientesDeEstudiante = async (estudianteId: number): Promise<{ 
  success: boolean; 
  vinculos?: Array<{ id: number; acudiente: Usuario; parentesco: string; esPrincipal: boolean }> 
}> => {
  await delay(400);
  
  const vinculos = estudiantesAcudientesMock.filter(v => v.estudianteId === estudianteId);
  const resultado = vinculos.map(v => {
    const acudiente = usuariosListMock.find(u => u.id === v.acudienteId);
    return { 
      id: v.id,
      acudiente: acudiente!, 
      parentesco: v.parentesco,
      esPrincipal: v.esPrincipal
    };
  }).filter(item => item.acudiente);
  
  return { success: true, vinculos: resultado };
};

export const getEstudiantesDeAcudiente = async (acudienteId: number): Promise<{ estudiante: Estudiante; relacion: EstudianteAcudiente }[]> => {
  await delay(400);
  
  const vinculos = estudiantesAcudientesMock.filter(v => v.acudienteId === acudienteId);
  return vinculos.map(v => {
    const estudiante = estudiantesMock.find(e => e.id === v.estudianteId);
    return { estudiante: estudiante!, relacion: v };
  }).filter(item => item.estudiante);
};

export const vincularEstudianteAcudiente = async (data: {
  estudianteId: number;
  acudienteId: number;
  parentesco: string;
  esPrincipal: boolean;
}): Promise<{ success: boolean; vinculo?: EstudianteAcudiente; error?: string }> => {
  await delay(600);
  
  // Verificar que no exista ya el vínculo
  const existeVinculo = estudiantesAcudientesMock.some(
    v => v.estudianteId === data.estudianteId && v.acudienteId === data.acudienteId
  );
  
  if (existeVinculo) {
    return { success: false, error: 'Este acudiente ya está vinculado al estudiante' };
  }
  
  // Si es principal, quitar el flag a los demás
  if (data.esPrincipal) {
    estudiantesAcudientesMock
      .filter(v => v.estudianteId === data.estudianteId)
      .forEach(v => v.esPrincipal = false);
  }
  
  const newVinculo: EstudianteAcudiente = {
    id: Date.now(),
    estudianteId: data.estudianteId,
    acudienteId: data.acudienteId,
    parentesco: data.parentesco,
    esPrincipal: data.esPrincipal,
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  estudiantesAcudientesMock.push(newVinculo);
  addLogAuditoria('crear', 'EstudianteAcudiente', newVinculo.id, `Vinculación creada: Estudiante ${data.estudianteId} - Acudiente ${data.acudienteId}`);
  
  return { success: true, vinculo: newVinculo };
};

export const updateVinculoEstudianteAcudiente = async (id: number, data: Partial<EstudianteAcudiente>): Promise<{ success: boolean; error?: string }> => {
  await delay(500);
  
  const index = estudiantesAcudientesMock.findIndex(v => v.id === id);
  if (index === -1) {
    return { success: false, error: 'Vínculo no encontrado' };
  }
  
  // Si se está marcando como principal, quitar el flag a los demás
  if (data.esPrincipal) {
    const estudianteId = estudiantesAcudientesMock[index].estudianteId;
    estudiantesAcudientesMock
      .filter(v => v.estudianteId === estudianteId && v.id !== id)
      .forEach(v => v.esPrincipal = false);
  }
  
  estudiantesAcudientesMock[index] = { ...estudiantesAcudientesMock[index], ...data };
  
  return { success: true };
};

export const desvincularEstudianteAcudiente = async (id: number): Promise<{ success: boolean; error?: string }> => {
  await delay(400);
  
  const index = estudiantesAcudientesMock.findIndex(v => v.id === id);
  if (index === -1) {
    return { success: false, error: 'Vínculo no encontrado' };
  }
  
  estudiantesAcudientesMock.splice(index, 1);
  addLogAuditoria('eliminar', 'EstudianteAcudiente', id, 'Vinculación eliminada');
  
  return { success: true };
};

// ============================================
// NOTIFICACIONES
// ============================================

export const getNotificaciones = async (destinatarioId?: number): Promise<Notificacion[]> => {
  await delay(400);
  if (destinatarioId) {
    return notificacionesMock.filter(n => n.destinatarioId === destinatarioId);
  }
  return notificacionesMock;
};

export const getNotificacionesPorTarea = async (tareaId: number): Promise<Notificacion[]> => {
  await delay(300);
  return notificacionesMock.filter(n => n.tareaId === tareaId);
};

export const enviarNotificacion = async (data: Partial<Notificacion>): Promise<{ success: boolean; notificacion?: Notificacion }> => {
  await delay(500);
  
  const newNotificacion: Notificacion = {
    id: Date.now(),
    tipo: data.tipo || 'sistema',
    titulo: data.titulo || '',
    mensaje: data.mensaje || '',
    destinatarioId: data.destinatarioId || 0,
    tareaId: data.tareaId,
    leida: false,
    fechaEnvio: new Date().toISOString()
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
 * Descargar plantilla Excel para carga masiva de estudiantes
 */
export const descargarPlantillaEstudiantes = async (): Promise<{ success: boolean; error?: string }> => {
  // Si está en modo bypass, simular descarga
  if (isBypassValidationsEnabled()) {
    await delay(300);
    // Crear un archivo de ejemplo
    const csvContent = 'tipo_documento,numero_documento,nombres,apellidos,fecha_nacimiento,genero,correo_acudiente,telefono_acudiente\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_estudiantes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    return { success: true };
  }
  
  // Usar API real
  try {
    await apiClient.descargarPlantillaExcel();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al descargar plantilla' };
  }
};

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