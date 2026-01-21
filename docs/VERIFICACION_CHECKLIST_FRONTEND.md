# 📋 VERIFICACIÓN: Checklist Frontend vs Documentación

**Para:** Equipo de Documentación  
**De:** Equipo de Desarrollo Frontend  
**Fecha:** 21 de Enero de 2026  
**Asunto:** Análisis de discrepancias entre Checklist Frontend y Documentación Oficial

---

## 📊 RESUMEN EJECUTIVO

Se realizó una verificación exhaustiva comparando el **Checklist de Implementación Frontend** recibido contra la **documentación oficial** en el directorio `/docs` y la **implementación actual** del código.

### Estado General

| Categoría | Documentado | Implementado | Pendiente | Discrepancias |
|-----------|:-----------:|:------------:|:---------:|:-------------:|
| Autenticación | ✅ | ⚠️ Parcial | 3 items | 2 |
| Redirección | ✅ | ⚠️ Parcial | 2 items | 1 |
| Cambio Contraseña | ✅ | ⚠️ Parcial | 4 items | 2 |
| Gestión Sesiones | ✅ | ⚠️ Parcial | 2 items | 0 |
| Admin Sistema | ✅ | ✅ | 0 items | 0 |

---

## 1. 🔐 AUTENTICACIÓN Y SESIONES

### 1.1 Pantalla de Login

| Requisito | Carta | Docs 04_HU | Docs 02_RF | Implementado | Estado |
|-----------|:-----:|:----------:|:----------:|:------------:|:------:|
| Formulario único para todos los roles | ✅ | ✅ HU-05 | ✅ RF-NU-001 | ✅ LoginPage.tsx | ✅ OK |
| Campo correo electrónico | ✅ | ✅ | ✅ | ✅ | ✅ OK |
| Campo contraseña | ✅ | ✅ | ✅ | ✅ | ✅ OK |
| Botón "Ingresar" | ✅ | ✅ | ✅ | ✅ | ✅ OK |
| **reCAPTCHA obligatorio** | ✅ | ✅ HU-05 #1-2 | ✅ RF-NU-001 | ❌ No implementado | 🔴 **GAP** |
| Validar @educacionpopayan.gov.co para Admin | ✅ | ✅ RF-NU-001 | ✅ | ❌ No validado | 🔴 **GAP** |
| Mensaje genérico "Correo o contraseña incorrectos" | ✅ | ✅ HU-05 #4 | ✅ | ✅ | ✅ OK |
| Almacenar JWT en localStorage | ✅ | ✅ HU-05 #10 | ✅ | ✅ via api/endpoints.ts | ✅ OK |

#### 📍 Discrepancia #1: reCAPTCHA NO IMPLEMENTADO

**Ubicación:** `src/pages/LoginPage.tsx`

**Carta dice:**
> Implementar reCAPTCHA obligatorio (Google reCAPTCHA v2 o v3)

**Documentación HU-05 dice:**
> | 1 | Pantalla de login | ... | Se muestra formulario con: correo, contraseña, **reCAPTCHA**, botón "Ingresar" |
> | 2 | Validación de reCAPTCHA | Usuario no resuelve reCAPTCHA | Botón "Ingresar" permanece deshabilitado |

**Estado actual:** El `LoginPage.tsx` NO tiene integración con Google reCAPTCHA. Solo existe un mock en los tests de Cypress.

**Acción requerida:**
```
1. Instalar: npm install react-google-recaptcha
2. Agregar componente <ReCAPTCHA> en LoginPage.tsx
3. Deshabilitar botón "Ingresar" hasta resolver captcha
4. Obtener site key de Google reCAPTCHA
```

---

#### 📍 Discrepancia #2: Validación de dominio @educacionpopayan.gov.co

**Carta dice:**
> Validar que el campo correo acepte @educacionpopayan.gov.co para Admin Sistema

**Documentación RF-NU-001 dice:**
> - **Admin Sistema**: correo @educacionpopayan.gov.co (pre-existente en sistema)

**Estado actual:** No hay validación de dominio en el frontend. El login acepta cualquier correo.

**Acción requerida:** Agregar validación visual (no bloquear, solo informar) cuando el correo tiene dominio gubernamental.

---

### 1.2 Redirección Post-Login

| Requisito | Carta | Docs HU-05 | Implementado | Estado |
|-----------|:-----:|:----------:|:------------:|:------:|
| Admin Sistema → `/admin/instituciones` | ✅ | ✅ (Panel de instituciones) | ⚠️ `/dashboard/admin` | 🟡 **DIFERENTE** |
| Rector → `/institucional/dashboard` | ✅ | ✅ (Panel Gestión Institucional) | `/dashboard/rector` | 🟡 Diferente ruta |
| Coordinador → `/institucional/dashboard` | ✅ | ✅ (Panel Matrícula y Cursos) | `/dashboard/coordinador` | 🟡 Diferente ruta |
| Orientador → `/tareas/banco` | ✅ | ✅ (Panel Banco de Tareas) | `/dashboard/orientador` | 🟡 Diferente ruta |
| Docente → `/tareas/asignaciones` | ✅ | ✅ (Panel Asignaciones) | `/dashboard/docente` | 🟡 Diferente ruta |
| Si `debe_cambiar_contrasena` → `/cambiar-password` | ✅ | ✅ HU-06 #1 | ✅ ForceChangePasswordModal | ✅ OK |

#### 📍 Discrepancia #3: Rutas diferentes a la carta

**Carta propone:**
```
/admin/instituciones
/institucional/dashboard
/tareas/banco
/tareas/asignaciones
```

**Implementación actual:**
```
/dashboard/admin
/dashboard/rector
/dashboard/coordinador
/dashboard/orientador
/dashboard/docente
```

**Documentación (HU-05):** Solo menciona "Panel de..." sin especificar rutas exactas.

**Decisión necesaria:** ¿Mantener estructura `/dashboard/{rol}` o migrar a la estructura propuesta en la carta?

**Recomendación:** La estructura actual `/dashboard/{rol}` es consistente y funcional. Propongo documentar esta convención y NO cambiar las rutas.

---

### 1.3 Cambio de Contraseña Obligatorio

| Requisito | Carta | Docs HU-06 | Implementado | Estado |
|-----------|:-----:|:----------:|:------------:|:------:|
| Aplica a TODOS los roles incluyendo Admin Sistema | ✅ | ✅ | ✅ | ✅ OK |
| Campos: actual, nueva, confirmar | ✅ | ✅ HU-06 #2 | ✅ | ✅ OK |
| Bloquear navegación hasta completar | ✅ | ✅ HU-06 #1 | ✅ Modal sin onClose | ✅ OK |
| Validar nueva ≠ actual | ✅ | ✅ HU-06 #6 | ✅ | ✅ OK |
| **Checklist visual mínimo 8 caracteres** | ✅ | ✅ HU-06 #3 | ⚠️ Solo 6 caracteres | 🔴 **GAP** |
| **Checklist: 1 mayúscula** | ✅ | ✅ HU-06 #3 | ❌ No implementado | 🔴 **GAP** |
| **Checklist: 1 número** | ✅ | ✅ HU-06 #3 | ❌ No implementado | 🔴 **GAP** |
| **Checklist: 1 especial (@#$%&*)** | ✅ | ✅ HU-06 #3 | ❌ No implementado | 🔴 **GAP** |
| Mensaje "contraseñas no coinciden" | ✅ | ✅ HU-06 #4 | ✅ | ✅ OK |
| Mensaje "contraseña actual incorrecta" | ✅ | ✅ HU-06 #5 | ✅ | ✅ OK |

#### 📍 Discrepancia #4: Checklist de requisitos incompleto

**Carta y HU-06 dicen:**
> Checklist visual en tiempo real:
> - ✅ Mínimo 8 caracteres
> - ✅ 1 letra mayúscula
> - ✅ 1 número
> - ✅ 1 carácter especial (@#$%&*)

**Implementación actual (ForceChangePasswordModal.tsx línea 29-31):**
```tsx
if (newPassword.length < 6) {
  setError('La nueva contraseña debe tener al menos 6 caracteres');
  return;
}
```

**Problemas encontrados:**
1. ❌ Valida 6 caracteres, documentación dice 8
2. ❌ No hay checklist visual en tiempo real
3. ❌ No valida mayúscula, número, ni especial
4. ⚠️ Solo muestra indicador "Fortaleza" básico (Débil/Media/Fuerte)

**Acción requerida:** Reescribir sección de validación con checklist visual completo.

---

### 1.4 Gestión de Sesiones

| Requisito | Carta | Docs HU-07 | Implementado | Estado |
|-----------|:-----:|:----------:|:------------:|:------:|
| JWT expira en 24 horas | ✅ | ✅ HU-05 #10 | ⚠️ Solo mock | 🟡 Backend |
| Botón "Cerrar Sesión" visible | ✅ | ✅ HU-07 #1 | ✅ DashboardLayout | ✅ OK |
| Diálogo de confirmación | ✅ | ✅ HU-07 #2 | ⚠️ Implementado básico | ✅ OK |
| Limpiar localStorage | ✅ | ✅ HU-07 #5 | ✅ | ✅ OK |
| Redirigir a /login | ✅ | ✅ HU-07 #4 | ✅ | ✅ OK |

---

## 2. 🏢 GESTIÓN DE INSTITUCIONES (Admin Sistema)

### 2.1 Panel Principal

| Requisito | Carta | Docs HU-01 | Implementado | Estado |
|-----------|:-----:|:----------:|:------------:|:------:|
| Ruta `/admin/instituciones` | ✅ | - | ⚠️ `/dashboard/admin` | 🟡 Ruta diferente |
| NO pantalla "Registrar Admin" | ✅ | ✅ PROPUESTA | ✅ No existe | ✅ OK |
| Listar instituciones con filtros | ✅ | ✅ HU-01 | ✅ DashboardAdminPage | ✅ OK |
| Botón "+ Nueva Institución" | ✅ | ✅ HU-01 #1 | ✅ | ✅ OK |

### 2.2 Formulario de Institución

| Campo | Carta | Docs HU-01/RF-NU-004 | Implementado | Estado |
|-------|:-----:|:--------------------:|:------------:|:------:|
| Nombre oficial | ✅ | ✅ | ✅ | ✅ OK |
| Código DANE (11 dígitos) | ✅ | ✅ HU-01 #2 | ✅ | ✅ OK |
| NIT (formato colombiano) | ✅ | ✅ HU-01 #3 | ✅ | ✅ OK |
| Niveles educativos (checkboxes) | ✅ | ✅ HU-01 #4 | ⚠️ Dropdown | 🟡 UI diferente |
| Teléfono principal | ✅ | ✅ | ✅ | ✅ OK |
| Correo institucional | ✅ | ✅ | ✅ | ✅ OK |
| Naturaleza (Pública/Privada) | ✅ | ✅ | ✅ | ✅ OK |
| Municipio: Popayán (fijo) | ✅ | ✅ RF-NU-004 | ⚠️ Dropdown editable | 🟡 |
| Validación unicidad DANE | ✅ | ✅ HU-01 #5 | ⚠️ Backend pendiente | 🟡 |
| Validación unicidad NIT | ✅ | ✅ HU-01 #6 | ⚠️ Backend pendiente | 🟡 |

---

## 3. 👥 GESTIÓN DE USUARIOS (Admin Sistema)

### 3.1 Registro de Rectores

| Requisito | Carta | Docs HU-03 | Implementado | Estado |
|-----------|:-----:|:----------:|:------------:|:------:|
| Campos personales | ✅ | ✅ HU-03 #1 | ✅ AdminUserForm | ✅ OK |
| Dropdown institución (sin rector activo) | ✅ | ✅ HU-03 #2 | ⚠️ Muestra todas | 🟡 GAP |
| Validación correo institucional | ✅ | ✅ HU-03 #3 | ⚠️ Básica | 🟡 |
| Generar contraseña temporal | ✅ | ✅ HU-03 #5 | ⚠️ Mock | 🟡 Backend |
| Un rector por institución | ✅ | ✅ HU-03 #8 | ⚠️ Sin validación | 🟡 GAP |

---

## 4. 🔴 RESUMEN DE GAPS CRÍTICOS

### Implementación Pendiente (Frontend)

| # | Componente | Gap | Prioridad | Esfuerzo |
|---|------------|-----|:---------:|:--------:|
| 1 | LoginPage.tsx | Implementar reCAPTCHA | 🔴 Alta | 4h |
| 2 | ForceChangePasswordModal.tsx | Checklist visual 8+ chars, mayúscula, número, especial | 🔴 Alta | 3h |
| 3 | LoginPage.tsx | Validación dominio @educacionpopayan.gov.co | 🟡 Media | 1h |
| 4 | AdminUserForm.tsx | Filtrar instituciones sin rector | 🟡 Media | 2h |

### Decisiones de Arquitectura Pendientes

| # | Tema | Opciones | Recomendación |
|---|------|----------|---------------|
| 1 | Estructura de rutas | `/dashboard/{rol}` vs `/admin/instituciones`, `/tareas/banco` | Mantener `/dashboard/{rol}` por consistencia |
| 2 | Niveles educativos | Checkboxes vs Dropdown multi-select | Migrar a checkboxes según carta |

---

## 5. ✅ CONFIRMACIONES DE ALINEACIÓN

Los siguientes puntos están **correctamente alineados** entre carta, documentación e implementación:

1. ✅ **Admin Sistema pre-creado** - No existe pantalla de registro de admin
2. ✅ **Login único** para todos los roles
3. ✅ **Cambio de contraseña obligatorio** en primer ingreso (flag `debe_cambiar_contrasena`)
4. ✅ **Modal no-cerrable** para cambio de contraseña
5. ✅ **Redirección diferenciada** por rol tras login
6. ✅ **Mensaje genérico** de error en credenciales incorrectas
7. ✅ **Botón cerrar sesión** con confirmación
8. ✅ **Limpieza de localStorage** al cerrar sesión
9. ✅ **Panel de instituciones** como vista principal del admin
10. ✅ **Validación DANE** 11 dígitos
11. ✅ **Validación NIT** formato colombiano

---

## 6. 📝 CONCLUSIONES Y PRÓXIMOS PASOS

### Para Equipo de Documentación

1. **Confirmar** si las rutas deben ser `/dashboard/{rol}` o la estructura propuesta en la carta
2. **Validar** que el requisito de 8 caracteres mínimos es correcto (actualmente código usa 6)
3. **Aclarar** si la validación del dominio de correo es obligatoria o solo informativa

### Para Equipo Frontend

1. **Prioridad 1:** Implementar reCAPTCHA en LoginPage.tsx
2. **Prioridad 2:** Actualizar validación de contraseña a 8+ chars con checklist visual
3. **Prioridad 3:** Agregar validación de "una institución = un rector"
4. **Prioridad 4:** Convertir selector de niveles educativos a checkboxes

### Para Equipo Backend

1. Confirmar endpoint de validación unicidad DANE/NIT
2. Implementar generación de contraseña temporal segura
3. Endpoint para listar instituciones sin rector asignado

---

**Atentamente,**

*Equipo de Desarrollo Frontend*  
*Proyecto PARCHANDO JUNTOS - Cátedra de Familia*

---

> 📌 Este documento refleja el estado de verificación al 21 de Enero de 2026
