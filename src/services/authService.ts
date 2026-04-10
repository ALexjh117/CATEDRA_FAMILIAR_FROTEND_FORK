// authService.ts - Servicio mejorado para autenticación y reset de contraseña

class AuthService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env?.VITE_API_URL || 'http://localhost:3333';
  }

  /**
   * Solicitar código de recuperación de contraseña
   */
  async solicitarRecuperacion(email: string) {
    console.log('[AuthService] Solicitando recuperación para:', email);
    
    try {
      const response = await fetch(`${this.baseURL}/password-reset/solicitar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          identifier: email,
          tipo: 'email'
        })
      });

      const data = await response.json();
      console.log('[AuthService] Respuesta solicitud recuperación:', data);
      return data;
    } catch (error) {
      console.error('[AuthService] Error solicitando recuperación:', error);
      throw error;
    }
  }

  /**
   * Verificar código OTP (opcional)
   */
  async verificarCodigo(codigo: string) {
    console.log('[AuthService] Verificando código:', codigo);
    
    try {
      const response = await fetch(`${this.baseURL}/password-reset/verificar-codigo`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          codigo,
          tipo: 'email'
        })
      });

      const data = await response.json();
      console.log('[AuthService] Respuesta verificación código:', data);
      return data;
    } catch (error) {
      console.error('[AuthService] Error verificando código:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña con código OTP
   */
  async cambiarContrasena(codigo: string, nuevaContrasena: string, confirmarContrasena?: string) {
    console.log('[AuthService] Cambiando contraseña:', {
      codigo,
      nuevaContrasenaLength: nuevaContrasena.length,
      hasSpaces: nuevaContrasena !== nuevaContrasena.trim()
    });
    
    try {
      const response = await fetch(`${this.baseURL}/password-reset/verificar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          codigo,
          nuevaContrasena,
          confirmarContrasena: confirmarContrasena || nuevaContrasena,
          tipo: 'email'
        })
      });

      const data = await response.json();
      console.log('[AuthService] Respuesta cambio contraseña:', data);
      return data;
    } catch (error) {
      console.error('[AuthService] Error cambiando contraseña:', error);
      throw error;
    }
  }

  /**
   * Login para docentes
   */
  async loginDocente(correo: string, contrasena: string) {
    console.log('[AuthService] Login docente:', { correo, contrasenaLength: contrasena.length });
    
    try {
      const response = await fetch(`${this.baseURL}/docentes/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo,
          contrasena
        })
      });

      const data = await response.json();
      console.log('[AuthService] Respuesta login docente:', data);
      return data;
    } catch (error) {
      console.error('[AuthService] Error login docente:', error);
      throw error;
    }
  }

  /**
   * Login para acudientes
   */
  async loginAcudiente(correo: string, contrasena: string) {
    console.log('[AuthService] Login acudiente:', { correo, contrasenaLength: contrasena.length });
    
    try {
      const response = await fetch(`${this.baseURL}/acudientes/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo,
          contrasena
        })
      });

      const data = await response.json();
      console.log('[AuthService] Respuesta login acudiente:', data);
      return data;
    } catch (error) {
      console.error('[AuthService] Error login acudiente:', error);
      throw error;
    }
  }

  /**
   * Login general (intenta múltiples roles)
   */
  async loginGeneral(correo: string, contrasena: string) {
    console.log('[AuthService] Login general:', { correo, contrasenaLength: contrasena.length });
    
    const results = [];
    
    // Intentar login como docente
    try {
      const docenteResult = await this.loginDocente(correo, contrasena);
      if (docenteResult.success) {
        console.log('[AuthService] Login exitoso como docente');
        return { ...docenteResult, role: 'docente' };
      }
      results.push({ role: 'docente', error: docenteResult.message });
    } catch (error) {
      results.push({ role: 'docente', error: 'Error de conexión' });
    }

    // Intentar login como acudiente
    try {
      const acudienteResult = await this.loginAcudiente(correo, contrasena);
      if (acudienteResult.success) {
        console.log('[AuthService] Login exitoso como acudiente');
        return { ...acudienteResult, role: 'acudiente' };
      }
      results.push({ role: 'acudiente', error: acudienteResult.message });
    } catch (error) {
      results.push({ role: 'acudiente', error: 'Error de conexión' });
    }

    // Si ninguno funcionó, devolver errores combinados
    console.log('[AuthService] Login fallido en todos los roles:', results);
    return {
      success: false,
      message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
      errors: results
    };
  }

  /**
   * Validar formato de email
   */
  validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar fortaleza de contraseña
   */
  validarFortalezaContrasena(contrasena: string): {
    esValida: boolean;
    mensaje: string;
    puntaje: number;
  } {
    let puntaje = 0;
    const mensajes = [];

    // Longitud mínima
    if (contrasena.length >= 6) {
      puntaje += 1;
    } else {
      mensajes.push('mínimo 6 caracteres');
    }

    // Letras mayúsculas
    if (/[A-Z]/.test(contrasena)) {
      puntaje += 1;
    } else {
      mensajes.push('una mayúscula');
    }

    // Letras minúsculas
    if (/[a-z]/.test(contrasena)) {
      puntaje += 1;
    } else {
      mensajes.push('una minúscula');
    }

    // Números
    if (/\d/.test(contrasena)) {
      puntaje += 1;
    } else {
      mensajes.push('un número');
    }

    // Caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(contrasena)) {
      puntaje += 1;
    } else {
      mensajes.push('un carácter especial');
    }

    return {
      esValida: contrasena.length >= 6,
      mensaje: mensajes.length > 0 ? `Falta: ${mensajes.join(', ')}` : 'Contraseña fuerte',
      puntaje
    };
  }

  /**
   * Generar código OTP para desarrollo
   */
  generarCodigoOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Formatear mensaje de error
   */
  formatearError(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'Error desconocido. Inténtalo de nuevo.';
  }

  /**
   * Limpiar espacios en blanco de contraseña
   */
  limpiarContrasena(contrasena: string): string {
    const limpiada = contrasena.trim();
    console.log('[AuthService] Contraseña limpiada:', {
      original: contrasena,
      limpiada: limpiada,
      espaciosEliminados: contrasena !== limpiada
    });
    return limpiada;
  }
}

// Exportar instancia única
export default new AuthService();
