// ============================================
// API ENDPOINTS - Cátedra de Familia
// Por ahora retorna datos mock, después será fetch real
// ============================================

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

export const login = async (correo: string, _password: string): Promise<{ success: boolean; user?: Usuario; error?: string }> => {
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
// TAREAS
// ============================================

export const getTareas = async (cursoId?: number, busqueda?: string): Promise<Tarea[]> => {
  await delay(500);
  
  let tareas = tareasMock.map(t => ({
    ...t,
    categoria: categoriasMock.find(c => c.id === t.categoriaId)
  }));
  
  if (cursoId) {
    tareas = tareas.filter(t => t.cursoId === cursoId);
  }
  
  // Búsqueda por título o descripción
  if (busqueda) {
    const searchLower = busqueda.toLowerCase();
    tareas = tareas.filter(t => 
      t.titulo.toLowerCase().includes(searchLower) ||
      t.descripcion.toLowerCase().includes(searchLower)
    );
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

export const getTareasPendientesAcudiente = async (acudienteId: number): Promise<Tarea[]> => {
  await delay(500);
  
  // Obtener estudiantes del acudiente
  const vinculos = estudiantesAcudientesMock.filter(v => v.acudienteId === acudienteId);
  const estudiantesIds = vinculos.map(v => v.estudianteId);
  const estudiantes = estudiantesMock.filter(e => estudiantesIds.includes(e.id));
  const cursoIds = estudiantes.map(e => e.cursoId);
  
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
// CATEGORÍAS - CRUD COMPLETO
// ============================================

export const getCategorias = async (institucionId?: number): Promise<Categoria[]> => {
  await delay(300);
  let categorias = [...categoriasMock];
  
  if (institucionId) {
    categorias = categorias.filter(c => !c.institucionId || c.institucionId === institucionId);
  }
  
  return categorias;
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
// INSTITUCIONES - CRUD COMPLETO
// ============================================

export const getInstituciones = async (): Promise<Institucion[]> => {
  await delay(500);
  return institucionesMock.filter(i => !i.eliminado_en);
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
// PERIODOS - CRUD COMPLETO
// ============================================

export const getPeriodos = async (institucionId?: number): Promise<Periodo[]> => {
  await delay(500);
  if (institucionId) {
    return periodosMock.filter(p => p.institucionId === institucionId);
  }
  return periodosMock;
};

export const getPeriodoActivo = async (institucionId: number): Promise<Periodo | null> => {
  await delay(300);
  return periodosMock.find(p => p.institucionId === institucionId && p.estado === 'activo') || null;
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
// GRADOS - CRUD COMPLETO
// ============================================

export const getGrados = async (institucionId?: number): Promise<Grado[]> => {
  await delay(400);
  if (institucionId) {
    return gradosMock.filter(g => g.institucionId === institucionId && g.activo).sort((a, b) => a.orden - b.orden);
  }
  return gradosMock.filter(g => g.activo).sort((a, b) => a.orden - b.orden);
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
// CURSOS - CRUD COMPLETO
// ============================================

export const getCursos = async (institucionId?: number): Promise<Curso[]> => {
  await delay(500);
  if (institucionId) {
    return cursosMock.filter(c => c.institucionId === institucionId && c.activo);
  }
  return cursosMock.filter(c => c.activo);
};

export const getCursoById = async (id: number): Promise<Curso | null> => {
  await delay(300);
  return cursosMock.find(c => c.id === id && c.activo) || null;
};

export const getCursosByDocente = async (docenteId: number): Promise<Curso[]> => {
  await delay(500);
  return cursosMock.filter(c => c.docenteDirectorId === docenteId && c.activo);
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
  await delay(500);
  let usuarios = usuariosListMock.filter(u => u.activo && !u.deletedAt);
  
  if (institucionId) {
    usuarios = usuarios.filter(u => u.institucionId === institucionId || u.rol === 'admin');
  }
  
  if (rol) {
    usuarios = usuarios.filter(u => u.rol === rol);
  }
  
  return usuarios;
};

export const getUsuarioById = async (id: number): Promise<Usuario | null> => {
  await delay(300);
  return usuariosListMock.find(u => u.id === id && !u.deletedAt) || null;
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
  await delay(500);
  let estudiantes = estudiantesMock.filter(e => e.activo && !e.deletedAt);
  
  if (institucionId) {
    estudiantes = estudiantes.filter(e => e.institucionId === institucionId);
  }
  
  if (cursoId) {
    estudiantes = estudiantes.filter(e => e.cursoId === cursoId);
  }
  
  return estudiantes;
};

export const getEstudianteById = async (id: number): Promise<Estudiante | null> => {
  await delay(300);
  return estudiantesMock.find(e => e.id === id && !e.deletedAt) || null;
};

export const getEstudiantesByCurso = async (cursoId: number): Promise<Estudiante[]> => {
  await delay(500);
  return estudiantesMock.filter(e => e.cursoId === cursoId && e.activo && !e.deletedAt);
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
    // @ts-ignore
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
  _contrasenaNueva: string
): Promise<{ success: boolean; error?: string }> => {
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
};

// ============================================
// ESTADÍSTICAS RECTOR
// ============================================

export async function getEstadisticasRector(): Promise<any> {
  // Simular delay de API
  await delay(800);
  
  const usuarios = usuariosListMock;
  const instituciones = institucionesMock;
  const cursos = cursosMock;
  const tareas = tareasMock;

  return {
    totalInstituciones: instituciones.length,
    totalUsuarios: usuarios.length,
    totalDocentes: usuarios.filter(u => u.rol === 'docente_aula').length,
    totalAcudientes: usuarios.filter(u => u.rol === 'acudiente').length,
    totalCursos: cursos.length,
    totalTareas: tareas.length,
    tareasCompletadas: tareas.filter(t => t.estado === 'completada').length,
    participacionPromedio: Math.round((tareas.filter(t => t.estado === 'completada').length / Math.max(tareas.length, 1)) * 100)
  };
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

