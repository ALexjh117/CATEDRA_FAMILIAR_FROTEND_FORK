# Hooks

Custom hooks reutilizables para lógica de negocio.

## Estructura:
- `useAuth.ts` - Autenticación y sesión
- `useInstituciones.ts` - Gestión de instituciones
- `useEstudiantes.ts` - Gestión de estudiantes
- `useUsuarios.ts` - Gestión de usuarios
- `useCursos.ts` - Gestión de cursos
- `useDebounce.ts` - Debounce para búsquedas
- `useTable.ts` - Lógica de tablas (paginación, filtros)

## Ejemplo:
```typescript
export function useEstudiantes(institucionId: number) {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lógica de fetch, CRUD, etc.
  
  return { estudiantes, loading, refetch };
}
```
