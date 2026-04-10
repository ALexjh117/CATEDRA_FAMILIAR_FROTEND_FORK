/**
 * Utilidades para generar y manejar slugs amigables
 */

/**
 * Convierte un nombre completo a un slug amigable para URLs
 * Ej: "Juan Pérez García" -> "juan-perez-garcia"
 */
export function createSlugFromName(nombre: string, apellido?: string): string {
  const fullName = apellido ? `${nombre} ${apellido}` : nombre;
  return fullName
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remueve diacríticos
    .replace(/[^a-z0-9\s-]/g, '') // Remueve caracteres especiales
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/-+/g, '-') // Remueve guiones múltiples
    .trim();
}

/**
 * Crea un slug único para un estudiante usando su nombre y un identificador único
 * Ej: "juan-perez-13" o "maria-gonzalez-45"
 */
export function createStudentSlug(estudiante: { id: number; nombres?: string; apellidos?: string }): string {
  const nombre = estudiante.nombres || `estudiante`;
  const slugBase = createSlugFromName(nombre, estudiante.apellidos);
  return `${slugBase}-${estudiante.id}`;
}

/**
 * Extrae el ID del estudiante desde un slug
 * Ej: "juan-perez-13" -> 13
 */
export function extractStudentIdFromSlug(slug: string): number {
  const parts = slug.split('-');
  const idPart = parts[parts.length - 1];
  const id = Number(idPart);
  return id && !Number.isNaN(id) ? id : 0;
}

/**
 * Formatea el nombre para mostrar de forma amigable
 * Ej: "juan-perez-13" -> "Juan Pérez"
 */
export function formatStudentDisplayName(slug: string, estudiantes: Array<{ id: number; nombres?: string; apellidos?: string }>): string {
  const studentId = extractStudentIdFromSlug(slug);
  const student = estudiantes.find(e => e.id === studentId);
  
  if (!student) return slug;
  
  const nombres = student.nombres || '';
  const apellidos = student.apellidos || '';
  
  if (nombres && apellidos) {
    return `${nombres} ${apellidos}`;
  } else if (nombres) {
    return nombres;
  } else {
    return `Estudiante #${studentId}`;
  }
}
