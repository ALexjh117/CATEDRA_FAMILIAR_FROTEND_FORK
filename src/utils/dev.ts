// Util para modo de desarrollo: permitir desactivar validaciones localmente.
// Prioridad: localStorage 'bypassValidations' -> env VITE_BYPASS_VALIDATIONS
export function isBypassValidationsEnabled(): boolean {
  try {
    const ls = window?.localStorage?.getItem('bypassValidations');
    if (ls === 'true') return true;
    if (ls === 'false') return false;
  } catch (e) {
    // ignore
  }

  // Vite env vars están accesibles en import.meta.env
  // @ts-ignore
  const env = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  if (env && env.VITE_BYPASS_VALIDATIONS === 'true') return true;

  return false;
}

export function enableBypassValidationsForSession(enable = true) {
  try { window.localStorage.setItem('bypassValidations', enable ? 'true' : 'false'); } catch (e) {}
}
