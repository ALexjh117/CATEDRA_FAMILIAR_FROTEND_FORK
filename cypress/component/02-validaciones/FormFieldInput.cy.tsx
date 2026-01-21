/**
 * FASE 2: VALIDACIONES DE FORMULARIO
 * ===================================
 * 
 * Contexto: Validaciones de campos según criterios de aceptación
 * de las historias de usuario HU-01 a HU-14.
 * 
 * Relevancia según Épicas:
 * - EP-01 (HU-01): Validación DANE (11 dígitos), NIT con verificador
 * - EP-02 (HU-03, HU-04): Validación correo institucional
 * - EP-02 (HU-05): Validación credenciales login
 * - EP-02 (HU-06): Validación requisitos contraseña
 * - EP-04 (HU-11, HU-12): Validación documento único
 */

import FormFieldInput from '../../../src/components/ui/FormFieldInput';

describe('FASE 2: Validaciones de Formulario - FormFieldInput', () => {

  describe('2.1 Renderizado de Campo Básico', () => {
    it('debe mostrar label asociado al input', () => {
      cy.mount(
        <FormFieldInput 
          name="correo" 
          label="Correo Institucional" 
        />
      );
      cy.get('label').should('contain', 'Correo Institucional');
      cy.get('label').should('have.attr', 'for', 'correo');
    });

    it('debe mostrar placeholder como guía de formato', () => {
      cy.mount(
        <FormFieldInput 
          name="dane" 
          label="Código DANE" 
          placeholder="Ej: 12345678901 (11 dígitos)"
        />
      );
      cy.get('input').should('have.attr', 'placeholder', 'Ej: 12345678901 (11 dígitos)');
    });
  });

  describe('2.2 Estado de Error (Validación fallida)', () => {
    /**
     * HU-01: "El código DANE ya está registrado en el sistema"
     * HU-05: "Correo o contraseña incorrectos"
     */
    it('debe mostrar mensaje de error con estilo visual', () => {
      cy.mount(
        <FormFieldInput 
          name="dane" 
          label="Código DANE" 
          error="El código DANE ya está registrado en el sistema"
        />
      );
      
      // Input con estilo de error
      cy.get('input')
        .should('have.class', 'border-red-300')
        .and('have.class', 'bg-red-50');
      
      // Mensaje de error visible
      cy.contains('El código DANE ya está registrado en el sistema').should('be.visible');
    });

    /**
     * HU-06: "Las contraseñas no coinciden"
     */
    it('debe mostrar error de contraseñas no coincidentes', () => {
      cy.mount(
        <FormFieldInput 
          name="confirmarPassword" 
          label="Confirmar Contraseña" 
          type="password"
          error="Las contraseñas no coinciden"
        />
      );
      cy.contains('Las contraseñas no coinciden').should('be.visible');
    });

    /**
     * HU-03, HU-04: "El documento ya está registrado"
     */
    it('debe mostrar error de documento duplicado', () => {
      cy.mount(
        <FormFieldInput 
          name="documento" 
          label="Número de Documento" 
          error="El documento ya está registrado en el sistema"
        />
      );
      cy.contains('El documento ya está registrado en el sistema').should('be.visible');
    });
  });

  describe('2.3 Campo Requerido', () => {
    /**
     * HU-01: Campos obligatorios de institución
     * HU-11: Campos obligatorios de estudiante
     */
    it('debe marcar campo como required en HTML', () => {
      cy.mount(
        <FormFieldInput 
          name="nombre" 
          label="Nombre Oficial" 
          required
        />
      );
      cy.get('input').should('have.attr', 'required');
    });
  });

  describe('2.4 Campo Deshabilitado', () => {
    /**
     * Campos de solo lectura durante edición
     * Ejemplo: Código DANE no editable después de registro
     */
    it('debe mostrar campo deshabilitado con estilo visual', () => {
      cy.mount(
        <FormFieldInput 
          name="dane" 
          label="Código DANE" 
          value="12345678901"
          disabled
        />
      );
      cy.get('input')
        .should('be.disabled')
        .and('have.class', 'bg-gray-100')
        .and('have.class', 'cursor-not-allowed');
    });
  });

  describe('2.5 Tipos de Input según dato', () => {
    /**
     * HU-05: Campo de correo para login
     */
    it('tipo email para correos electrónicos', () => {
      cy.mount(
        <FormFieldInput 
          name="correo" 
          label="Correo Electrónico" 
          type="email"
          placeholder="tu@correo.com"
        />
      );
      cy.get('input').should('have.attr', 'type', 'email');
    });

    /**
     * HU-05, HU-06: Campo de contraseña
     */
    it('tipo password para contraseñas (oculto)', () => {
      cy.mount(
        <FormFieldInput 
          name="password" 
          label="Contraseña" 
          type="password"
          placeholder="••••••••"
        />
      );
      cy.get('input').should('have.attr', 'type', 'password');
    });

    /**
     * HU-11: Fecha de nacimiento del estudiante
     */
    it('tipo date para fechas', () => {
      cy.mount(
        <FormFieldInput 
          name="fechaNacimiento" 
          label="Fecha de Nacimiento" 
          type="date"
        />
      );
      cy.get('input').should('have.attr', 'type', 'date');
    });
  });

  describe('2.6 Select para opciones predefinidas', () => {
    /**
     * HU-01: Selección de niveles educativos
     * HU-08: Selección de grado
     * HU-13: Selección de parentesco
     */
    it('debe renderizar select con opciones', () => {
      const opciones = [
        { value: 'padre', label: 'Padre' },
        { value: 'madre', label: 'Madre' },
        { value: 'abuelo', label: 'Abuelo/a' },
        { value: 'tio', label: 'Tío/a' },
        { value: 'otro', label: 'Otro' },
      ];
      
      cy.mount(
        <FormFieldInput 
          name="parentesco" 
          label="Parentesco" 
          as="select"
          options={opciones}
        />
      );
      
      cy.get('select').should('exist');
      cy.get('select option').should('have.length', 6); // 5 + "Seleccionar..."
      cy.contains('option', 'Padre').should('exist');
      cy.contains('option', 'Madre').should('exist');
    });

    it('debe mostrar placeholder "Seleccionar..." por defecto', () => {
      const opciones = [{ value: '1', label: 'Opción 1' }];
      
      cy.mount(
        <FormFieldInput 
          name="test" 
          label="Test" 
          as="select"
          options={opciones}
        />
      );
      
      cy.get('select option').first().should('contain', 'Seleccionar...');
    });
  });

  describe('2.7 Textarea para textos largos', () => {
    /**
     * EP-05: Descripción detallada de tarea
     * EP-06: Retroalimentación del docente
     */
    it('debe renderizar textarea para descripciones', () => {
      cy.mount(
        <FormFieldInput 
          name="descripcion" 
          label="Descripción de la Tarea" 
          as="textarea"
          placeholder="Describe detalladamente la actividad..."
        />
      );
      
      cy.get('textarea')
        .should('exist')
        .and('have.class', 'min-h-[100px]');
    });
  });

  describe('2.8 Texto de Ayuda', () => {
    /**
     * Guías de formato para el usuario
     * Ejemplo: Formato de DANE, requisitos de contraseña
     */
    it('debe mostrar texto de ayuda bajo el campo', () => {
      cy.mount(
        <FormFieldInput 
          name="dane" 
          label="Código DANE" 
          helpText="Ingresa exactamente 11 dígitos numéricos"
        />
      );
      
      cy.contains('Ingresa exactamente 11 dígitos numéricos').should('be.visible');
    });
  });

  describe('2.9 Interacción - Cambio de valor', () => {
    it('debe actualizar valor controlado correctamente', () => {
      const onChangeSpy = cy.spy().as('onChange');
      
      cy.mount(
        <FormFieldInput 
          name="correo" 
          label="Correo" 
          value=""
          onChange={onChangeSpy}
        />
      );
      
      cy.get('input').type('test@correo.com');
      cy.get('@onChange').should('have.been.called');
    });

    it('debe funcionar en modo no controlado', () => {
      cy.mount(
        <FormFieldInput 
          name="nombre" 
          label="Nombre" 
        />
      );
      
      cy.get('input').type('Juan Pérez');
      cy.get('input').should('have.value', 'Juan Pérez');
    });
  });

  describe('2.10 Estilos de Focus', () => {
    /**
     * Feedback visual al usuario durante edición
     */
    it('debe mostrar estilo de focus con ring teal', () => {
      cy.mount(
        <FormFieldInput 
          name="test" 
          label="Test" 
        />
      );
      
      cy.get('input')
        .should('have.class', 'focus:border-teal-500')
        .and('have.class', 'focus:ring-2');
    });
  });
});
