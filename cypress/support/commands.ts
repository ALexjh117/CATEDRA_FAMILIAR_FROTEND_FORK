// ***********************************************
// Comandos personalizados de Cypress
// Alineados con HU-05, HU-06, HU-07
// ***********************************************

import { TEST_CONFIG } from './test-config';

// =============================================================================
// COMANDOS DE AUTENTICACIÓN (HU-05, HU-06, HU-07)
// =============================================================================

/**
 * Login completo con reCAPTCHA
 * HU-05: Inicio de sesión con credenciales
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=recaptcha]').click(); // Resolver reCAPTCHA
  cy.get('[data-cy=login-button]').click();
});

/**
 * Login rápido sin UI (setea token directamente)
 * Útil para tests que no son de autenticación
 */
Cypress.Commands.add('loginByToken', (role: keyof typeof TEST_CONFIG.MOCK_CREDENTIALS) => {
  const credentials = TEST_CONFIG.MOCK_CREDENTIALS[role];
  const mockUser = {
    id: 1,
    correo: credentials.correo,
    rol: role,
    nombre: 'Test User',
    primerIngreso: false,
  };
  
  window.localStorage.setItem('auth_token', 'mock_jwt_token_' + role);
  window.localStorage.setItem('user_data', JSON.stringify(mockUser));
});

/**
 * Logout del sistema
 * HU-07: Cerrar sesión
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=user-menu-button]').click();
  cy.get('[data-cy=logout-button]').click();
  cy.get('[data-cy=logout-confirm-button]').click();
});

/**
 * Limpiar sesión (sin UI)
 */
Cypress.Commands.add('clearSession', () => {
  window.localStorage.removeItem('auth_token');
  window.localStorage.removeItem('user_data');
  window.localStorage.removeItem('refresh_token');
});

/**
 * Verificar que el usuario está autenticado
 */
Cypress.Commands.add('shouldBeAuthenticated', () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem('auth_token')).to.not.be.null;
  });
});

/**
 * Verificar que el usuario NO está autenticado
 */
Cypress.Commands.add('shouldNotBeAuthenticated', () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem('auth_token')).to.be.null;
  });
});

// =============================================================================
// COMANDOS DE VALIDACIÓN DE CONTRASEÑA (HU-06)
// =============================================================================

/**
 * Verificar checklist de requisitos de contraseña
 * HU-06: Cambio de contraseña con requisitos
 */
Cypress.Commands.add('checkPasswordRequirements', (password: string) => {
  const req = TEST_CONFIG.PASSWORD_REQUIREMENTS;
  
  const hasMinLength = password.length >= req.minLength;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
  
  return cy.wrap({
    isValid: hasMinLength && hasUppercase && hasNumber && hasSpecial,
    checks: { hasMinLength, hasUppercase, hasNumber, hasSpecial }
  });
});

/**
 * Llenar formulario de cambio de contraseña
 */
Cypress.Commands.add('fillPasswordChangeForm', (currentPassword: string, newPassword: string, confirmPassword: string) => {
  cy.get('[data-cy=current-password]').clear().type(currentPassword);
  cy.get('[data-cy=new-password]').clear().type(newPassword);
  cy.get('[data-cy=confirm-password]').clear().type(confirmPassword);
});

// =============================================================================
// COMANDOS DE UI Y FEEDBACK
// =============================================================================

/**
 * Verificar toast de notificación
 */
Cypress.Commands.add('checkToast', (message: string) => {
  cy.get('[data-cy=toast]').should('contain', message);
});

/**
 * Esperar a que desaparezca el loader
 */
Cypress.Commands.add('waitForLoader', () => {
  cy.get('[data-cy=loading-spinner]').should('not.exist');
});

/**
 * Verificar mensaje de error en formulario
 */
Cypress.Commands.add('checkFormError', (fieldName: string, errorMessage: string) => {
  cy.get(`[data-cy=${fieldName}-error]`).should('contain', errorMessage);
});

/**
 * Verificar que un modal está visible
 */
Cypress.Commands.add('modalShouldBeVisible', (modalCy: string) => {
  cy.get(`[data-cy=${modalCy}]`).should('be.visible');
});

/**
 * Verificar que un modal NO está visible
 */
Cypress.Commands.add('modalShouldNotExist', (modalCy: string) => {
  cy.get(`[data-cy=${modalCy}]`).should('not.exist');
});

// =============================================================================
// COMANDOS DE INTERCEPCIÓN DE API
// =============================================================================

/**
 * Interceptar login exitoso
 */
Cypress.Commands.add('interceptLoginSuccess', (role: string = 'docente_aula') => {
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      user: { id: 1, rol: role, nombre: 'Test User' },
      token: 'mock_jwt_token',
      expiresIn: 86400
    }
  }).as('loginRequest');
});

/**
 * Interceptar login fallido
 */
Cypress.Commands.add('interceptLoginFailure', () => {
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 401,
    body: {
      success: false,
      error: TEST_CONFIG.ERROR_MESSAGES.credencialesInvalidas
    }
  }).as('loginRequest');
});

/**
 * Interceptar cambio de contraseña exitoso
 */
Cypress.Commands.add('interceptPasswordChangeSuccess', () => {
  cy.intercept('POST', '**/api/auth/cambiar-password', {
    statusCode: 200,
    body: {
      success: true,
      message: TEST_CONFIG.SUCCESS_MESSAGES.passwordCambiado
    }
  }).as('passwordChangeRequest');
});

/**
 * Interceptar cambio de contraseña fallido
 */
Cypress.Commands.add('interceptPasswordChangeFailure', (errorType: 'incorrect' | 'same') => {
  const error = errorType === 'incorrect' 
    ? TEST_CONFIG.ERROR_MESSAGES.passwordActualIncorrecta
    : TEST_CONFIG.ERROR_MESSAGES.passwordIgualAnterior;
    
  cy.intercept('POST', '**/api/auth/cambiar-password', {
    statusCode: 400,
    body: { success: false, error }
  }).as('passwordChangeRequest');
});

/**
 * Interceptar logout exitoso
 */
Cypress.Commands.add('interceptLogoutSuccess', () => {
  cy.intercept('POST', '**/api/auth/logout', {
    statusCode: 200,
    body: {
      success: true,
      message: TEST_CONFIG.SUCCESS_MESSAGES.sesionCerrada
    }
  }).as('logoutRequest');
});

// =============================================================================
// DECLARACIÓN DE TIPOS PARA TYPESCRIPT
// =============================================================================

declare global {
  namespace Cypress {
    interface Chainable {
      // Autenticación
      login(email: string, password: string): Chainable<void>;
      loginByToken(role: keyof typeof TEST_CONFIG.MOCK_CREDENTIALS): Chainable<void>;
      logout(): Chainable<void>;
      clearSession(): Chainable<void>;
      shouldBeAuthenticated(): Chainable<void>;
      shouldNotBeAuthenticated(): Chainable<void>;
      
      // Validación de contraseña
      checkPasswordRequirements(password: string): Chainable<{ 
        isValid: boolean; 
        checks: { hasMinLength: boolean; hasUppercase: boolean; hasNumber: boolean; hasSpecial: boolean }
      }>;
      fillPasswordChangeForm(currentPassword: string, newPassword: string, confirmPassword: string): Chainable<void>;
      
      // UI y feedback
      checkToast(message: string): Chainable<void>;
      waitForLoader(): Chainable<void>;
      checkFormError(fieldName: string, errorMessage: string): Chainable<void>;
      modalShouldBeVisible(modalCy: string): Chainable<void>;
      modalShouldNotExist(modalCy: string): Chainable<void>;
      
      // Intercepción de API
      interceptLoginSuccess(role?: string): Chainable<void>;
      interceptLoginFailure(): Chainable<void>;
      interceptPasswordChangeSuccess(): Chainable<void>;
      interceptPasswordChangeFailure(errorType: 'incorrect' | 'same'): Chainable<void>;
      interceptLogoutSuccess(): Chainable<void>;
    }
  }
}

export {};
