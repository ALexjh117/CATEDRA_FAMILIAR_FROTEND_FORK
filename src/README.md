Responsabilidades de carpetas (propuesta)

- `src/components`: Componentes reutilizables (Header, Hero, RoleCard, ModalRegister, etc.).
- `src/pages`: Páginas de la app (Landing, DashboardDemo).
- `src/styles`: Hojas de estilo base (Tailwind directives, variables, fonts).
- `src/utils`: Servicios y utilidades (mockService, storage helpers).
- `src/assets`: Imágenes / Lottie / SVG optimizados.

Convenciones rápidas
- Componentes en TSX con props claramente tipadas.
- Clases Tailwind en `className`, móvil primero.
- Accesibilidad: labels en inputs, `aria-*` en toasts y modals.

Reversión
- Para revertir la integración Tailwind: eliminar `tailwind.config.cjs`, `postcss.config.cjs`, `src/styles/index.css`, y desinstalar paquetes: `npm uninstall -D tailwindcss postcss autoprefixer`.

Formularios Admin — pruebas locales y dependencias

- Para mejorar validaciones usamos `react-hook-form` + `zod`. Instala:
	- `npm install react-hook-form zod @hookform/resolvers`

- Comandos para probar localmente (PowerShell):
```powershell
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss -i ./src/styles/index.css -o ./src/tailwind.css --minify
npm run dev
```

- Ejemplos de endpoints y respuestas esperadas para el formulario Admin:
	- Crear: `POST /api/users` -> 201 `{ id: 'u-123', message: 'Usuario creado', user: { ... } }`
	- Editar: `PUT /api/users/{id}` -> 200 `{ message: 'Usuario actualizado', user: { ... } }`
	- Error validación 400/422: `{ errors: { email: 'Email ya registrado', firstName: '...' } }`
	- Error genérico 500: `{ message: 'Error interno' }`


 Dashboards Preview (rutas y cómo funciona)

 - Rutas públicas:
	 - `/dashboard?role=parent`
	 - `/dashboard?role=teacher`
	 - `/dashboard?role=admin`

 - Role switcher:
	 - Dropdown en el header `RoleSwitcher` y `FloatingRoleSwitch` en esquina inferior.
	 - Cambia la ruta y guarda en `localStorage.previewRole`.
	 - Muestra toast: `Vista: {role} (solo preview)` y badge `Preview mode` en el header.

 - API contract recomendado:
	 - `GET /api/dashboard?role={role}` -> ver ejemplos en la sección "Formularios Admin — pruebas locales y dependencias".
	 - Si el fetch falla: el frontend muestra estado vacío (sin errores JS) y CTA para demo.

