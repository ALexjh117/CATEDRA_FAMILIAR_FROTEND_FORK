# Features

Componentes organizados por dominio/feature del negocio.

## Estructura:
```
features/
├── auth/              # Autenticación
├── instituciones/     # Gestión de instituciones
├── estudiantes/       # Gestión de estudiantes
├── usuarios/          # Gestión de usuarios
├── cursos/            # Gestión de cursos
├── reportes/          # Reportes y estadísticas
└── configuracion/     # Configuración
```

## Responsabilidad:
- Componentes específicos de cada dominio
- Lógica de UI relacionada al feature
- Composición de componentes UI básicos
- NO incluir lógica de negocio (usar hooks)

## Ejemplo:
```typescript
// features/estudiantes/EstudianteList.tsx
export function EstudianteList({ institucionId }: Props) {
  const { estudiantes, loading } = useEstudiantes(institucionId);
  
  return (
    <div>
      <SearchBar />
      <DataTable data={estudiantes} columns={columns} />
    </div>
  );
}
```
