// ============================================
// API ENDPOINTS - Cátedra de Familia
// Por ahora retorna datos mock, después será fetch real
// ============================================

import { 
  usuariosMock, 
  estudiantesMock, 
  tareasMock, 
  entregasMock, 
  categoriasMock,
  cursosMock,
  institucionesMock,
  type Usuario,
  type Estudiante,
  type Tarea,
  type Entrega,
  type Categoria,
  type Curso,
  type Institucion,
  type RolUsuario
} from '../mocks/data';

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// AUTENTICACIÓN
// ============================================

export const login = async (correo: string, password: string): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
  await delay(800);
  
  // Mock: determinar rol basado en correo
  let user: Usuario | undefined;
  
  if (correo.includes('@admin')) {
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
};

export const logout = async (): Promise<void> => {
  await delay(300);
  localStorage.removeItem('session');
  localStorage.removeItem('previewRole');
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
    institucion: data.institucion
  };
  docentes.push({ ...data, ...newUser });
  localStorage.setItem('docentes', JSON.stringify(docentes));
  
  return { success: true, user: newUser };
};

// ============================================
// ESTUDIANTES
// ============================================

export const getEstudiantes = async (acudienteId?: number): Promise<Estudiante[]> => {
  await delay(500);
  if (acudienteId) {
    return estudiantesMock.filter(e => e.acudienteId === acudienteId);
  }
  return estudiantesMock;
};

export const getEstudiantesByCurso = async (cursoId: number): Promise<Estudiante[]> => {
  await delay(500);
  const curso = cursosMock.find(c => c.id === cursoId);
  if (!curso) return [];
  return estudiantesMock.filter(e => e.curso === curso.nombre);
};

// ============================================
// TAREAS
// ============================================

export const getTareas = async (cursoId?: number): Promise<Tarea[]> => {
  await delay(500);
  
  let tareas = tareasMock.map(t => ({
    ...t,
    categoria: categoriasMock.find(c => c.id === t.categoriaId)
  }));
  
  if (cursoId) {
    tareas = tareas.filter(t => t.cursoId === cursoId);
  }
  
  return tareas;
};

export const getTareaById = async (id: number): Promise<Tarea | null> => {
  await delay(300);
  const tarea = tareasMock.find(t => t.id === id);
  if (tarea) {
    return {
      ...tarea,
      categoria: categoriasMock.find(c => c.id === tarea.categoriaId)
    };
  }
  return null;
};

export const createTarea = async (data: Partial<Tarea>): Promise<Tarea> => {
  await delay(800);
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
    incluyeEnBoletin: data.incluyeEnBoletin ?? true,
    estado: 'activa'
  };
  
  // En producción esto iría al backend
  console.log('Mock: Tarea creada', newTarea);
  tareasMock.push(newTarea);
  
  return newTarea;
};

export const getTareasPendientesAcudiente = async (acudienteId: number): Promise<Tarea[]> => {
  await delay(500);
  
  // Obtener estudiantes del acudiente
  const estudiantes = estudiantesMock.filter(e => e.acudienteId === acudienteId);
  const cursosEstudiantes = estudiantes.map(e => e.curso);
  
  // Obtener IDs de cursos
  const cursoIds = cursosMock
    .filter(c => cursosEstudiantes.includes(c.nombre))
    .map(c => c.id);
  
  // Obtener tareas de esos cursos
  const tareas = tareasMock
    .filter(t => cursoIds.includes(t.cursoId) && t.estado === 'activa')
    .map(t => ({
      ...t,
      categoria: categoriasMock.find(c => c.id === t.categoriaId)
    }));
  
  // Filtrar las que ya tienen entrega
  const entregasAcudiente = entregasMock.filter(e => e.acudienteId === acudienteId);
  const tareasEntregadas = entregasAcudiente.map(e => e.tareaId);
  
  return tareas.filter(t => !tareasEntregadas.includes(t.id));
};

export const getTareasByDocente = async (docenteId: number): Promise<Tarea[]> => {
  await delay(500);
  
  const tareas = tareasMock
    .filter(t => t.docenteId === docenteId)
    .map(t => ({
      ...t,
      categoria: categoriasMock.find(c => c.id === t.categoriaId),
      fechaLimite: t.fechaVencimiento // Alias para consistencia
    }));
  
  return tareas;
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

export const getEntregas = async (docenteId?: number): Promise<Entrega[]> => {
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
  data: { calificacion: number | string; retroalimentacion: string }
): Promise<Entrega> => {
  await delay(800);
  
  const entrega = entregasMock.find(e => e.id === entregaId);
  if (entrega) {
    entrega.calificacion = data.calificacion;
    entrega.retroalimentacion = data.retroalimentacion;
    entrega.estado = 'calificada';
  }
  
  console.log('Mock: Entrega calificada', entrega);
  return entrega!;
};

// ============================================
// CATEGORÍAS
// ============================================

export const getCategorias = async (): Promise<Categoria[]> => {
  await delay(300);
  return categoriasMock;
};

// ============================================
// CURSOS
// ============================================

export const getCursos = async (institucionId?: number): Promise<Curso[]> => {
  await delay(500);
  if (institucionId) {
    return cursosMock.filter(c => c.institucionId === institucionId);
  }
  return cursosMock;
};

export const getCursosByDocente = async (docenteId: number): Promise<Curso[]> => {
  await delay(500);
  // Por ahora retornar cursos donde es director
  return cursosMock.filter(c => c.docenteDirectorId === docenteId);
};

// ============================================
// INSTITUCIONES
// ============================================

export const getInstituciones = async (): Promise<Institucion[]> => {
  await delay(500);
  return institucionesMock;
};

// ============================================
// ESTADÍSTICAS
// ============================================

export const getEstadisticasDocente = async (docenteId: number) => {
  await delay(600);
  const tareasDocente = tareasMock.filter(t => t.docenteId === docenteId);
  const tareaIds = tareasDocente.map(t => t.id);
  const entregasDocente = entregasMock.filter(e => tareaIds.includes(e.tareaId));
  
  return {
    tareasActivas: tareasDocente.filter(t => t.estado === 'activa').length,
    entregasPorRevisar: entregasDocente.filter(e => e.estado === 'enviada').length,
    entregasCalificadas: entregasDocente.filter(e => e.estado === 'calificada').length,
    familiasTotales: 25, // Mock
    porcentajeParticipacion: 78
  };
};

export const getEstadisticasAcudiente = async (acudienteId: number) => {
  await delay(600);
  const entregas = entregasMock.filter(e => e.acudienteId === acudienteId);
  return {
    tareasPendientes: 3,
    entregasRecientes: entregas.length,
    promedioCalificacion: 4.2,
    estudiantes: estudiantesMock.filter(e => e.acudienteId === acudienteId).length
  };
};

export const getEstadisticasInstitucion = async (institucionId: number) => {
  await delay(700);
  return {
    docentesActivos: 15,
    estudiantesActivos: 320,
    cursosActivos: cursosMock.filter(c => c.institucionId === institucionId).length,
    tareasDelPeriodo: tareasMock.length,
    porcentajeParticipacion: 72
  };
};
