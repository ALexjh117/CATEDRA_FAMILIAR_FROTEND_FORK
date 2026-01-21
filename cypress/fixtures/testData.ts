/**
 * FIXTURES DE DATOS DE PRUEBA
 * ===========================
 * 
 * Datos mock alineados con las Historias de Usuario (HU-01 a HU-38)
 * y las épicas definidas en 04_historias_usuario.md
 * 
 * Épicas cubiertas:
 * - EP-01: Registro de Instituciones Educativas
 * - EP-02: Gestión de Usuarios Administrativos
 * - EP-03: Matrícula y Configuración de Cursos
 * - EP-04: Gestión del Banco de Tareas
 * - EP-05: Asignación y Seguimiento de Tareas
 * - EP-06: Participación de Acudientes y Estudiantes
 */

// ============================================================================
// TIPOS Y ENUMS
// ============================================================================

export type RolUsuario = 
  | 'admin_sistema'
  | 'rector'
  | 'coordinador'
  | 'orientador'
  | 'docente_aula'
  | 'acudiente';

export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'vencida';
export type FrecuenciaTarea = 'unica' | 'semanal' | 'quincenal' | 'mensual';
export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'RC' | 'NIT';
export type EstadoCalificacion = 'pendiente' | 'aprobada' | 'rechazada' | 'requiere_mejora';

// ============================================================================
// EP-01: REGISTRO DE INSTITUCIONES EDUCATIVAS
// ============================================================================

export const mockInstitucion = {
  id: 1,
  nombre: 'Institución Educativa Ejemplo',
  codigoDane: '123456789012',
  nit: '900123456-1',
  direccion: 'Calle 100 #10-20, Bogotá',
  telefono: '6011234567',
  correoContacto: 'contacto@ie-ejemplo.edu.co',
  ciudadId: 1,
  departamentoId: 11,
  estado: 'activa' as const,
  fechaRegistro: '2026-01-01',
  activo: true
};

export const mockSecretariaEducacion = {
  id: 1,
  nombre: 'Secretaría de Educación de Bogotá',
  codigoEntidad: 'SED-BOG-001',
  ciudadId: 1,
  departamentoId: 11,
  estado: 'activa' as const
};

// ============================================================================
// EP-02: GESTIÓN DE USUARIOS ADMINISTRATIVOS
// ============================================================================

// Mock de usuario base
export const mockUsuario = {
  id: 1,
  nombre: 'Juan',
  apellidos: 'Pérez García',
  correo: 'juan.perez@ie-ejemplo.edu.co',
  rol: 'docente_aula' as RolUsuario,
  telefono: '3001234567',
  documento: '1234567890',
  tipoDocumento: 'CC' as TipoDocumento,
  institucionId: 1,
  primerIngreso: false,
  activo: true,
  fechaCreacion: '2026-01-01'
};

// Usuarios por rol (HU-05: Login según rol)
export const mockUsuariosPorRol: Record<RolUsuario, typeof mockUsuario> = {
  admin_sistema: {
    ...mockUsuario,
    id: 100,
    nombre: 'Admin',
    apellidos: 'Sistema',
    correo: 'admin@catedrafamilia.gov.co',
    rol: 'admin_sistema',
    institucionId: 0 // Admin no pertenece a institución
  },
  rector: {
    ...mockUsuario,
    id: 1,
    nombre: 'Roberto',
    apellidos: 'Rector Mendoza',
    correo: 'rector@ie-ejemplo.edu.co',
    rol: 'rector'
  },
  coordinador: {
    ...mockUsuario,
    id: 2,
    nombre: 'Camila',
    apellidos: 'Coordinadora López',
    correo: 'coordinador@ie-ejemplo.edu.co',
    rol: 'coordinador'
  },
  orientador: {
    ...mockUsuario,
    id: 3,
    nombre: 'Oscar',
    apellidos: 'Orientador Ruiz',
    correo: 'orientador@ie-ejemplo.edu.co',
    rol: 'orientador'
  },
  docente_aula: {
    ...mockUsuario,
    id: 4,
    nombre: 'Diana',
    apellidos: 'Docente Martínez',
    correo: 'docente@ie-ejemplo.edu.co',
    rol: 'docente_aula'
  },
  acudiente: {
    ...mockUsuario,
    id: 5,
    nombre: 'Pedro',
    apellidos: 'Acudiente García',
    correo: 'acudiente@gmail.com',
    rol: 'acudiente',
    telefono: '3109876543'
  }
};

// Credenciales de prueba (HU-05, HU-06)
export const mockCredenciales = {
  validas: {
    correo: 'docente@ie-ejemplo.edu.co',
    password: 'Password123!'
  },
  invalidas: {
    correo: 'noexiste@correo.com',
    password: 'incorrecta'
  },
  primerIngreso: {
    correo: 'nuevo@ie-ejemplo.edu.co',
    password: 'TempPassword1!' // Contraseña temporal que debe cambiar
  }
};

// Requisitos de contraseña (HU-06: 8 caracteres mínimo)
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Contraseñas de prueba para validación
export const mockPasswords = {
  valida: 'Password123!',
  sinMayuscula: 'password123!',
  sinNumero: 'Password!!!',
  sinEspecial: 'Password123',
  muyCorta: 'Pass1!',
  soloNumeros: '12345678',
  soloLetras: 'abcdefgh'
};

// ============================================================================
// EP-03: MATRÍCULA Y CONFIGURACIÓN DE CURSOS
// ============================================================================

export const mockGrado = {
  id: 5,
  nombre: '5° Primaria',
  nivel: 'Primaria',
  orden: 5
};

export const mockCurso = {
  id: 1,
  nombre: '5° Primaria - A',
  codigo: '5A-2026',
  gradoId: 5,
  grado: mockGrado,
  institucionId: 1,
  docenteId: 4,
  anioLectivo: 2026,
  cantidadEstudiantes: 32,
  activo: true
};

export const mockCursos = [
  mockCurso,
  { ...mockCurso, id: 2, nombre: '5° Primaria - B', codigo: '5B-2026' },
  { ...mockCurso, id: 3, nombre: '6° Bachillerato - A', codigo: '6A-2026', gradoId: 6 }
];

export const mockEstudiante = {
  id: 1,
  nombre: 'María',
  apellidos: 'López Ruiz',
  documento: '1234567890',
  tipoDocumento: 'TI' as TipoDocumento,
  cursoId: 1,
  institucionId: 1,
  acudienteId: 5,
  fechaNacimiento: '2015-05-15',
  activo: true
};

export const mockEstudiantes = [
  mockEstudiante,
  { ...mockEstudiante, id: 2, nombre: 'Carlos', apellidos: 'Gómez Pérez', documento: '0987654321' },
  { ...mockEstudiante, id: 3, nombre: 'Ana', apellidos: 'Rodríguez Silva', documento: '1122334455' }
];

// ============================================================================
// EP-04: GESTIÓN DEL BANCO DE TAREAS
// ============================================================================

export const mockCategoria = {
  id: 1,
  nombre: 'Comunicación Familiar',
  descripcion: 'Tareas que fomentan la comunicación entre padres e hijos',
  color: '#3B82F6',
  icono: '💬',
  activa: true
};

export const mockCategorias = [
  mockCategoria,
  { id: 2, nombre: 'Valores y Principios', descripcion: 'Formación en valores', color: '#10B981', icono: '⭐', activa: true },
  { id: 3, nombre: 'Recreación y Tiempo Libre', descripcion: 'Actividades recreativas', color: '#F59E0B', icono: '🎮', activa: true },
  { id: 4, nombre: 'Apoyo Académico', descripcion: 'Acompañamiento escolar', color: '#8B5CF6', icono: '📚', activa: true },
  { id: 5, nombre: 'Salud y Bienestar', descripcion: 'Hábitos saludables', color: '#EF4444', icono: '❤️', activa: true }
];

export const mockTareaBanco = {
  id: 1,
  titulo: 'Conversación familiar',
  descripcion: 'Realiza una conversación de 15 minutos sobre el día de cada miembro de la familia',
  instrucciones: '1. Reúnanse en familia\n2. Cada uno comparte algo positivo\n3. Escuchen sin interrumpir',
  categoriaId: 1,
  categoria: mockCategoria,
  creadoPor: 3, // Orientador
  estado: 'aprobada' as const,
  esPlantilla: true,
  fechaCreacion: '2026-01-10',
  activa: true
};

export const mockTareasBanco = [
  mockTareaBanco,
  { ...mockTareaBanco, id: 2, titulo: 'Lectura compartida', categoriaId: 4, descripcion: 'Lean juntos un cuento o libro por 20 minutos' },
  { ...mockTareaBanco, id: 3, titulo: 'Juego en familia', categoriaId: 3, descripcion: 'Practiquen un juego de mesa o actividad al aire libre' }
];

// ============================================================================
// EP-05: ASIGNACIÓN Y SEGUIMIENTO DE TAREAS
// ============================================================================

export const mockTarea = {
  id: 1,
  titulo: 'Tarea de prueba',
  descripcion: 'Descripción de la tarea de prueba',
  instrucciones: 'Instrucciones detalladas de la tarea',
  categoriaId: 1,
  categoria: mockCategoria,
  frecuencia: 'semanal' as FrecuenciaTarea,
  fechaInicio: '2026-01-15',
  fechaVencimiento: '2026-01-25',
  fechaCreacion: '2026-01-15',
  fechaLimite: '2026-01-25',
  cursoId: 1,
  curso: mockCurso,
  docenteId: 4,
  incluyeEnBoletin: true,
  requiereEvidencia: true,
  tipoEvidencia: 'foto' as const,
  porcentajeCompletado: 0,
  activo: true,
  estado: 'pendiente' as EstadoTarea
};

export const mockTareas = [
  mockTarea,
  { ...mockTarea, id: 2, titulo: 'Tarea completada', estado: 'completada' as EstadoTarea, porcentajeCompletado: 100 },
  { ...mockTarea, id: 3, titulo: 'Tarea en progreso', estado: 'en_progreso' as EstadoTarea, porcentajeCompletado: 50 },
  { ...mockTarea, id: 4, titulo: 'Tarea vencida', estado: 'vencida' as EstadoTarea, fechaVencimiento: '2026-01-01' }
];

// ============================================================================
// EP-06: PARTICIPACIÓN DE ACUDIENTES Y ESTUDIANTES
// ============================================================================

export const mockEntregaTarea = {
  id: 1,
  tareaId: 1,
  estudianteId: 1,
  acudienteId: 5,
  fechaEntrega: '2026-01-20',
  comentario: 'Realizamos la actividad en familia',
  evidenciaUrl: '/uploads/evidencias/tarea-1-estudiante-1.jpg',
  estado: 'pendiente' as EstadoCalificacion,
  calificacion: null as number | null,
  retroalimentacion: null as string | null
};

export const mockEntregasTarea = [
  mockEntregaTarea,
  { ...mockEntregaTarea, id: 2, estudianteId: 2, estado: 'aprobada' as EstadoCalificacion, calificacion: 5.0, retroalimentacion: 'Excelente trabajo' },
  { ...mockEntregaTarea, id: 3, estudianteId: 3, estado: 'requiere_mejora' as EstadoCalificacion, calificacion: 3.0, retroalimentacion: 'Falta más detalle' }
];

export const mockNotificacion = {
  id: 1,
  usuarioId: 5,
  titulo: 'Nueva tarea asignada',
  mensaje: 'Se ha asignado una nueva tarea: Conversación familiar',
  tipo: 'tarea_nueva' as const,
  leida: false,
  fechaCreacion: '2026-01-15T10:00:00Z',
  urlDestino: '/tareas/1'
};

export const mockNotificaciones = [
  mockNotificacion,
  { ...mockNotificacion, id: 2, titulo: 'Tarea calificada', mensaje: 'Tu tarea ha sido calificada', tipo: 'calificacion' as const },
  { ...mockNotificacion, id: 3, titulo: 'Recordatorio', mensaje: 'Tarea próxima a vencer', tipo: 'recordatorio' as const }
];

// ============================================================================
// MOCK DE RESPUESTAS API
// ============================================================================

export const mockLoginResponse = {
  success: {
    statusCode: 200,
    body: {
      success: true,
      user: mockUsuariosPorRol.docente_aula,
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token',
      expiresIn: 86400, // 24 horas
      refreshToken: 'refresh_token_mock'
    }
  },
  invalidCredentials: {
    statusCode: 401,
    body: {
      success: false,
      error: 'Correo o contraseña incorrectos'
    }
  },
  primerIngreso: {
    statusCode: 200,
    body: {
      success: true,
      user: { ...mockUsuariosPorRol.docente_aula, primerIngreso: true },
      token: 'temp_token',
      requirePasswordChange: true
    }
  }
};

export const mockLogoutResponse = {
  success: {
    statusCode: 200,
    body: {
      success: true,
      message: 'Sesión cerrada correctamente'
    }
  }
};

export const mockCambioPasswordResponse = {
  success: {
    statusCode: 200,
    body: {
      success: true,
      message: 'Contraseña actualizada correctamente'
    }
  },
  passwordActualIncorrecta: {
    statusCode: 400,
    body: {
      success: false,
      error: 'La contraseña actual es incorrecta'
    }
  },
  passwordIgual: {
    statusCode: 400,
    body: {
      success: false,
      error: 'La nueva contraseña debe ser diferente a la actual'
    }
  }
};

// ============================================================================
// RUTAS Y CONFIGURACIÓN
// ============================================================================

export const REDIRECT_BY_ROLE: Record<RolUsuario, string> = {
  admin_sistema: '/admin',
  rector: '/dashboard/rector',
  coordinador: '/dashboard/coordinador',
  orientador: '/dashboard/orientador',
  docente_aula: '/dashboard/docente',
  acudiente: '/app/familia'
};

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    cambiarPassword: '/api/auth/cambiar-password',
    recuperarPassword: '/api/auth/recuperar-password'
  },
  usuarios: '/api/usuarios',
  instituciones: '/api/instituciones',
  cursos: '/api/cursos',
  estudiantes: '/api/estudiantes',
  tareas: '/api/tareas',
  categorias: '/api/categorias',
  entregas: '/api/entregas',
  notificaciones: '/api/notificaciones'
};
