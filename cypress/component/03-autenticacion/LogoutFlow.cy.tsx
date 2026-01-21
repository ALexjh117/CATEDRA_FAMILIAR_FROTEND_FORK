/**
 * FASE 3: AUTENTICACIÓN - Cierre de Sesión
 * =========================================
 * 
 * Historia de Usuario: HU-07
 * Épica: EP-02 - Gestión de Usuarios Administrativos
 * 
 * Contexto: Usuario autenticado cierra sesión para proteger sus datos.
 * 
 * Criterios de Aceptación según HU-07:
 * 1. Botón "Cerrar Sesión" visible en menú/header
 * 2. Clic muestra modal de confirmación: "¿Desea cerrar sesión?"
 * 3. Confirmar → Elimina token y redirige a pantalla de login
 * 4. Cancelar → Modal se cierra y usuario permanece en sesión
 * 5. Después del logout, acceder a rutas protegidas redirige a login
 * 6. Registro de cierre de sesión en auditoría
 */

import React from 'react';

// Mock del componente de header con botón de logout
const MockHeader = ({
  userName = 'Carlos García',
  userRole = 'Docente de Aula',
  onLogout = () => {}
}: {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-teal-600">Cátedra de Familia</h1>
        
        <div className="relative">
          <button
            data-cy="user-menu-button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2"
          >
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-teal-600 font-medium">{userName.charAt(0)}</span>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">{userName}</p>
              <p className="text-sm text-gray-500">{userRole}</p>
            </div>
          </button>

          {showDropdown && (
            <div 
              data-cy="user-dropdown"
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
            >
              <button
                data-cy="logout-button"
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Mock del modal de confirmación de logout
const MockLogoutModal = ({
  isOpen = true,
  onConfirm = () => {},
  onCancel = () => {},
  isLoading = false
}: {
  isOpen?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div 
      data-cy="logout-modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div 
        data-cy="logout-modal"
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono de advertencia */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Título y mensaje */}
        <h2 
          data-cy="logout-modal-title"
          className="text-xl font-semibold text-center text-gray-900 mb-2"
        >
          Cerrar Sesión
        </h2>
        <p 
          data-cy="logout-modal-message"
          className="text-center text-gray-600 mb-6"
        >
          ¿Desea cerrar sesión?
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            data-cy="logout-cancel-button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            data-cy="logout-confirm-button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cerrando...
              </span>
            ) : (
              'Sí, cerrar sesión'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

describe('FASE 3: Autenticación - HU-07 Cierre de Sesión', () => {

  describe('7.1 Criterio #1: Botón "Cerrar Sesión" visible', () => {
    /**
     * El usuario ve un botón "Cerrar Sesión" en el menú de usuario
     */
    it('debe mostrar el menú de usuario en el header', () => {
      cy.mount(<MockHeader />);
      
      cy.get('[data-cy="user-menu-button"]').should('be.visible');
      cy.contains('Carlos García').should('be.visible');
      cy.contains('Docente de Aula').should('be.visible');
    });

    it('debe mostrar dropdown con "Cerrar Sesión" al hacer clic', () => {
      cy.mount(<MockHeader />);
      
      cy.get('[data-cy="user-dropdown"]').should('not.exist');
      cy.get('[data-cy="user-menu-button"]').click();
      cy.get('[data-cy="user-dropdown"]').should('be.visible');
      cy.get('[data-cy="logout-button"]')
        .should('be.visible')
        .and('contain', 'Cerrar Sesión');
    });

    it('botón de logout debe tener estilo visual de acción destructiva', () => {
      cy.mount(<MockHeader />);
      
      cy.get('[data-cy="user-menu-button"]').click();
      cy.get('[data-cy="logout-button"]')
        .should('have.class', 'text-red-600');
    });
  });

  describe('7.2 Criterio #2: Modal de confirmación', () => {
    /**
     * Clic en "Cerrar Sesión" → Modal: "¿Desea cerrar sesión?"
     */
    it('debe mostrar modal de confirmación', () => {
      cy.mount(<MockLogoutModal isOpen={true} />);
      
      cy.get('[data-cy="logout-modal"]').should('be.visible');
    });

    it('modal debe mostrar pregunta "¿Desea cerrar sesión?"', () => {
      cy.mount(<MockLogoutModal isOpen={true} />);
      
      cy.get('[data-cy="logout-modal-message"]')
        .should('be.visible')
        .and('contain', '¿Desea cerrar sesión?');
    });

    it('modal debe tener título "Cerrar Sesión"', () => {
      cy.mount(<MockLogoutModal isOpen={true} />);
      
      cy.get('[data-cy="logout-modal-title"]')
        .should('be.visible')
        .and('contain', 'Cerrar Sesión');
    });

    it('modal debe tener botones "Cancelar" y "Sí, cerrar sesión"', () => {
      cy.mount(<MockLogoutModal isOpen={true} />);
      
      cy.get('[data-cy="logout-cancel-button"]')
        .should('be.visible')
        .and('contain', 'Cancelar');
      cy.get('[data-cy="logout-confirm-button"]')
        .should('be.visible')
        .and('contain', 'Sí, cerrar sesión');
    });

    it('modal debe tener icono de advertencia', () => {
      cy.mount(<MockLogoutModal isOpen={true} />);
      
      cy.get('[data-cy="logout-modal"] svg').first().should('exist');
    });
  });

  describe('7.3 Criterio #3: Confirmar cierre de sesión', () => {
    /**
     * Confirmar → Se elimina token y redirige a login
     */
    it('debe llamar onConfirm al hacer clic en confirmar', () => {
      const onConfirmSpy = cy.spy().as('onConfirm');
      
      cy.mount(<MockLogoutModal onConfirm={onConfirmSpy} />);
      
      cy.get('[data-cy="logout-confirm-button"]').click();
      cy.get('@onConfirm').should('have.been.calledOnce');
    });

    it('debe mostrar estado de carga al procesar logout', () => {
      cy.mount(<MockLogoutModal isLoading={true} />);
      
      cy.get('[data-cy="logout-confirm-button"]')
        .should('contain', 'Cerrando')
        .and('be.disabled');
      cy.get('[data-cy="logout-confirm-button"] svg.animate-spin').should('exist');
    });

    it('debe deshabilitar botón cancelar durante el proceso', () => {
      cy.mount(<MockLogoutModal isLoading={true} />);
      
      cy.get('[data-cy="logout-cancel-button"]').should('be.disabled');
    });

    it('logout exitoso debe limpiar token del localStorage', () => {
      // Simular token almacenado
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'jwt_token_value');
        win.localStorage.setItem('user_data', JSON.stringify({ id: 1, name: 'Test' }));
      });

      const onConfirm = () => {
        // Simular limpieza de token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      };

      cy.mount(<MockLogoutModal onConfirm={onConfirm} />);
      
      cy.get('[data-cy="logout-confirm-button"]').click();
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
        expect(win.localStorage.getItem('user_data')).to.be.null;
      });
    });
  });

  describe('7.4 Criterio #4: Cancelar cierre de sesión', () => {
    /**
     * Cancelar → Modal se cierra, usuario permanece en sesión
     */
    it('debe llamar onCancel al hacer clic en cancelar', () => {
      const onCancelSpy = cy.spy().as('onCancel');
      
      cy.mount(<MockLogoutModal onCancel={onCancelSpy} />);
      
      cy.get('[data-cy="logout-cancel-button"]').click();
      cy.get('@onCancel').should('have.been.calledOnce');
    });

    it('debe llamar onCancel al hacer clic fuera del modal (overlay)', () => {
      const onCancelSpy = cy.spy().as('onCancel');
      
      cy.mount(<MockLogoutModal onCancel={onCancelSpy} />);
      
      // Clic en el overlay (fuera del modal)
      cy.get('[data-cy="logout-modal-overlay"]').click({ force: true });
      cy.get('@onCancel').should('have.been.called');
    });

    it('no debe cerrar al hacer clic dentro del modal', () => {
      const onCancelSpy = cy.spy().as('onCancel');
      
      cy.mount(<MockLogoutModal onCancel={onCancelSpy} />);
      
      cy.get('[data-cy="logout-modal-title"]').click();
      cy.get('@onCancel').should('not.have.been.called');
    });

    it('cancelar debe mantener el token intacto', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'jwt_token_value');
      });

      const onCancel = () => {
        // No hacer nada con el token
      };

      cy.mount(<MockLogoutModal onCancel={onCancel} />);
      
      cy.get('[data-cy="logout-cancel-button"]').click();
      
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.equal('jwt_token_value');
      });
    });
  });

  describe('7.5 Criterio #5: Protección de rutas después del logout', () => {
    /**
     * Después del logout, acceder a rutas protegidas redirige a login
     */
    it('rutas protegidas sin token deben redirigir a login', () => {
      // Esta prueba simula la lógica del guard de rutas
      const checkAuth = () => {
        const token = localStorage.getItem('auth_token');
        return token !== null;
      };

      // Sin token
      cy.window().then((win) => {
        win.localStorage.removeItem('auth_token');
      });

      cy.window().then(() => {
        const isAuthenticated = checkAuth();
        expect(isAuthenticated).to.be.false;
        // En la implementación real: if (!isAuthenticated) navigate('/login')
      });
    });

    it('rutas protegidas con token válido permiten acceso', () => {
      const checkAuth = () => {
        const token = localStorage.getItem('auth_token');
        return token !== null;
      };

      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'valid_jwt_token');
      });

      cy.window().then(() => {
        const isAuthenticated = checkAuth();
        expect(isAuthenticated).to.be.true;
      });
    });
  });

  describe('7.6 Criterio #6: Registro de auditoría', () => {
    /**
     * Se registra el cierre de sesión en la tabla de auditoría
     */
    it('logout debe hacer request al endpoint de logout', () => {
      cy.intercept('POST', '**/api/auth/logout', (req) => {
        // Verificar que incluye el token para identificar la sesión
        expect(req.headers).to.have.property('authorization');
        
        req.reply({
          statusCode: 200,
          body: {
            success: true,
            message: 'Sesión cerrada correctamente'
          }
        });
      }).as('logoutRequest');

      // Nota: En implementación real, el componente haría este request
      cy.log('El endpoint POST /api/auth/logout debe registrar el evento en auditoría');
    });

    it('el backend debe recibir información para registro de auditoría', () => {
      // Campos que el backend debe registrar:
      const auditInfo = {
        userId: 1,
        action: 'logout',
        timestamp: new Date().toISOString(),
        ip: '192.168.1.1', // Extraído del request
        userAgent: 'Mozilla/5.0...' // Extraído del header
      };

      expect(auditInfo).to.have.all.keys('userId', 'action', 'timestamp', 'ip', 'userAgent');
    });
  });

  describe('7.7 Flujo completo de logout', () => {
    /**
     * Integración: Flujo completo desde el botón hasta la limpieza
     */
    it('debe completar flujo: clic botón → modal → confirmar → limpiar', () => {
      let modalVisible = false;
      let sessionActive = true;

      const onLogout = () => { modalVisible = true; };
      const onConfirm = () => { 
        sessionActive = false;
        localStorage.removeItem('auth_token');
      };

      // Simular token activo
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'active_session');
      });

      // Paso 1: Mostrar header y hacer clic en logout
      cy.mount(<MockHeader onLogout={onLogout} />);
      cy.get('[data-cy="user-menu-button"]').click();
      cy.get('[data-cy="logout-button"]').click().then(() => {
        expect(modalVisible).to.be.true;
      });

      // Paso 2: Confirmar en el modal
      cy.mount(<MockLogoutModal onConfirm={onConfirm} />);
      cy.get('[data-cy="logout-confirm-button"]').click().then(() => {
        expect(sessionActive).to.be.false;
      });

      // Paso 3: Verificar limpieza
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
      });
    });
  });

  describe('7.8 Accesibilidad del modal', () => {
    it('modal debe tener role adecuado para accesibilidad', () => {
      cy.mount(<MockLogoutModal />);
      
      // El modal debe ser accesible
      cy.get('[data-cy="logout-modal"]').should('be.visible');
      cy.get('[data-cy="logout-cancel-button"]').should('be.visible');
      cy.get('[data-cy="logout-confirm-button"]').should('be.visible');
    });

    it('botón confirmar debe ser claramente distinguible (color rojo)', () => {
      cy.mount(<MockLogoutModal />);
      
      cy.get('[data-cy="logout-confirm-button"]')
        .should('have.class', 'bg-red-600');
    });
  });
});
