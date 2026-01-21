# Testing de Componentes con Cypress

## 📋 Estrategia de Testing

Los tests están organizados siguiendo el flujo de las **Historias Épicas** y **Historias de Usuario** documentadas en `/docs/`. No se prueba "por probar", cada test tiene una razón de ser basada en los criterios de aceptación del sistema.

### Orden de Testing (Flujo del Sistema)

| Fase | Descripción | Relación con Épicas |
|------|-------------|---------------------|
| **01** | Estados de Carga | Base UI para todas las épicas |
| **02** | Validaciones | EP-01, EP-02, EP-04 (formularios) |
| **03** | Autenticación | EP-02 (HU-05, HU-06, HU-07) |
| **04** | Gestión Institucional | EP-01, EP-03 *(futuro)* |
| **05** | Matrícula | EP-04 *(futuro)* |
| **06** | Tareas | EP-05, EP-06 *(futuro)* |

## 🚀 Comandos disponibles

```bash
# Abrir Cypress en modo interactivo
npm run cy:open

# Ejecutar todos los tests en modo headless
npm run cy:run

# Abrir Cypress para testing de componentes (interactivo)
npm run cy:component

# Ejecutar tests de componentes en modo headless
npm run cy:component:run

# Alias para ejecutar tests de componentes
npm run test:component
```

## 📁 Estructura de archivos

```
cypress/
├── component/
│   ├── 01-estados-carga/          # FASE 1: Componentes base
│   │   ├── LoadingSpinner.cy.tsx  # 12 tests
│   │   └── Button.cy.tsx          # 18 tests
│   ├── 02-validaciones/           # FASE 2: Formularios
│   │   ├── FormFieldInput.cy.tsx  # 17 tests
│   │   ├── Modal.cy.tsx           # 19 tests
│   │   └── ConfirmModal.cy.tsx    # 15 tests
│   └── 03-autenticacion/          # FASE 3: Login/Contraseña
│       └── ForceChangePasswordModal.cy.tsx  # 19 tests
├── support/
│   ├── test-config.ts             # Configuración y mocks
│   ├── commands.ts                # Comandos personalizados
│   └── component.ts               # Setup de componentes
└── tsconfig.json
```

## 🧪 Resumen de Tests (100 tests total)

### FASE 1: Estados de Carga (30 tests)

| Componente | Tests | Criterios verificados |
|------------|-------|----------------------|
| LoadingSpinner | 12 | Tamaños, colores, texto de progreso |
| Button | 18 | Estados loading/disabled, variantes, eventos |

**Relevancia:** Feedback visual en operaciones async (login, carga masiva HU-14)

### FASE 2: Validaciones (51 tests)

| Componente | Tests | HU Relacionadas |
|------------|-------|-----------------|
| FormFieldInput | 17 | HU-01 a HU-14 (campos de formulario) |
| Modal | 19 | HU-01, HU-03, HU-08, HU-12 |
| ConfirmModal | 15 | HU-07, HU-13 (confirmaciones) |

**Relevancia:** Validación de DANE, NIT, documentos, correos institucionales

### FASE 3: Autenticación (19 tests)

| Componente | Tests | HU Relacionada |
|------------|-------|----------------|
| ForceChangePasswordModal | 19 | HU-06 |

**Criterios de HU-06 cubiertos:**
- ✅ Modal obligatorio (no se puede cerrar)
- ✅ Formulario con 3 campos de contraseña  
- ✅ Indicador de fortaleza en tiempo real
- ✅ Botón deshabilitado hasta completar campos
- ✅ Mensaje de acción obligatoria

## 📝 Escribir nuevos tests

### Ejemplo básico

```tsx
import MiComponente from '../../src/components/MiComponente';

describe('MiComponente', () => {
  it('renderiza correctamente', () => {
    cy.mount(<MiComponente />);
    cy.get('.mi-clase').should('exist');
  });

  it('maneja eventos de click', () => {
    const onClickSpy = cy.spy().as('onClickSpy');
    cy.mount(<MiComponente onClick={onClickSpy} />);
    
    cy.get('button').click();
    cy.get('@onClickSpy').should('have.been.calledOnce');
  });
});
```

### Buenas prácticas

1. **Usar `data-cy` para selectores** cuando sea posible
2. **Agrupar tests relacionados** con `describe`
3. **Verificar accesibilidad** (roles, aria-labels)
4. **Probar estados de error y carga**
5. **Verificar comportamiento responsive** cuando aplique

## 🔧 Comandos personalizados

En `cypress/support/commands.ts`:

```typescript
// Login
cy.login('email@example.com', 'password');

// Verificar toast
cy.checkToast('Operación exitosa');

// Esperar que cargue
cy.waitForLoader();
```

## 🎯 Fixtures de datos

En `cypress/fixtures/testData.ts` hay datos mock reutilizables:

```typescript
import { mockTarea, mockCategoria, mockUsuario } from '../fixtures/testData';

// Usar en tests
cy.mount(<TareaCard tarea={mockTarea} />);
```

## 🌐 Ejecutar test específico

```bash
npm run cy:component:run -- --spec "cypress/component/Button.cy.tsx"
```

## 📊 Ver resultados

- **Modo headless**: Resultados en consola
- **Modo interactivo**: Interfaz visual con time-travel debugging
- **Screenshots**: Automáticos en fallos (`cypress/screenshots/`)

---

Para más información, consulta la [documentación oficial de Cypress](https://docs.cypress.io/).
