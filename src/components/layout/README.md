# Layout

Componentes de layout y estructura de páginas.

## Estructura:
- `DashboardLayout.tsx` - Layout principal del dashboard
- `Sidebar.tsx` - Barra lateral de navegación
- `Header.tsx` - Encabezado
- `Footer.tsx` - Pie de página

## Responsabilidad:
- Estructura visual de las páginas
- Navegación
- Menús y sidebars
- Headers y footers
- NO incluir lógica de negocio

## Ejemplo:
```typescript
// layout/DashboardLayout.tsx
export function DashboardLayout({ children }: Props) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```
