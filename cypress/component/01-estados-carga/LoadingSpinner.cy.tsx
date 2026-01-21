/**
 * FASE 1: ESTADOS DE CARGA
 * ========================
 * 
 * Contexto: Todos los dashboards y vistas del sistema muestran estados
 * de carga mientras se obtienen datos del backend.
 * 
 * Relevancia:
 * - Feedback visual al usuario durante operaciones async
 * - UX consistente en todas las épicas (EP-01 a EP-06)
 * - Indicador de progreso en carga masiva (HU-14)
 */

import LoadingSpinner from '../../../src/components/ui/LoadingSpinner';

describe('FASE 1: Estados de Carga - LoadingSpinner', () => {
  
  describe('1.1 Renderizado básico', () => {
    it('debe mostrar el spinner animado', () => {
      cy.mount(<LoadingSpinner />);
      cy.get('svg.animate-spin').should('exist');
    });

    it('debe usar animación CSS para indicar actividad', () => {
      cy.mount(<LoadingSpinner />);
      cy.get('svg').should('have.class', 'animate-spin');
    });
  });

  describe('1.2 Tamaños según contexto de uso', () => {
    /**
     * Tamaño SM: Usado en botones y elementos inline
     * Ejemplo: Botón "Guardar" mientras procesa
     */
    it('tamaño SM para indicadores inline (botones)', () => {
      cy.mount(<LoadingSpinner size="sm" />);
      cy.get('svg')
        .should('have.class', 'w-5')
        .and('have.class', 'h-5');
    });

    /**
     * Tamaño MD: Default, usado en cards y secciones
     * Ejemplo: Cargando listado de cursos
     */
    it('tamaño MD (default) para secciones', () => {
      cy.mount(<LoadingSpinner />);
      cy.get('svg')
        .should('have.class', 'w-8')
        .and('have.class', 'h-8');
    });

    /**
     * Tamaño LG: Usado en pantallas completas
     * Ejemplo: Cargando dashboard inicial, carga masiva (HU-14)
     */
    it('tamaño LG para pantallas completas', () => {
      cy.mount(<LoadingSpinner size="lg" />);
      cy.get('svg')
        .should('have.class', 'w-12')
        .and('have.class', 'h-12');
    });
  });

  describe('1.3 Mensaje de contexto', () => {
    /**
     * Mensajes informativos durante cargas largas
     * Ejemplo: "Procesando 45 de 200 registros..." (HU-14)
     */
    it('debe mostrar texto descriptivo cuando se proporciona', () => {
      cy.mount(<LoadingSpinner text="Cargando datos..." />);
      cy.contains('Cargando datos...').should('be.visible');
    });

    it('debe mostrar mensaje de progreso de carga masiva', () => {
      cy.mount(<LoadingSpinner text="Procesando 45 de 200 registros..." size="lg" />);
      cy.contains('Procesando 45 de 200 registros...').should('be.visible');
    });

    it('no debe mostrar texto cuando no se proporciona', () => {
      cy.mount(<LoadingSpinner />);
      cy.get('span').should('not.exist');
    });
  });

  describe('1.4 Colores según contexto visual', () => {
    /**
     * Color Teal: Brand color, usado en fondos claros
     */
    it('color teal (default) para fondos claros', () => {
      cy.mount(<LoadingSpinner />);
      cy.get('svg').should('have.class', 'text-teal-600');
    });

    /**
     * Color White: Usado en botones primarios/oscuros
     * Ejemplo: Spinner dentro de botón "Iniciar Sesión"
     */
    it('color blanco para botones primarios', () => {
      cy.mount(<LoadingSpinner color="white" />);
      cy.get('svg').should('have.class', 'text-white');
    });

    /**
     * Color Gray: Usado en contextos secundarios
     */
    it('color gris para contextos secundarios', () => {
      cy.mount(<LoadingSpinner color="gray" />);
      cy.get('svg').should('have.class', 'text-gray-600');
    });
  });

  describe('1.5 Layout y centrado', () => {
    it('debe estar centrado para uso en contenedores', () => {
      cy.mount(<LoadingSpinner />);
      cy.get('div')
        .should('have.class', 'flex')
        .and('have.class', 'items-center')
        .and('have.class', 'justify-center');
    });
  });
});
