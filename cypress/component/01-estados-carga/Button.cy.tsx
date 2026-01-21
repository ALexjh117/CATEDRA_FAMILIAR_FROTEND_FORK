/**
 * FASE 1: ESTADOS DE CARGA - Button
 * ==================================
 * 
 * Contexto: El componente Button maneja estados de carga para
 * todas las operaciones asíncronas del sistema.
 * 
 * Relevancia según Épicas:
 * - EP-01: Botón "Registrar" institución
 * - EP-02: Botón "Iniciar Sesión", "Cambiar Contraseña"
 * - EP-03: Botón "Guardar" en formularios de cursos/docentes
 * - EP-04: Botón "Procesar" en carga masiva
 * - EP-05: Botón "Asignar Tarea"
 * - EP-06: Botón "Calificar"
 */

import Button from '../../../src/components/ui/Button';

describe('FASE 1: Estados de Carga - Button', () => {

  describe('1.1 Estado Loading (Procesando)', () => {
    /**
     * HU-05: Botón "Iniciar Sesión" durante autenticación
     * HU-14: Botón "Procesar" durante carga masiva
     */
    it('debe mostrar spinner y texto "Cargando..." en estado loading', () => {
      cy.mount(<Button loading>Iniciar Sesión</Button>);
      
      // Verifica que muestra el spinner
      cy.get('button svg.animate-spin').should('exist');
      
      // Verifica que muestra texto de carga
      cy.contains('Cargando...').should('be.visible');
    });

    it('debe deshabilitar el botón durante loading', () => {
      cy.mount(<Button loading>Guardar</Button>);
      cy.get('button').should('be.disabled');
    });

    it('debe prevenir clics múltiples durante operación', () => {
      const onClickSpy = cy.spy().as('onClick');
      cy.mount(<Button loading onClick={onClickSpy}>Procesar</Button>);
      
      cy.get('button').click({ force: true });
      cy.get('@onClick').should('not.have.been.called');
    });
  });

  describe('1.2 Estado Disabled', () => {
    /**
     * HU-05: reCAPTCHA no resuelto = botón deshabilitado
     * HU-06: Requisitos de contraseña no cumplidos
     */
    it('debe mostrar estado visual deshabilitado', () => {
      cy.mount(<Button disabled>Ingresar</Button>);
      cy.get('button')
        .should('be.disabled')
        .and('have.class', 'disabled:opacity-50')
        .and('have.class', 'disabled:cursor-not-allowed');
    });

    it('no debe responder a clics cuando está deshabilitado', () => {
      const onClickSpy = cy.spy().as('onClick');
      cy.mount(<Button disabled onClick={onClickSpy}>Registrar</Button>);
      
      cy.get('button').click({ force: true });
      cy.get('@onClick').should('not.have.been.called');
    });
  });

  describe('1.3 Variantes de Acción', () => {
    /**
     * Primary: Acciones principales
     * - "Iniciar Sesión" (HU-05)
     * - "Registrar" (HU-01 a HU-04)
     */
    it('variante Primary para acciones principales', () => {
      cy.mount(<Button variant="primary">Registrar Institución</Button>);
      cy.get('button').should('have.class', 'bg-teal-600');
    });

    /**
     * Secondary: Acciones secundarias
     * - "Guardar Borrador"
     */
    it('variante Secondary para acciones secundarias', () => {
      cy.mount(<Button variant="secondary">Guardar Borrador</Button>);
      cy.get('button').should('have.class', 'bg-gray-800');
    });

    /**
     * Outline: Acciones alternativas
     * - "Cancelar" en modales
     */
    it('variante Outline para cancelar/alternativos', () => {
      cy.mount(<Button variant="outline">Cancelar</Button>);
      cy.get('button').should('have.class', 'border-teal-600');
    });

    /**
     * Danger: Acciones destructivas
     * - "Eliminar" (con confirmación)
     * - "Rechazar" docente (HU relacionada a aprobación)
     */
    it('variante Danger para acciones destructivas', () => {
      cy.mount(<Button variant="danger">Eliminar</Button>);
      cy.get('button').should('have.class', 'bg-red-600');
    });

    /**
     * Ghost: Acciones terciarias
     * - Links de navegación con aspecto de botón
     */
    it('variante Ghost para acciones terciarias', () => {
      cy.mount(<Button variant="ghost">Ver más</Button>);
      cy.get('button').should('have.class', 'hover:bg-gray-100');
    });
  });

  describe('1.4 Tamaños según contexto', () => {
    /**
     * SM: Acciones en tablas, cards compactas
     */
    it('tamaño SM para acciones en tablas', () => {
      cy.mount(<Button size="sm">Editar</Button>);
      cy.get('button')
        .should('have.class', 'px-4')
        .and('have.class', 'py-2')
        .and('have.class', 'text-sm');
    });

    /**
     * MD: Default, formularios estándar
     */
    it('tamaño MD (default) para formularios', () => {
      cy.mount(<Button>Guardar</Button>);
      cy.get('button')
        .should('have.class', 'px-6')
        .and('have.class', 'py-3');
    });

    /**
     * LG: CTAs principales, login
     */
    it('tamaño LG para CTAs principales', () => {
      cy.mount(<Button size="lg">Comenzar Ahora</Button>);
      cy.get('button')
        .should('have.class', 'px-8')
        .and('have.class', 'py-4')
        .and('have.class', 'text-lg');
    });
  });

  describe('1.5 Ancho completo (fullWidth)', () => {
    /**
     * HU-05: Botón de login ocupa todo el ancho del form
     */
    it('debe ocupar ancho completo del contenedor padre', () => {
      cy.mount(<Button fullWidth>Iniciar Sesión</Button>);
      cy.get('button').should('have.class', 'w-full');
    });
  });

  describe('1.6 Iconos en botones', () => {
    /**
     * Botones con iconos para mejor UX
     * - Descargar plantilla (HU-14)
     * - Exportar reporte
     */
    it('debe renderizar icono junto al texto', () => {
      const downloadIcon = <span data-cy="icon">📥</span>;
      cy.mount(<Button icon={downloadIcon}>Descargar Plantilla</Button>);
      
      cy.get('[data-cy="icon"]').should('exist');
      cy.contains('Descargar Plantilla').should('be.visible');
    });
  });

  describe('1.7 Tipos de botón HTML', () => {
    it('tipo button por defecto (no submit forms)', () => {
      cy.mount(<Button>Cancelar</Button>);
      cy.get('button').should('have.attr', 'type', 'button');
    });

    it('tipo submit para enviar formularios', () => {
      cy.mount(<Button type="submit">Registrar</Button>);
      cy.get('button').should('have.attr', 'type', 'submit');
    });
  });

  describe('1.8 Interacción - Eventos Click', () => {
    it('debe ejecutar callback onClick correctamente', () => {
      const onClickSpy = cy.spy().as('onClick');
      cy.mount(<Button onClick={onClickSpy}>Guardar Cambios</Button>);
      
      cy.get('button').click();
      cy.get('@onClick').should('have.been.calledOnce');
    });
  });
});
