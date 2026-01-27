# Lib

Utilidades, validaciones y constantes compartidas.

## Estructura:

### `/validations`
Esquemas de validación con Zod (cuando se instale).
- Schemas para formularios
- Reglas de validación reutilizables

### `/constants`
Constantes de la aplicación.
- Roles de usuario
- Rutas
- Configuraciones

### `/formatters`
Funciones de formateo.
- Fechas
- Números
- Teléfonos
- Moneda

## Ejemplo:
```typescript
// constants/roles.ts
export const ROLES = {
  ADMIN: 1,
  RECTOR: 2,
  COORDINADOR: 3,
  ORIENTADOR: 4,
  DOCENTE: 5,
  ACUDIENTE: 6
} as const;

export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'admin_sistema',
  [ROLES.RECTOR]: 'rector',
  [ROLES.COORDINADOR]: 'coordinador',
  [ROLES.ORIENTADOR]: 'orientador',
  [ROLES.DOCENTE]: 'docente_aula',
  [ROLES.ACUDIENTE]: 'acudiente'
} as const;
```
