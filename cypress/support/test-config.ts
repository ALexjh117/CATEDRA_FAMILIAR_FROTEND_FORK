/**
 * SUITE DE TESTING - CÁTEDRA DE FAMILIA
 * =====================================
 * 
 * Organización basada en las Historias Épicas documentadas:
 * 
 * FASE 1 - Estados de Carga (Componentes Base UI)
 * - LoadingSpinner: Indicador visual de carga en todas las vistas
 * - Button: Estados loading/disabled para operaciones async
 * 
 * FASE 2 - Validaciones de Formulario
 * - FormFieldInput: Validaciones de campos (HU-01 a HU-04)
 * - Modal: Comportamiento de modales de confirmación
 * - ConfirmModal: Modal de confirmación con acciones
 * 
 * FASE 3 - Autenticación (EP-02)
 * - HU-05: Iniciar sesión con credenciales + reCAPTCHA
 * - HU-06: Cambiar contraseña en primer ingreso (8+ chars, mayúscula, número, especial)
 * - HU-07: Cerrar sesión con confirmación
 * 
 * FASE 4 - Gestión Institucional (EP-01, EP-03)
 * - Formularios de registro
 * - Modales de confirmación
 * 
 * NOTA: Los tests están diseñados para mocks locales ya que
 * aún no hay consumo real de API backend.
 */

// Configuración global para los tests
export const TEST_CONFIG = {
  // Timeouts
  ANIMATION_DELAY: 300,
  TOAST_TIMEOUT: 3000,
  
  // Credenciales de prueba según HU-05
  MOCK_CREDENTIALS: {
    docente: { correo: 'docente@ie-ejemplo.edu.co', password: 'Password123!' },
    orientador: { correo: 'orientador@ie-ejemplo.edu.co', password: 'Password123!' },
    coordinador: { correo: 'coordinador@ie-ejemplo.edu.co', password: 'Password123!' },
    rector: { correo: 'rector@ie-ejemplo.edu.co', password: 'Password123!' },
    admin: { correo: 'admin@catedrafamilia.gov.co', password: 'AdminPass123!' },
    acudiente: { correo: 'acudiente@gmail.com', password: 'Password123!' },
  },
  
  // Roles según EP-02 (HU-05)
  ROLES: {
    admin_sistema: 'admin_sistema',
    rector: 'rector', 
    coordinador: 'coordinador',
    orientador: 'orientador',
    docente_aula: 'docente_aula',
    acudiente: 'acudiente',
  },
  
  // Rutas de redirección por rol (HU-05 criterios 5-8)
  REDIRECT_BY_ROLE: {
    admin_sistema: '/admin',
    rector: '/dashboard/rector',           // Panel de Gestión Institucional
    coordinador: '/dashboard/coordinador', // Panel de Matrícula y Cursos
    orientador: '/dashboard/orientador',   // Panel de Banco de Tareas
    docente_aula: '/dashboard/docente',    // Panel de Asignaciones y Calificaciones
    acudiente: '/app/familia',             // App móvil/web de familia
  },
  
  // Requisitos de contraseña (HU-06 - 8 caracteres mínimo)
  PASSWORD_REQUIREMENTS: {
    minLength: 8,           // Mínimo 8 caracteres
    requireUppercase: true, // Al menos una mayúscula
    requireNumber: true,    // Al menos un número
    requireSpecial: true,   // Al menos un carácter especial
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  },
  
  // Mensajes de error estandarizados
  ERROR_MESSAGES: {
    credencialesInvalidas: 'Correo o contraseña incorrectos',
    passwordNoCoincide: 'Las contraseñas no coinciden',
    passwordActualIncorrecta: 'La contraseña actual es incorrecta',
    passwordIgualAnterior: 'La nueva contraseña debe ser diferente a la actual',
    campoRequerido: 'Este campo es requerido',
    correoInvalido: 'Ingresa un correo electrónico válido',
    passwordRequisitos: {
      minLength: 'Mínimo 8 caracteres',
      uppercase: 'Al menos una mayúscula',
      number: 'Al menos un número',
      special: 'Al menos un carácter especial',
    },
  },
  
  // Mensajes de éxito
  SUCCESS_MESSAGES: {
    passwordCambiado: 'Contraseña actualizada correctamente',
    sesionCerrada: 'Sesión cerrada correctamente',
    loginExitoso: 'Bienvenido al sistema',
  },
};

// Datos mock basados en las épicas documentadas
export const MOCK_DATA = {
  usuario: {
    id: 1,
    nombre: 'Carlos',
    apellidos: 'García López',
    correo: 'docente@ie-ejemplo.edu.co',
    rol: 'docente_aula',
    telefono: '3001234567',
    activo: true,
    primerIngreso: false, // Renombrado de debe_cambiar_contrasena
  },
  
  usuarioNuevo: {
    id: 2,
    nombre: 'María',
    apellidos: 'Rodríguez',
    correo: 'maria@ie-ejemplo.edu.co',
    rol: 'docente_aula',
    telefono: '3009876543',
    activo: true,
    primerIngreso: true, // Primer ingreso - debe cambiar contraseña (HU-06)
  },
  
  institucion: {
    id: 1,
    nombre: 'I.E. Técnica Industrial',
    codigoDane: '12345678901',
    nit: '891234567-1',
    niveles: ['primaria', 'secundaria', 'media'],
    direccion: 'Calle 100 #10-20',
    ciudad: 'Bogotá',
  },
  
  curso: {
    id: 1,
    nombre: '5° A',
    gradoId: 5,
    jornada: 'mañana',
    cantidadEstudiantes: 32,
  },
  
  // Datos de auditoría (HU-05 criterio 9, HU-07 criterio 6)
  auditoria: {
    login: {
      action: 'login',
      requiredFields: ['userId', 'ip', 'userAgent', 'timestamp'],
    },
    logout: {
      action: 'logout',
      requiredFields: ['userId', 'ip', 'timestamp'],
    },
    cambioPassword: {
      action: 'password_change',
      requiredFields: ['userId', 'timestamp'],
    },
  },
  
  // JWT Token config (HU-05 criterio 10)
  jwt: {
    expiresIn: 86400, // 24 horas en segundos
    refreshTokenExpiresIn: 604800, // 7 días
  },
};
