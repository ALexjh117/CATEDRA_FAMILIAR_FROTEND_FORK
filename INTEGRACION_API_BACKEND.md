# 🔗 Integración API Backend - Cátedra de Familia

## 📋 Resumen de Implementación

Se ha implementado la integración centralizada con el backend real usando los siguientes archivos:

### Archivos Creados/Modificados

| Archivo | Descripción |
|---------|-------------|
| `src/api/httpService.ts` | Servicio HTTP centralizado con fetch |
| `src/api/apiClient.ts` | Cliente API con endpoints tipados |
| `src/api/endpoints.ts` | Endpoints con fallback a mocks |

---

## 🌐 Configuración del Backend

**Base URL:** `http://localhost:3333`  
**Token Expiration:** 7 días  
**Content-Type:** `application/json`  

### Variables de Entorno

```env
VITE_API_URL=http://localhost:3333
VITE_BYPASS_VALIDATIONS=false
```

---

## 🔐 Endpoints Implementados

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/admin/login` | Login del admin sistema |

**Request:**
```json
{
  "correo": "admin@educacionpopayan.gov.co",
  "contrasena": "MiPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "jwt...",
    "usuario": {
      "id": 1,
      "correo": "admin@...",
      "rolId": 1,
      "estaActivo": true,
      "debeCambiarContrasena": false
    }
  }
}
```

---

### Gestión de Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/admin/rectores` | Crear rector |
| `POST` | `/admin/coordinadores` | Crear coordinador |
| `POST` | `/usuarios/cambiar-password` | Cambiar contraseña |

**Crear Rector/Coordinador:**
```json
{
  "correo": "rector@institucion.edu.co",
  "contrasena": "TempPass123!",
  "nombre": "Juan",
  "apellido": "Pérez",
  "telefono": "3001234567",
  "institucionId": 1
}
```

**Cambiar Contraseña:**
```json
{
  "contrasenaActual": "passwordActual",
  "contrasenaNueva": "NuevaPassword123!",
  "confirmarContrasena": "NuevaPassword123!"
}
```

---

### Instituciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/admin/instituciones/pendientes` | Listar instituciones pendientes |
| `PUT` | `/admin/instituciones/:id/aprobar` | Aprobar institución |

---

### Carga Masiva de Estudiantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/estudiantes/plantilla-excel` | Descargar plantilla Excel |
| `POST` | `/estudiantes/validar-excel` | Validar archivo Excel |
| `POST` | `/estudiantes/carga-masiva` | Ejecutar carga masiva |

**Validar/Carga Masiva (multipart/form-data):**
```
archivo: File
cursoId: number (solo para carga masiva)
```

---

### Notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/notificaciones/token` | Registrar token FCM |

---

## ✅ Validaciones Implementadas

### Contraseña
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial (!@#$%^&*)

### Email
- Formato válido de email

### Teléfono
- Exactamente 10 dígitos

---

## 🧪 Modo Desarrollo (Bypass)

Para habilitar mocks sin conectar al backend real:

```javascript
// En consola del navegador
localStorage.setItem('bypassValidations', 'true');

// O variable de entorno
VITE_BYPASS_VALIDATIONS=true
```

---

## 📁 Estructura de Respuestas

Todas las respuestas del backend siguen este formato:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
```

---

## 🔄 Manejo de Errores

- **401 Unauthorized**: Limpia token y redirige a login
- **Timeout**: 15 segundos máximo por request
- **Network Error**: Muestra mensaje de conexión fallida

---

## 📝 Uso en Componentes

```typescript
import { login, crearRector, cambiarContrasena } from '@/api/endpoints';

// Login
const result = await login(email, password);
if (result.success) {
  // Usuario autenticado
}

// Crear Rector
const rector = await crearRector({
  correo: 'rector@mail.com',
  contrasena: 'Pass123!',
  nombre: 'Juan',
  apellido: 'Pérez',
  telefono: '3001234567',
  institucionId: 1
});

// Cambiar contraseña
const cambio = await cambiarContrasena(
  userId,
  'passActual',
  'NuevaPass123!',
  'NuevaPass123!'
);
```

---

## 📌 Notas Importantes

1. **Tokens**: Se almacenan en `localStorage.session`
2. **Renovación**: Token expira en 7 días, backend debe implementar refresh
3. **Multipart**: Para Excel se usa `fetch` directo, no httpService
4. **Roles Backend**: 1=admin, 2=rector, 3=coordinador, 4=orientador, 5=docente, 6=acudiente

---

**Última actualización:** $(date)  
**Versión:** 1.0.0
