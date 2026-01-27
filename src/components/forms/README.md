# Forms

Formularios con React Hook Form y validación Zod.

## Estructura:
```
forms/
├── InstitucionForm/
├── UsuarioForm/
├── EstudianteForm/
├── CursoForm/
└── shared/           # Componentes compartidos de formularios
```

## Responsabilidad:
- Manejo de formularios con React Hook Form
- Validación con Zod schemas
- Componentes de formulario reutilizables
- Estados de loading, error, success

## Ejemplo:
```typescript
// forms/EstudianteForm/EstudianteForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { estudianteSchema } from '@/lib/validations/schemas';

export function EstudianteForm({ onSubmit, defaultValues }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(estudianteSchema),
    defaultValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('nombres')} error={errors.nombres?.message} />
      {/* ... */}
    </form>
  );
}
```
