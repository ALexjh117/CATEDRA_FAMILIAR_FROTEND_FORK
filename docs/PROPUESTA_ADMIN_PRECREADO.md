# 📋 Propuesta: Usuario Admin Sistema Pre-creado

**Para:** Equipo de Documentación  
**De:** Equipo de Desarrollo Frontend  
**Fecha:** 20 de enero de 2026  
**Asunto:** Propuesta de arquitectura para el rol `admin_sistema` de la Secretaría de Educación

---

## 1. Contexto

Durante el análisis de las historias de usuario (EP-01 y EP-02), identificamos una **discrepancia arquitectónica** respecto al rol `admin_sistema` de la Secretaría de Educación:

- **HU-01** describe el registro de instituciones educativas
- **HU-02 a HU-04** describen la creación de usuarios administrativos (Rector, Coordinador, etc.)
- **Sin embargo**, no existe una historia de usuario que defina cómo se crea/registra el `admin_sistema`

### Pregunta clave:
> *¿Quién crea al admin_sistema si él es quien tiene el nivel más alto de permisos?*

---

## 2. Propuesta: Usuario Admin Pre-creado

### Descripción

Proponemos que el rol `admin_sistema` **NO se registre mediante un flujo de usuario**, sino que sea un usuario **pre-creado durante el despliegue inicial del sistema** (seeding de base de datos).

```
┌─────────────────────────────────────────────────────────────────┐
│                    JERARQUÍA DE USUARIOS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🏛️ SECRETARÍA DE EDUCACIÓN                                   │
│   └── admin_sistema (PRE-CREADO - No hay flujo de registro)    │
│        │                                                        │
│        ▼                                                        │
│   🏫 INSTITUCIONES EDUCATIVAS                                   │
│   └── rector ─────► coordinador ─────► orientador              │
│                           │                                     │
│                           ▼                                     │
│                      docente_aula                               │
│                           │                                     │
│                           ▼                                     │
│   👨‍👩‍👧 FAMILIAS                                                  │
│   └── acudiente (App móvil - auto-registro con código)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Características del Admin Pre-creado

| Aspecto | Detalle |
|---------|---------|
| **Creación** | Script de seed durante despliegue inicial |
| **Credenciales** | Definidas por el equipo de infraestructura |
| **Primer ingreso** | Obligatorio cambio de contraseña (HU-06 aplica) |
| **Cantidad** | Uno o más según necesidad de la Secretaría |
| **Gestión** | Solo puede ser modificado vía base de datos o panel especial |

---

## 3. Análisis de Pros y Contras

### ✅ PROS

| # | Ventaja | Descripción |
|---|---------|-------------|
| 1 | **Seguridad reforzada** | No existe endpoint público para crear admins del sistema. Elimina vector de ataque de escalación de privilegios. |
| 2 | **Control centralizado** | Solo el equipo de infraestructura/DevOps puede crear admins, siguiendo políticas de la Secretaría. |
| 3 | **Auditoría clara** | El admin existe desde el día 0, con registro claro de quién tiene acceso. |
| 4 | **Simplificación del código** | No se requiere lógica especial de registro para el nivel más alto de privilegios. |
| 5 | **Principio de mínimo privilegio** | Los usuarios comunes nunca interactúan con la creación de super-admins. |
| 6 | **Cumplimiento normativo** | Facilita cumplir con políticas de seguridad gubernamentales (MinTIC). |
| 7 | **Onboarding controlado** | Cada institución es activada manualmente por la Secretaría, garantizando verificación. |

### ❌ CONTRAS

| # | Desventaja | Mitigación |
|---|------------|------------|
| 1 | **Dependencia de infraestructura** | El equipo debe estar disponible para crear nuevos admins | Documentar proceso claro + tener admin de respaldo |
| 2 | **No escalable para múltiples secretarías** | Si el sistema crece a nivel nacional | Crear flujo especial de "super-admin" que crea admins regionales |
| 3 | **Credenciales iniciales sensibles** | Riesgo si no se cambian | Forzar cambio obligatorio en primer ingreso (HU-06) |
| 4 | **Recuperación de contraseña** | ¿Quién resetea la contraseña del admin? | Proceso manual con verificación de identidad |
| 5 | **Single point of failure** | Si el único admin pierde acceso | Crear mínimo 2 admins desde el inicio |

---

## 4. Discrepancias con Documentación Actual

### 4.1 Historias de Usuario Afectadas

| Historia | Estado Actual | Cambio Propuesto |
|----------|---------------|------------------|
| **HU-01** | No menciona quién aprueba instituciones | Agregar: "El admin_sistema (pre-existente) aprueba solicitudes" |
| **HU-02** | Menciona que "Admin registra Rector" | Mantener, pero aclarar que admin ya existe |
| **HU-05** | Login para usuarios administrativos | Agregar `admin_sistema` a la lista de roles con redirección |
| **Nueva HU** | No existe | Crear HU para "Gestión de Administradores del Sistema" (opcional, solo documentación interna) |

### 4.2 Modelo de Datos

Agregar al modelo de usuario:

```sql
-- Seed inicial del sistema
INSERT INTO usuarios (
  id, 
  correo, 
  nombre, 
  apellidos, 
  rol, 
  institucion_id,  -- NULL para admin_sistema
  primer_ingreso,
  activo,
  created_at
) VALUES (
  1,
  'admin@secretaria-educacion.gov.co',
  'Administrador',
  'Sistema',
  'admin_sistema',
  NULL,  -- No pertenece a ninguna institución específica
  TRUE,  -- Debe cambiar contraseña
  TRUE,
  NOW()
);
```

### 4.3 Endpoints de API

| Endpoint | Cambio |
|----------|--------|
| `POST /api/auth/register` | **NO debe permitir** rol `admin_sistema` |
| `POST /api/admin/usuarios` | Solo `admin_sistema` puede crear rectores |
| `GET /api/instituciones/pendientes` | Solo accesible por `admin_sistema` |

---

## 5. Implementación Sugerida

### Fase 1: Documentación
- [ ] Actualizar `04_historias_usuario.md` con aclaración sobre admin pre-creado
- [ ] Crear documento de "Proceso de Onboarding de Administradores"
- [ ] Documentar credenciales iniciales en vault seguro

### Fase 2: Backend
- [ ] Crear script de seed para admin inicial
- [ ] Agregar validación en registro para bloquear rol `admin_sistema`
- [ ] Implementar middleware de verificación de rol para rutas sensibles

### Fase 3: Frontend
- [ ] ✅ Panel de admin ya implementado (`/admin`)
- [ ] ✅ Redirección por rol configurada
- [ ] Agregar vista de "Gestión de Instituciones Pendientes"

---

## 6. Alternativas Consideradas

### Opción A: Registro por Invitación (Descartada)
Un super-admin envía invitación por correo a nuevos admins.
- **Problema:** ¿Quién crea al primer super-admin?

### Opción B: Registro Abierto con Aprobación (Descartada)
Cualquiera puede solicitar ser admin, otro admin aprueba.
- **Problema:** Vulnerabilidad si no hay admins activos.

### Opción C: Admin Pre-creado (✅ SELECCIONADA)
El sistema nace con un admin funcional desde el despliegue.
- **Ventaja:** Cadena de confianza clara desde el inicio.

---

## 7. Decisión Requerida

Solicitamos al equipo de documentación:

1. **Validar** si esta propuesta se alinea con los requerimientos de la Secretaría de Educación
2. **Actualizar** las historias de usuario según las discrepancias identificadas
3. **Confirmar** el proceso de entrega de credenciales iniciales al personal autorizado

---

## 8. Anexos

### A. Flujo de Primer Ingreso del Admin

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   DevOps     │     │   Admin      │     │   Sistema    │     │   Admin      │
│   despliega  │────►│   recibe     │────►│   detecta    │────►│   cambia     │
│   sistema    │     │   credencial │     │   primer     │     │   contraseña │
│   con seed   │     │   temporal   │     │   ingreso    │     │   (HU-06)    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │   Admin      │
                                                               │   accede a   │
                                                               │   /admin     │
                                                               │   panel      │
                                                               └──────────────┘
```

### B. Matriz de Permisos Propuesta

| Acción | admin_sistema | rector | coordinador | orientador | docente | acudiente |
|--------|:-------------:|:------:|:-----------:|:----------:|:-------:|:---------:|
| Aprobar instituciones | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Crear rectores | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Crear coordinadores | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Crear orientadores | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear docentes | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestionar banco de tareas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Asignar tareas | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ver reportes globales | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ver reportes institución | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

---

**Atentamente,**

*Equipo de Desarrollo Frontend*  
*Proyecto Cátedra de Familia*

---

> 📌 **Nota:** Este documento requiere revisión y aprobación antes de implementar cambios en la documentación oficial.
