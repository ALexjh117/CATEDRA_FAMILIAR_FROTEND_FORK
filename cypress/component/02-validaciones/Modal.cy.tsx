/**
 * FASE 2: VALIDACIONES - Modal Genérico
 * ======================================
 * 
 * Contexto: Modal reutilizable para formularios, detalles
 * y contenido que requiere overlay sobre la vista actual.
 * 
 * Relevancia según Épicas:
 * - EP-01 (HU-01, HU-02): Modal de registro/edición de institución
 * - EP-02 (HU-03, HU-04): Modal de registro de rector/coordinador
 * - EP-03 (HU-08, HU-09, HU-10): Modales de cursos, orientadores, docentes
 * - EP-04 (HU-12): Modal de credenciales generadas
 * - EP-05: Modal de detalle de tarea
 */

import Modal from '../../../src/components/ui/Modal';

describe('FASE 2: Validaciones - Modal', () => {

  describe('2.1 Visibilidad del Modal', () => {
    it('no debe renderizar cuando isOpen=false', () => {
      cy.mount(
        <Modal isOpen={false} onClose={() => {}}>
          <p>Contenido</p>
        </Modal>
      );
      cy.get('.fixed').should('not.exist');
    });

    it('debe renderizar cuando isOpen=true', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Contenido visible</p>
        </Modal>
      );
      cy.get('.fixed').should('exist');
      cy.contains('Contenido visible').should('be.visible');
    });
  });

  describe('2.2 Títulos según contexto de uso', () => {
    /**
     * HU-01: Formulario de nueva institución
     */
    it('título para registro de institución (HU-01)', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}} title="Nueva Institución Educativa">
          <p>Formulario...</p>
        </Modal>
      );
      cy.get('h3').should('contain', 'Nueva Institución Educativa');
    });

    /**
     * HU-03: Formulario de nuevo rector
     */
    it('título para registro de rector (HU-03)', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}} title="Nuevo Rector">
          <p>Formulario...</p>
        </Modal>
      );
      cy.get('h3').should('contain', 'Nuevo Rector');
    });

    /**
     * HU-08: Formulario de nuevo curso
     */
    it('título para registro de curso (HU-08)', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}} title="Nuevo Curso">
          <p>Formulario...</p>
        </Modal>
      );
      cy.get('h3').should('contain', 'Nuevo Curso');
    });

    /**
     * HU-12: Credenciales generadas para acudiente
     */
    it('título para mostrar credenciales (HU-12)', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}} title="Acudiente Registrado">
          <div>
            <p>Usuario: 3101234567</p>
            <p>Contraseña: 12345678</p>
          </div>
        </Modal>
      );
      cy.get('h3').should('contain', 'Acudiente Registrado');
      cy.contains('Usuario: 3101234567').should('be.visible');
    });

    it('no debe mostrar header cuando no hay título', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Contenido sin header</p>
        </Modal>
      );
      cy.get('h3').should('not.exist');
    });
  });

  describe('2.3 Tamaños según contenido', () => {
    /**
     * SM: Confirmaciones simples, mensajes cortos
     */
    it('tamaño SM para contenido simple', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}} size="sm">
          <p>Mensaje corto</p>
        </Modal>
      );
      cy.get('.max-w-sm').should('exist');
    });

    /**
     * MD: Formularios estándar (default)
     */
    it('tamaño MD (default) para formularios', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Formulario estándar</p>
        </Modal>
      );
      cy.get('.max-w-md').should('exist');
    });

    /**
     * LG: Formularios con múltiples campos
     */
    it('tamaño LG para formularios extensos', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}} size="lg">
          <p>Formulario completo de institución</p>
        </Modal>
      );
      cy.get('.max-w-lg').should('exist');
    });

    /**
     * XL: Vistas previas, tablas, contenido amplio
     */
    it('tamaño XL para vistas previas y tablas', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}} size="xl" title="Vista Previa de Carga">
          <p>Tabla de 500 registros...</p>
        </Modal>
      );
      cy.get('.max-w-xl').should('exist');
    });
  });

  describe('2.4 Cierre del Modal', () => {
    /**
     * Cerrar al hacer clic en backdrop
     */
    it('debe cerrar al hacer clic en backdrop', () => {
      const onCloseSpy = cy.spy().as('onClose');
      
      cy.mount(
        <Modal isOpen={true} onClose={onCloseSpy}>
          <p>Contenido</p>
        </Modal>
      );
      
      // Clic en backdrop (fondo oscuro)
      cy.get('.bg-black\\/50').click({ force: true });
      cy.get('@onClose').should('have.been.called');
    });

    /**
     * Cerrar con botón X en header
     */
    it('debe cerrar al hacer clic en botón X', () => {
      const onCloseSpy = cy.spy().as('onClose');
      
      cy.mount(
        <Modal isOpen={true} onClose={onCloseSpy} title="Modal con X">
          <p>Contenido</p>
        </Modal>
      );
      
      cy.get('button').click();
      cy.get('@onClose').should('have.been.called');
    });

    /**
     * No cerrar al hacer clic dentro del contenido
     */
    it('no debe cerrar al hacer clic dentro del modal', () => {
      const onCloseSpy = cy.spy().as('onClose');
      
      cy.mount(
        <Modal isOpen={true} onClose={onCloseSpy}>
          <p data-cy="content">Contenido clickeable</p>
        </Modal>
      );
      
      cy.get('[data-cy="content"]').click();
      cy.get('@onClose').should('not.have.been.called');
    });
  });

  describe('2.5 Estilos visuales', () => {
    it('debe tener backdrop con blur', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Contenido</p>
        </Modal>
      );
      cy.get('.backdrop-blur-sm').should('exist');
    });

    it('debe tener sombra prominente', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Contenido</p>
        </Modal>
      );
      cy.get('.shadow-2xl').should('exist');
    });

    it('debe tener bordes redondeados modernos', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Contenido</p>
        </Modal>
      );
      cy.get('.rounded-2xl').should('exist');
    });
  });

  describe('2.6 Accesibilidad', () => {
    it('debe tener z-index alto (z-50)', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Contenido</p>
        </Modal>
      );
      cy.get('.z-50').should('exist');
    });

    it('debe permitir scroll en contenido largo', () => {
      cy.mount(
        <Modal isOpen={true} onClose={() => {}}>
          <p>Contenido</p>
        </Modal>
      );
      cy.get('.overflow-y-auto').should('exist');
    });
  });
});
