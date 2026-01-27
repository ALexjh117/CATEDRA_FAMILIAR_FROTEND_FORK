# 📐 Arquitectura Frontend - Cátedra de Familia

**Última actualización:** 27 Enero 2026

---

## 🗂️ Estructura de Carpetas

```
src/
├── api/                          # Comunicación con backend
│   ├── apiClient.ts             # Cliente API centralizado (Admin, Rector, Coordinador)
│   ├── endpoints.ts             # Funciones wrapper legacy
│   ├── endpointsDocente-orientador.ts  # APIs de Docente y Orientador
│   └── httpService.ts           # Servicio HTTP base
│
├── components/
│   ├── ui/                      # ✅ Componentes UI básicos reutilizables
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── ...
│   ├── features/                # 🆕 Componentes por dominio de negocio
│   │   ├── auth/
│   │   ├── instituciones/
│   │   ├── estudiantes/
│   │   └── ...
│   ├── forms/                   # 🆕 Formularios con React Hook Form
│   │   ├── InstitucionForm/
│   │   ├── UsuarioForm/
│   │   └── ...
│   ├── layout/                  # 🆕 Layouts y estructura
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── [legacy]/                # ⚠️ Componentes antiguos a migrar
│
├── pages/                       # Páginas (solo orquestación)
│   ├── admin/
│   ├── coordinador/
│   ├── rector/
│   └── ...
│
├── hooks/                       # 🆕 Custom hooks
│   ├── useAuth.ts
│   ├── useEstudiantes.ts
│   └── ...
│
├── store/                       # 🆕 State management global
│   ├── auth.store.ts
│   ├── user.store.ts
│   └── ui.store.ts
│
├── lib/                         # 🆕 Utilidades y helpers
│   ├── validations/            # Schemas Zod
│   ├── constants/              # Constantes
│   └── formatters/             # Funciones de formateo
│
├── types/                       # Tipos TypeScript globales
├── utils/                       # Utilidades generales
├── mocks/                       # Datos mock
└── styles/                      # Estilos globales
```

---

## 📋 Responsabilidades por Capa

### 1. **API Layer** (`/api`)
- ✅ **Responsabilidad:** Comunicación con backend
- ✅ **Contiene:** Servicios HTTP, interceptores, tipos de respuesta
- ❌ **NO contiene:** Lógica de negocio, componentes UI

### 2. **Hooks** (`/hooks`)
- ✅ **Responsabilidad:** Lógica de negocio reutilizable
- ✅ **Contiene:** Custom hooks, manejo de estado, side effects
- ❌ **NO contiene:** UI, componentes visuales

### 3. **Store** (`/store`)
- ✅ **Responsabilidad:** Estado global de la aplicación
- ✅ **Contiene:** Stores de Zustand, estado compartido
- ❌ **NO contiene:** Lógica de negocio compleja

### 4. **Components** (`/components`)

#### `/ui` - Componentes UI Básicos
- ✅ **Responsabilidad:** Componentes visuales reutilizables
- ✅ **Contiene:** Buttons, Inputs, Modals, Cards
- ❌ **NO contiene:** Lógica de negocio, llamadas API

#### `/features` - Componentes de Dominio
- ✅ **Responsabilidad:** UI específica de cada feature
- ✅ **Contiene:** Listas, cards, filtros por dominio
- ❌ **NO contiene:** Lógica de negocio (usar hooks)

#### `/forms` - Formularios
- ✅ **Responsabilidad:** Formularios con validación
- ✅ **Contiene:** React Hook Form + Zod
- ❌ **NO contiene:** Lógica de negocio compleja

#### `/layout` - Layouts
- ✅ **Responsabilidad:** Estructura de páginas
- ✅ **Contiene:** Sidebars, headers, footers
- ❌ **NO contiene:** Lógica de negocio

### 5. **Pages** (`/pages`)
- ✅ **Responsabilidad:** Orquestación de features
- ✅ **Contiene:** Composición de componentes, routing
- ❌ **NO contiene:** Lógica de negocio, formularios inline

### 6. **Lib** (`/lib`)
- ✅ **Responsabilidad:** Utilidades compartidas
- ✅ **Contiene:** Validaciones, constantes, formatters
- ❌ **NO contiene:** Componentes, hooks

---

## 🎯 Principios de Diseño

### 1. **Separación de Responsabilidades**
- Cada archivo tiene UNA responsabilidad clara
- Componentes <300 líneas
- Lógica separada de presentación

### 2. **Composición sobre Herencia**
- Componentes pequeños y reutilizables
- Composición de features en páginas
- Props claras y tipadas

### 3. **DRY (Don't Repeat Yourself)**
- Lógica común en hooks
- Componentes UI reutilizables
- Validaciones centralizadas

### 4. **Type Safety**
- TypeScript estricto
- Interfaces bien definidas
- Tipos compartidos en `/types`

---

## 🚀 Flujo de Datos

```
Usuario → Página → Feature Component → Hook → API Service → Backend
                                        ↓
                                      Store (estado global)
```

### Ejemplo Completo:

```typescript
// 1. API Service (api/services/estudiante.service.ts)
export const estudianteService = {
  getAll: (filters) => httpClient.get('/estudiantes', { params: filters })
};

// 2. Hook (hooks/useEstudiantes.ts)
export function useEstudiantes(institucionId: number) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    estudianteService.getAll({ institucionId })
      .then(setEstudiantes)
      .finally(() => setLoading(false));
  }, [institucionId]);
  
  return { estudiantes, loading };
}

// 3. Feature Component (components/features/estudiantes/EstudianteList.tsx)
export function EstudianteList({ institucionId }: Props) {
  const { estudiantes, loading } = useEstudiantes(institucionId);
  
  if (loading) return <LoadingSpinner />;
  
  return <DataTable data={estudiantes} columns={columns} />;
}

// 4. Page (pages/coordinador/EstudiantesPage.tsx)
export default function EstudiantesPage() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout>
      <PageHeader title="Estudiantes" />
      <EstudianteList institucionId={user.institucionId} />
    </DashboardLayout>
  );
}
```

---

## 📦 Dependencias Futuras

Para completar la refactorización, se necesitarán:

```json
{
  "dependencies": {
    "react-hook-form": "^7.53.2",
    "@hookform/resolvers": "^3.9.1",
    "zod": "^3.24.1",
    "zustand": "^5.0.2",
    "axios": "^1.7.9"
  }
}
```

---

## 📝 Guía de Migración

### Paso 1: Identificar componente a migrar
- Buscar componentes >500 líneas
- Identificar lógica de negocio mezclada con UI

### Paso 2: Extraer lógica a hooks
```typescript
// Antes (en componente)
const [data, setData] = useState([]);
useEffect(() => { /* fetch */ }, []);

// Después (en hook)
const { data, loading } = useData();
```

### Paso 3: Crear componentes de feature
- Separar UI en componentes pequeños
- Usar composición

### Paso 4: Implementar formularios con RHF
- Crear schema Zod
- Usar React Hook Form
- Validación automática

### Paso 5: Actualizar página
- Usar nuevos componentes
- Mantener solo orquestación

---

## ✅ Estado Actual

- ✅ Estructura de carpetas creada
- ✅ READMEs documentados
- ✅ API centralizada para Admin, Rector, Coordinador
- ⏳ Pendiente: Instalar dependencias (RHF, Zod, Zustand)
- ⏳ Pendiente: Migrar componentes legacy
- ⏳ Pendiente: Crear hooks
- ⏳ Pendiente: Implementar formularios

---

## 🎓 Recursos

- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [TypeScript](https://www.typescriptlang.org/)
