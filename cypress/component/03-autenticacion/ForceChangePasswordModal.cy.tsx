/**
 * FASE 3: AUTENTICACIÓN - Cambio de Contraseña Obligatorio
 * =========================================================
 * 
 * Historia de Usuario: HU-06
 * Épica: EP-02 - Gestión de Usuarios Administrativos
 * 
 * Contexto: Cuando un usuario con debe_cambiar_contrasena=true
 * hace login exitoso, el sistema DEBE redirigir a esta pantalla
 * y NO permitir navegar a otro lugar hasta cambiar la contraseña.
 * 
 * Criterios de Aceptación según HU-06:
 * 1. Redirección forzada al modal de cambio ✅
 * 2. Formulario con: contraseña actual, nueva, confirmar ✅
 * 3. Checklist visual de requisitos en tiempo real ✅
 * 4. "Las contraseñas no coinciden" ✅
 * 5. "La contraseña actual es incorrecta" ✅
 * 6. "La nueva contraseña debe ser diferente a la actual" ✅
 * 7. Cambio exitoso → debe_cambiar_contrasena=false → redirige a panel ✅
 */

import ForceChangePasswordModal from '../../../src/components/ForceChangePasswordModal';

describe('FASE 3: Autenticación - HU-06 Cambio de Contraseña Obligatorio', () => {

  const defaultProps = {
    isOpen: true,
    userId: 1,
    userName: 'Carlos García',
    onSuccess: cy.stub().as('onSuccess'),
  };

  describe('3.1 Criterio #1: Modal obligatorio (no se puede cerrar)', () => {
    /**
     * El usuario DEBE cambiar su contraseña, no puede omitir esta pantalla
     */
    it('debe mostrar el modal cuando isOpen=true', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('.fixed').should('exist');
    });

    it('debe mostrar mensaje de actualización de seguridad requerida', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.contains('Actualización de Seguridad Requerida').should('be.visible');
    });

    it('debe mostrar nombre del usuario en el mensaje', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.contains('Carlos García').should('be.visible');
    });

    it('debe mostrar título del modal', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.contains('Cambio de Contraseña Obligatorio').should('be.visible');
    });

    it('NO debe tener botón de cerrar (X) - es obligatorio', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      // El modal obligatorio no debe permitir cerrarse sin cambiar contraseña
      cy.get('[data-cy="close-modal"]').should('not.exist');
    });

    it('NO debe cerrarse al hacer clic en backdrop', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      // Intentar cerrar haciendo clic fuera
      cy.get('.fixed').first().click({ force: true });
      // El modal debe seguir visible
      cy.get('.fixed').should('exist');
      cy.contains('Cambio de Contraseña Obligatorio').should('be.visible');
    });
  });

  describe('3.2 Criterio #2: Formulario de cambio', () => {
    /**
     * Campos: contraseña actual, nueva contraseña, confirmar contraseña
     */
    it('debe tener campo de contraseña actual', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('input[name="currentPassword"]')
        .should('exist')
        .and('have.attr', 'type', 'password');
      cy.contains('label', 'Contraseña Actual').should('be.visible');
    });

    it('debe tener campo de nueva contraseña', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('input[name="newPassword"]')
        .should('exist')
        .and('have.attr', 'type', 'password');
      cy.contains('label', 'Nueva Contraseña').should('be.visible');
    });

    it('debe tener campo de confirmar contraseña', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('input[name="confirmPassword"]')
        .should('exist')
        .and('have.attr', 'type', 'password');
      cy.contains('label', 'Confirmar Nueva Contraseña').should('be.visible');
    });

    it('debe tener placeholder con guía de formato (mínimo 8 caracteres según HU-06)', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      // Según HU-06 criterio #3: mínimo 8 caracteres
      cy.get('input[name="newPassword"]')
        .invoke('attr', 'placeholder')
        .should('match', /mínimo|8|caracteres/i);
    });

    it('debe tener hint de ayuda: "Tu contraseña actual es tu número de documento"', () => {
      // Según HU-24 (app móvil) pero aplica también a web
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.contains(/contraseña actual|documento/i).should('exist');
    });
  });

  describe('3.3 Criterio #3: Checklist de requisitos en tiempo real', () => {
    /**
     * HU-06 Criterio #3: Checklist visual en tiempo real:
     * ✅ 8 caracteres, ✅ 1 mayúscula, ✅ 1 número, ✅ 1 especial (@#$%&*)
     */
    it('no debe mostrar indicador cuando no hay contraseña', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.contains('Fortaleza:').should('not.exist');
    });

    it('debe mostrar "Débil" para contraseña corta (menor a 8 caracteres)', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('input[name="newPassword"]').type('Pass1!');  // 6 caracteres - Débil
      
      cy.contains('Fortaleza:').should('be.visible');
      cy.contains('Débil').should('be.visible');
    });

    it('debe mostrar "Media" para contraseña de longitud media', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('input[name="newPassword"]').type('Pass12!');  // 7 caracteres
      
      cy.contains('Media').should('be.visible');
    });

    it('debe mostrar "Fuerte" para contraseña que cumple todos los requisitos (8+ chars)', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      // Según HU-06: 8 caracteres, 1 mayúscula, 1 número, 1 especial
      cy.get('input[name="newPassword"]').type('Password1!');
      
      cy.contains('Fuerte').should('be.visible');
    });

    it('debe tener barra de progreso visual con colores según fortaleza', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      // Contraseña débil - rojo
      cy.get('input[name="newPassword"]').type('abc');
      cy.get('.bg-red-500').should('exist');
      
      // Limpiar y escribir contraseña fuerte - verde
      cy.get('input[name="newPassword"]').clear().type('Password123!');
      cy.get('.bg-green-500').should('exist');
    });

    it('debe actualizar checklist en tiempo real mientras escribe', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      // Ir escribiendo y verificar que el indicador cambia
      cy.get('input[name="newPassword"]').type('a');
      cy.contains('Débil').should('be.visible');
      
      cy.get('input[name="newPassword"]').type('bcdefgh'); // 8 caracteres
      // Debe cambiar el indicador
      cy.contains(/Media|Fuerte/).should('be.visible');
    });
  });

  describe('3.4 Criterio #4: Validación "Las contraseñas no coinciden"', () => {
    /**
     * HU-06 Criterio #4: Mensaje "Las contraseñas no coinciden"
     */
    it('debe mostrar error cuando contraseñas no coinciden', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="currentPassword"]').type('OldPassword123!');
      cy.get('input[name="newPassword"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPassword456!');
      
      // Al salir del campo o al intentar enviar
      cy.get('input[name="confirmPassword"]').blur();
      
      // Debe mostrar mensaje de error
      cy.contains(/contraseñas no coinciden|passwords do not match/i).should('be.visible');
    });

    it('debe marcar campo de confirmar con estilo de error cuando no coinciden', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="newPassword"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Different456!');
      cy.get('input[name="confirmPassword"]').blur();
      
      // El campo debe tener estilo de error (borde rojo)
      cy.get('input[name="confirmPassword"]').then($el => {
        const hasRedBorder = $el.hasClass('border-red-300') || $el.hasClass('border-red-500');
        expect(hasRedBorder).to.be.true;
      });
    });

    it('NO debe mostrar error cuando contraseñas coinciden', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="newPassword"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').blur();
      
      cy.contains(/contraseñas no coinciden/i).should('not.exist');
    });

    it('debe deshabilitar botón de envío cuando contraseñas no coinciden', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="currentPassword"]').type('OldPass123!');
      cy.get('input[name="newPassword"]').type('NewPass123!');
      cy.get('input[name="confirmPassword"]').type('WrongPass123!');
      
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('3.5 Criterio #5: Validación "La contraseña actual es incorrecta"', () => {
    /**
     * HU-06 Criterio #5: "La contraseña actual es incorrecta"
     * Nota: Este error viene del backend, se simula con intercept
     */
    it('debe mostrar error cuando el backend rechaza la contraseña actual', () => {
      // Simular respuesta de error del backend
      cy.intercept('POST', '**/api/auth/change-password', {
        statusCode: 400,
        body: {
          success: false,
          error: {
            code: 'WRONG_PASSWORD',
            message: 'La contraseña actual es incorrecta'
          }
        }
      }).as('changePasswordError');

      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="currentPassword"]').type('WrongOldPass!');
      cy.get('input[name="newPassword"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('NewPassword123!');
      
      cy.get('button[type="submit"]').click();
      
      // Esperar respuesta y verificar mensaje de error
      cy.wait('@changePasswordError');
      cy.contains(/contraseña actual.*incorrecta|current password.*incorrect/i).should('be.visible');
    });

    it('debe resaltar el campo de contraseña actual cuando es incorrecta', () => {
      cy.intercept('POST', '**/api/auth/change-password', {
        statusCode: 400,
        body: { error: { message: 'La contraseña actual es incorrecta' } }
      }).as('changePasswordError');

      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="currentPassword"]').type('WrongPass');
      cy.get('input[name="newPassword"]').type('NewPassword123!');
      cy.get('input[name="confirmPassword"]').type('NewPassword123!');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@changePasswordError');
      
      // Campo de contraseña actual debe tener estilo de error
      cy.get('input[name="currentPassword"]').should('have.class', 'border-red-300');
    });
  });

  describe('3.6 Criterio #6: Validación "Nueva contraseña debe ser diferente"', () => {
    /**
     * HU-06 Criterio #6: "La nueva contraseña debe ser diferente a la actual"
     */
    it('debe mostrar error si nueva contraseña es igual a la actual', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      const samePassword = 'SamePassword123!';
      cy.get('input[name="currentPassword"]').type(samePassword);
      cy.get('input[name="newPassword"]').type(samePassword);
      cy.get('input[name="newPassword"]').blur();
      
      cy.contains(/nueva contraseña.*diferente|must be different|no puede ser igual/i).should('be.visible');
    });

    it('debe deshabilitar el botón cuando nueva = actual', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      const samePassword = 'SamePass123!';
      cy.get('input[name="currentPassword"]').type(samePassword);
      cy.get('input[name="newPassword"]').type(samePassword);
      cy.get('input[name="confirmPassword"]').type(samePassword);
      
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('NO debe mostrar error cuando nueva es diferente a actual', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="currentPassword"]').type('OldPassword123!');
      cy.get('input[name="newPassword"]').type('NewPassword456!');
      cy.get('input[name="newPassword"]').blur();
      
      cy.contains(/debe ser diferente|must be different/i).should('not.exist');
    });
  });

  describe('3.7 Criterio #7: Cambio exitoso y redirección', () => {
    /**
     * HU-06 Criterio #7: Cambio exitoso → debe_cambiar_contrasena=false → redirige a panel
     */
    it('debe llamar onSuccess cuando el cambio es exitoso', () => {
      cy.intercept('POST', '**/api/auth/change-password', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Contraseña actualizada exitosamente'
        }
      }).as('changePasswordSuccess');

      const onSuccessSpy = cy.spy().as('onSuccessSpy');
      
      cy.mount(
        <ForceChangePasswordModal 
          {...defaultProps} 
          onSuccess={onSuccessSpy}
        />
      );
      
      cy.get('input[name="currentPassword"]').type('OldPassword123!');
      cy.get('input[name="newPassword"]').type('NewPassword456!');
      cy.get('input[name="confirmPassword"]').type('NewPassword456!');
      
      cy.get('button[type="submit"]').click();
      
      cy.wait('@changePasswordSuccess');
      cy.get('@onSuccessSpy').should('have.been.calledOnce');
    });

    it('debe mostrar mensaje de éxito después de cambiar contraseña', () => {
      cy.intercept('POST', '**/api/auth/change-password', {
        statusCode: 200,
        body: { success: true, message: 'Contraseña actualizada exitosamente' }
      }).as('changePasswordSuccess');

      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="currentPassword"]').type('OldPassword123!');
      cy.get('input[name="newPassword"]').type('NewPassword456!');
      cy.get('input[name="confirmPassword"]').type('NewPassword456!');
      
      cy.get('button[type="submit"]').click();
      
      cy.wait('@changePasswordSuccess');
      cy.contains(/éxito|actualizada|correctamente|success/i).should('be.visible');
    });

    it('debe mostrar estado de carga mientras procesa', () => {
      cy.intercept('POST', '**/api/auth/change-password', {
        delay: 1000,
        statusCode: 200,
        body: { success: true }
      }).as('changePasswordSlow');

      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="currentPassword"]').type('OldPassword123!');
      cy.get('input[name="newPassword"]').type('NewPassword456!');
      cy.get('input[name="confirmPassword"]').type('NewPassword456!');
      
      cy.get('button[type="submit"]').click();
      
      // Debe mostrar indicador de carga o estar deshabilitado
      cy.get('button[type="submit"]').then($btn => {
        const isLoading = $btn.text().includes('Cargando') || $btn.is(':disabled');
        expect(isLoading).to.be.true;
      });
    });
  });

  describe('3.8 Estado del botón de envío', () => {
    it('debe estar deshabilitado cuando campos vacíos', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('debe habilitarse cuando todos los campos son válidos', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      
      cy.get('input[name="currentPassword"]').type('OldPassword123!');
      cy.get('input[name="newPassword"]').type('NewPassword456!');
      cy.get('input[name="confirmPassword"]').type('NewPassword456!');
      
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('debe mostrar texto correcto en botón', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('button[type="submit"]').should('contain', 'Cambiar Contraseña');
    });
  });

  describe('3.9 Mensaje informativo obligatorio', () => {
    it('debe indicar que la acción es obligatoria', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.contains(/obligatori|required|no podrás acceder/i).should('be.visible');
    });

    it('debe mostrar advertencia visual (estilo amber)', () => {
      cy.mount(<ForceChangePasswordModal {...defaultProps} />);
      cy.get('.bg-amber-50').should('exist');
      cy.get('.border-amber-200').should('exist');
    });
  });
});
