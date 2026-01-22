// Util para modo de desarrollo: permitir desactivar validaciones localmente.
// DESHABILITADO: Ahora siempre se usa el backend real, sin datos mock
export function isBypassValidationsEnabled(): boolean {
  // Siempre retorna false - usar backend real
  return false;
}

export function enableBypassValidationsForSession(enable = true) {
  // Deshabilitado - no se permite activar bypass
  console.warn('Bypass de validaciones está deshabilitado. Solo se usan datos del backend.');
}
