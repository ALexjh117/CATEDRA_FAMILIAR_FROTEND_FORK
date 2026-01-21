/**
 * FASE 2: VALIDACIONES - Modal de Confirmación
 * =============================================
 * 
 * Contexto: Modal de confirmación para acciones destructivas
 * o que requieren confirmación explícita del usuario.
 * 
 * Relevancia según Épicas:
 * - HU-07: "¿Seguro que deseas cerrar sesión?"
 * - HU-13: "Ya existe un acudiente principal. ¿Desea reemplazarlo?"
 * - EP-04: Confirmación antes de procesar carga masiva
 * - Eliminación de registros (soft delete)
 */

import ConfirmModal from '../../../src/components/ConfirmModal';

describe('FASE 2: Validaciones - ConfirmModal', () => {

  describe('2.1 Visibilidad del Modal', () => {
    it('no debe renderizar cuando open=false', () => {
      cy.mount(
        <ConfirmModal 
          open={false} 
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('.fixed').should('not.exist');
    });

    it('debe renderizar cuando open=true', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('.fixed').should('exist');
    });
  });

  describe('2.2 Contenido del Modal - Títulos según contexto', () => {
    /**
     * Título por defecto genérico
     */
    it('debe mostrar título "Confirmar" por defecto', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('h3').should('contain', 'Confirmar');
    });

    /**
     * HU-07: Confirmación de cierre de sesión
     */
    it('título para cerrar sesión (HU-07)', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          title="¿Seguro que deseas cerrar sesión?"
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('h3').should('contain', '¿Seguro que deseas cerrar sesión?');
    });

    /**
     * HU-13: Confirmación de reemplazo de acudiente principal
     */
    it('título para reemplazar acudiente principal (HU-13)', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          title="Ya existe un acudiente principal"
          description="¿Desea reemplazarlo por este nuevo acudiente?"
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('h3').should('contain', 'Ya existe un acudiente principal');
      cy.contains('¿Desea reemplazarlo por este nuevo acudiente?').should('be.visible');
    });

    /**
     * Confirmación de eliminación (soft delete)
     */
    it('título para eliminar registro', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          title="Eliminar estudiante"
          description="Esta acción no se puede deshacer. El estudiante será marcado como inactivo."
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('h3').should('contain', 'Eliminar estudiante');
    });
  });

  describe('2.3 Descripción contextual', () => {
    it('debe mostrar descripción cuando se proporciona', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          title="Confirmar acción"
          description="Esta operación procesará 150 registros de estudiantes."
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.contains('Esta operación procesará 150 registros de estudiantes.').should('be.visible');
    });

    it('no debe mostrar descripción cuando no se proporciona', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          title="Confirmar"
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('p').should('not.exist');
    });
  });

  describe('2.4 Acciones - Cancelar', () => {
    /**
     * HU-07: "Cancelar" cierra el diálogo sin hacer nada
     */
    it('botón Cancelar debe ejecutar onCancel', () => {
      const onCancelSpy = cy.spy().as('onCancel');
      
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={onCancelSpy} 
          onConfirm={() => {}} 
        />
      );
      
      cy.contains('button', 'Cancelar').click();
      cy.get('@onCancel').should('have.been.calledOnce');
    });

    it('botón Cancelar tiene estilo secundario (borde)', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.contains('button', 'Cancelar').should('have.class', 'border');
    });
  });

  describe('2.5 Acciones - Confirmar', () => {
    /**
     * HU-07: "Sí, cerrar" ejecuta la acción de cerrar sesión
     */
    it('botón Confirmar debe ejecutar onConfirm', () => {
      const onConfirmSpy = cy.spy().as('onConfirm');
      
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={() => {}} 
          onConfirm={onConfirmSpy} 
        />
      );
      
      cy.contains('button', 'Confirmar').click();
      cy.get('@onConfirm').should('have.been.calledOnce');
    });

    it('botón Confirmar tiene estilo de peligro (rojo)', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.contains('button', 'Confirmar')
        .should('have.class', 'bg-red-600')
        .and('have.class', 'text-white');
    });
  });

  describe('2.6 Backdrop/Overlay', () => {
    it('debe tener fondo oscuro semitransparente', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('.bg-black\\/40').should('exist');
    });

    it('debe centrar el modal en pantalla', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('.fixed')
        .should('have.class', 'flex')
        .and('have.class', 'items-center')
        .and('have.class', 'justify-center');
    });
  });

  describe('2.7 Accesibilidad y z-index', () => {
    it('debe tener z-index alto para estar sobre otros elementos', () => {
      cy.mount(
        <ConfirmModal 
          open={true} 
          onCancel={() => {}} 
          onConfirm={() => {}} 
        />
      );
      cy.get('.z-50').should('exist');
    });
  });
});
