// ============================================
// DATOS MOCK - Cátedra de Familia
// ============================================

// Tipos de usuario
export type RolUsuario = 'acudiente' | 'docente_aula' | 'orientador' | 'coordinador' | 'rector' | 'admin';

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: RolUsuario;
  telefono: string;
  avatar?: string;
  institucion?: string;
}

export interface Estudiante {
  id: number;
  nombre: string;
  apellidos: string;
  curso: string;
  grado: string;
  institucion: string;
  acudienteId: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  color: string;
  icono: string;
}

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  categoriaId: number;
  categoria?: Categoria;
  frecuencia: 'semanal' | 'quincenal' | 'mensual' | 'unica';
  fechaInicio: string;
  fechaVencimiento: string;
  cursoId: number;
  docenteId: number;
  incluyeEnBoletin: boolean;
  estado: 'activa' | 'cerrada' | 'borrador';
}

export interface Entrega {
  id: number;
  tareaId: number;
  estudianteId: number;
  acudienteId: number;
  textoEvidencia: string;
  archivos: string[];
  fechaEntrega: string;
  estado: 'pendiente' | 'enviada' | 'calificada';
  calificacion?: number | string;
  retroalimentacion?: string;
}

export interface Curso {
  id: number;
  nombre: string;
  grado: string;
  institucionId: number;
  docenteDirectorId?: number;
}

export interface Institucion {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  rectorId?: number;
}

// ============================================
// DATOS MOCK
// ============================================

export const usuariosMock: Record<string, Usuario> = {
  acudiente: { 
    id: 1, 
    nombre: "María", 
    apellidos: "López Hernández",
    correo: "maria@test.com", 
    rol: "acudiente",
    telefono: "3101234567",
    avatar: undefined
  },
  docente: { 
    id: 2, 
    nombre: "Carlos", 
    apellidos: "García Mendoza",
    correo: "garcia@docente.com", 
    rol: "docente_aula",
    telefono: "3109876543",
    institucion: "I.E. Occidente de Popayán"
  },
  orientador: { 
    id: 3, 
    nombre: "Diana", 
    apellidos: "Pérez Castro",
    correo: "perez@docente.com", 
    rol: "orientador",
    telefono: "3105551234",
    institucion: "I.E. Occidente de Popayán"
  },
  coordinador: { 
    id: 4, 
    nombre: "Roberto", 
    apellidos: "Ruiz Vargas",
    correo: "ruiz@docente.com", 
    rol: "coordinador",
    telefono: "3107778899",
    institucion: "I.E. Occidente de Popayán"
  },
  rector: { 
    id: 5, 
    nombre: "Fernando", 
    apellidos: "Gómez Jiménez",
    correo: "gomez@docente.com", 
    rol: "rector",
    telefono: "3102223344",
    institucion: "I.E. Occidente de Popayán"
  },
  admin: { 
    id: 6, 
    nombre: "Admin", 
    apellidos: "Sistema",
    correo: "admin@admin.com", 
    rol: "admin",
    telefono: "3100000000"
  }
};

export const estudiantesMock: Estudiante[] = [
  { id: 1, nombre: "Juan", apellidos: "López García", curso: "5° A", grado: "5°", institucion: "I.E. Occidente de Popayán", acudienteId: 1 },
  { id: 2, nombre: "Ana", apellidos: "López García", curso: "3° B", grado: "3°", institucion: "I.E. Occidente de Popayán", acudienteId: 1 },
  { id: 3, nombre: "Pedro", apellidos: "Martínez Ruiz", curso: "5° A", grado: "5°", institucion: "I.E. Occidente de Popayán", acudienteId: 7 },
  { id: 4, nombre: "Sofía", apellidos: "Rodríguez Pérez", curso: "4° B", grado: "4°", institucion: "I.E. Occidente de Popayán", acudienteId: 8 },
];

export const categoriasMock: Categoria[] = [
  { id: 1, nombre: "Lectura Familiar", color: "#2563EB", icono: "📚" },
  { id: 2, nombre: "Juegos", color: "#10B981", icono: "🎲" },
  { id: 3, nombre: "Conversación", color: "#8B5CF6", icono: "💬" },
  { id: 4, nombre: "Creatividad", color: "#F59E0B", icono: "🎨" },
  { id: 5, nombre: "Cocina", color: "#EF4444", icono: "🍳" },
  { id: 6, nombre: "Deporte", color: "#06B6D4", icono: "⚽" },
  { id: 7, nombre: "Cultura", color: "#EC4899", icono: "🎭" },
  { id: 8, nombre: "Reflexión", color: "#6366F1", icono: "🧘" },
];

export const cursosMock: Curso[] = [
  { id: 1, nombre: "Preescolar A", grado: "Preescolar", institucionId: 1, docenteDirectorId: 2 },
  { id: 2, nombre: "1° A", grado: "1°", institucionId: 1, docenteDirectorId: 2 },
  { id: 3, nombre: "2° A", grado: "2°", institucionId: 1 },
  { id: 4, nombre: "3° A", grado: "3°", institucionId: 1 },
  { id: 5, nombre: "3° B", grado: "3°", institucionId: 1 },
  { id: 6, nombre: "4° A", grado: "4°", institucionId: 1 },
  { id: 7, nombre: "4° B", grado: "4°", institucionId: 1 },
  { id: 8, nombre: "5° A", grado: "5°", institucionId: 1, docenteDirectorId: 2 },
  { id: 9, nombre: "5° B", grado: "5°", institucionId: 1 },
];

export const tareasMock: Tarea[] = [
  { 
    id: 1, 
    titulo: "Leer cuento en familia", 
    descripcion: "Elijan un cuento corto y léanlo juntos. Después, conversen sobre la historia: ¿Qué les gustó más? ¿Qué aprendieron?",
    categoriaId: 1,
    frecuencia: "semanal",
    fechaInicio: "2025-12-01",
    fechaVencimiento: "2025-12-15", 
    cursoId: 8,
    docenteId: 2,
    incluyeEnBoletin: true,
    estado: "activa"
  },
  { 
    id: 2, 
    titulo: "Juego de mesa familiar", 
    descripcion: "Organicen una tarde de juegos de mesa en familia. Pueden ser cartas, dominó, parqués o cualquier juego que tengan en casa.",
    categoriaId: 2,
    frecuencia: "quincenal",
    fechaInicio: "2025-12-05",
    fechaVencimiento: "2025-12-20", 
    cursoId: 8,
    docenteId: 2,
    incluyeEnBoletin: true,
    estado: "activa"
  },
  { 
    id: 3, 
    titulo: "Cocinar receta tradicional", 
    descripcion: "Preparen juntos una receta tradicional de su familia o región. Documenten el proceso con fotos.",
    categoriaId: 5,
    frecuencia: "mensual",
    fechaInicio: "2025-12-01",
    fechaVencimiento: "2025-12-10", 
    cursoId: 8,
    docenteId: 2,
    incluyeEnBoletin: true,
    estado: "activa"
  },
  { 
    id: 4, 
    titulo: "Conversación sobre el futuro", 
    descripcion: "Hablen en familia sobre los sueños y metas de cada miembro. ¿Qué quieren lograr? ¿Cómo pueden apoyarse?",
    categoriaId: 3,
    frecuencia: "unica",
    fechaInicio: "2025-12-08",
    fechaVencimiento: "2025-12-22", 
    cursoId: 8,
    docenteId: 2,
    incluyeEnBoletin: true,
    estado: "activa"
  },
  { 
    id: 5, 
    titulo: "Dibujo creativo", 
    descripcion: "Cada miembro de la familia dibuja algo que represente un momento feliz en familia. Luego comparten sus dibujos.",
    categoriaId: 4,
    frecuencia: "semanal",
    fechaInicio: "2025-12-01",
    fechaVencimiento: "2025-12-14", 
    cursoId: 5,
    docenteId: 2,
    incluyeEnBoletin: true,
    estado: "activa"
  },
];

export const entregasMock: Entrega[] = [
  {
    id: 1,
    tareaId: 3,
    estudianteId: 1,
    acudienteId: 1,
    textoEvidencia: "Preparamos sancocho con la abuela. Fue una tarde muy especial compartiendo recetas de familia.",
    archivos: ["/mock/evidencia1.jpg", "/mock/evidencia2.jpg"],
    fechaEntrega: "2025-12-08",
    estado: "enviada"
  },
  {
    id: 2,
    tareaId: 1,
    estudianteId: 1,
    acudienteId: 1,
    textoEvidencia: "Leímos 'El Principito' juntos. A Juan le encantó la parte del zorro.",
    archivos: ["/mock/evidencia3.jpg"],
    fechaEntrega: "2025-12-05",
    estado: "calificada",
    calificacion: 4.5,
    retroalimentacion: "Excelente trabajo familiar. Se nota el compromiso y la dedicación."
  },
  {
    id: 3,
    tareaId: 2,
    estudianteId: 3,
    acudienteId: 7,
    textoEvidencia: "Jugamos parqués toda la tarde. Muy divertido en familia.",
    archivos: [],
    fechaEntrega: "2025-12-07",
    estado: "pendiente"
  },
];

export const institucionesMock: Institucion[] = [
  { 
    id: 1, 
    nombre: "I.E. Occidente de Popayán", 
    direccion: "Calle 5 # 23-45, Popayán", 
    telefono: "3102223344",
    rectorId: 5
  },
  { 
    id: 2, 
    nombre: "I.E. Los Comuneros", 
    direccion: "Carrera 8 # 12-34, Popayán", 
    telefono: "3105556677"
  },
];

// ============================================
// OPCIONES PARA SELECTS
// ============================================

export const tiposDocumento = [
  { value: 'cedula', label: 'Cédula de ciudadanía' },
  { value: 'ti', label: 'Tarjeta de identidad' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'ce', label: 'Cédula de extranjería' },
];

export const parentescos = [
  { value: 'madre', label: 'Madre' },
  { value: 'padre', label: 'Padre' },
  { value: 'cuidador', label: 'Cuidador(a)' },
  { value: 'abuelo', label: 'Abuelo(a)' },
  { value: 'tio', label: 'Tío(a)' },
  { value: 'hermano', label: 'Hermano(a)' },
  { value: 'otro', label: 'Otro' },
];

export const tiposTrabajo = [
  { value: 'formal', label: 'Formal' },
  { value: 'informal', label: 'Informal' },
  { value: 'no_aplica', label: 'No aplica' },
];

export const nivelesEducativos = [
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'primaria_incompleta', label: 'Primaria incompleta' },
  { value: 'primaria_completa', label: 'Primaria completa' },
  { value: 'bachillerato_incompleto', label: 'Bachillerato incompleto' },
  { value: 'bachillerato_completo', label: 'Bachillerato completo' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'tecnologico', label: 'Tecnológico' },
  { value: 'profesional', label: 'Profesional' },
  { value: 'posgrado', label: 'Posgrado' },
];

export const rolesDocente = [
  { value: 'docente_aula', label: 'Docente de Aula' },
  { value: 'orientador', label: 'Orientador' },
  { value: 'coordinador', label: 'Coordinador' },
  { value: 'rector', label: 'Rector' },
];

export const grados = [
  { value: 'preescolar', label: 'Preescolar' },
  { value: '1', label: '1°' },
  { value: '2', label: '2°' },
  { value: '3', label: '3°' },
  { value: '4', label: '4°' },
  { value: '5', label: '5°' },
  { value: '6', label: '6°' },
  { value: '7', label: '7°' },
  { value: '8', label: '8°' },
  { value: '9', label: '9°' },
  { value: '10', label: '10°' },
  { value: '11', label: '11°' },
];

export const frecuencias = [
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual', label: 'Mensual' },
  { value: 'unica', label: 'Única' },
];

export const escalasCalificacion = {
  numerica: [0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
  cualitativa: [
    { value: 'superior', label: 'Superior', color: '#10B981' },
    { value: 'alto', label: 'Alto', color: '#3B82F6' },
    { value: 'basico', label: 'Básico', color: '#F59E0B' },
    { value: 'bajo', label: 'Bajo', color: '#EF4444' },
  ]
};
