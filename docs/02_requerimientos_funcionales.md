# CÁTEDRA DE FAMILIA - PARCHANDO JUNTOS
## Requerimientos Funcionales y No Funcionales

**Identificador:** CATFAM-2026-001  
**Fecha:** 9 de Enero de 2026

---

## REQUISITOS FUNCIONALES

### RF-NU-001: Inicio de sesión (Plataforma Web Administrativa)

| **Nombre** | Inicio de sesión web administrativo |
| **Identificador** | RF-NU-001 |
| **Descripción** | Sistema de autenticación para usuarios administrativos en la plataforma web (React). El admin_sistema es un funcionario de la Secretaría de Educación Municipal de Popayán pre-creado durante el despliegue (no se registra mediante flujo de usuario) |
| **Rol** | Admin Sistema, Rector, Coordinador, Orientador, Docente |
| **Prioridad** | Alta |
| **Plataforma** | **Web (React + Vite + TS)** |

**ENTRADAS:**
- Correo electrónico institucional
- Contraseña
- Validación de reCAPTCHA

**SALIDAS:**
- Si los datos son válidos: redireccionar al dashboard según el rol
  - Admin Sistema → Panel de instituciones
  - Rector/Coordinador → Panel de gestión institucional
  - Orientador → Panel de banco de tareas
  - Docente → Panel de asignaciones y calificaciones
- Si los datos son incorrectos: mostrar mensaje de error específico
- Para primer ingreso: forzar cambio de contraseña

**CRITERIOS DE ACEPTACIÓN:**
- **Admin Sistema**: correo @educacionpopayan.gov.co (pre-existente en sistema)
- **Rector/Coordinador**: correo @institución.edu.co
- **Orientador/Docente**: correo institucional asignado
- reCAPTCHA obligatorio para todos los roles (seguridad administrativa)
- Contraseña: mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial
- Sesiones expiran después de 24 horas de inactividad
- Registro de IP y agente de usuario en tabla auditoria

---

### RF-NU-002: Cerrar sesión (Plataforma Web)

| **Nombre** | Cerrar sesión |
| **Identificador** | RF-NU-002 |
| **Descripción** | Botón para cerrar la sesión de usuarios administrativos en la plataforma web |
| **Rol** | Admin General, Rector, Coordinador, Orientador, Docente |
| **Prioridad** | Media |
| **Plataforma** | **Web (React + Vite + TS)** |

**ENTRADAS:**
- Botón "Cerrar sesión"

**SALIDAS:**
- Al dar clic en el botón, cerrar sesión y redirigir al login
- Limpiar todos los datos de sesión

**CRITERIOS DE ACEPTACIÓN:**
- Debe existir el botón en todas las vistas principales
- Solicitar confirmación antes de cerrar sesión

---

### RF-NU-003: Gestionar registro de rectores/coordinadores institucionales

| **Nombre** | Gestionar registro de rectores y coordinadores |
| **Identificador** | RF-NU-003 |
| **Descripción** | El admin general (Secretaría de Educación) registra rectores y coordinadores de las instituciones educativas |
| **Rol** | Admin General (Secretaría de Educación Municipal) |
| **Prioridad** | Alta |

**ENTRADAS:**
- Nombres y apellidos
- Tipo y número de documento
- Teléfono y correo institucional
- Cargo (Rector, Coordinador Académico, Coordinador de Convivencia)
- Institución a la que pertenece
- Contraseña temporal

**SALIDAS:**
- Crear usuario con rol correspondiente
- Enviar credenciales por correo electrónico
- Vincular automáticamente a la institución
- Mostrar confirmación de registro exitoso

**CRITERIOS DE ACEPTACIÓN:**
- Solo el admin general puede crear estos roles
- El correo debe ser institucional (@educativo.gov.co o @institución.edu.co)
- Cada institución puede tener múltiples coordinadores pero un solo rector activo
- Contraseña temporal debe cambiarse en el primer login
- No permitir documentos duplicados en el sistema

---

### RF-NU-004: Gestionar registro de instituciones educativas

| **Nombre** | Registro de instituciones educativas del municipio |
| **Identificador** | RF-NU-004 |
| **Descripción** | El admin general registra instituciones educativas oficiales y privadas del municipio de Popayán en el sistema |
| **Rol** | Admin General (Secretaría de Educación Municipal) |
| **Prioridad** | Alta |

**ENTRADAS OBLIGATORIAS:**
- Nombre oficial de la institución (según registro MEN)
- Código DANE de la institución (11 dígitos numéricos)
- NIT de la institución (formato colombiano con dígito verificador)
- Niveles educativos que ofrece (checkboxes: Preescolar, Primaria, Secundaria, Media)
- Teléfono principal de contacto
- Correo institucional oficial
- Naturaleza (Pública/Privada)
- Municipio (Popayán por defecto)

**ENTRADAS OPCIONALES (completar posteriormente):**
- Resolución de aprobación del MEN
- Modalidad educativa (presencial, virtual, semipresencial)
- Jornadas (mañana, tarde, noche, única, sabatina)
- Teléfono secretaría, correo rectoría, sitio web
- Dirección completa, barrio, estrato, coordenadas GPS
- Capacidad de estudiantes, año de fundación, enfoque pedagógico
- Confesional (sí/no), religión
- Datos del rector (nombre, documento, teléfono, correo)

**SALIDAS:**
- Crear registro de institución con ID único (multitenancy)
- Generar estructura de base de datos aislada por institución
- Habilitar módulos específicos según el tipo de institución
- Confirmar registro exitoso con código de institución
- Opción "Completar información" para campos opcionales

**CRITERIOS DE ACEPTACIÓN:**
- Solo instituciones del municipio de Popayán
- Código DANE debe ser válido y único (validación frontend: 11 dígitos numéricos)
- NIT debe tener formato colombiano con dígito verificador
- Al menos un nivel educativo debe seleccionarse
- Cada institución tiene aislamiento completo de datos (multitenancy)
- Genera automáticamente configuración inicial (períodos académicos, grados básicos)
- Campos opcionales pueden completarse posteriormente vía "Editar Institución"

---

### RF-NU-004B: Editar información institucional

| **Nombre** | Editar y completar información institucional |
| **Identificador** | RF-NU-004B |
| **Descripción** | El admin general puede editar y completar la información adicional de las instituciones previamente registradas |
| **Rol** | Admin General (Secretaría de Educación Municipal) |
| **Prioridad** | Media |

**ENTRADAS:**
- Seleccionar institución existente
- Completar campos opcionales: resolución MEN, modalidad, jornadas
- Actualizar datos de contacto: teléfono secretaría, correo rectoría, sitio web
- Información de ubicación: dirección completa, barrio, estrato, coordenadas GPS
- Características institucionales: capacidad, año fundación, enfoque pedagógico
- Información confesional: religión (si aplica)
- Datos completos del rector: nombre, documento, teléfono, correo

**SALIDAS:**
- Actualizar campos modificados
- Mostrar confirmación de actualización exitosa
- Validar integridad de datos actualizados

**CRITERIOS DE ACEPTACIÓN:**
- Solo campos opcionales pueden editarse (campos obligatorios requieren validación especial)
- Mantener auditoría de cambios realizados
- Validar formato de coordenadas GPS si se proporcionan
- Estrato debe estar en rango 1-6 si se especifica

---

### RF-NU-005: Gestión de registro de orientador

| **Nombre** | Gestión de registro de orientador |
| **Identificador** | RF-NU-005 |
| **Descripción** | El rector o coordinador registra orientadores quienes serán los encargados de asignar tareas a todos los cursos o grados de la institución |
| **Rol** | Rector, Coordinador |
| **Prioridad** | Alta |

**ENTRADAS:**
- Nombres
- Apellidos
- Tipo de documento
- Número de documento
- Teléfono celular
- Dirección
- Correo
- Contraseña

**SALIDAS:**
- Si todos los campos están diligenciados correctamente, mostrar mensaje de registro exitoso
- Si los campos no están diligenciados, mostrar mensaje de error

**CRITERIOS DE ACEPTACIÓN:**
- El correo debe tener formato válido
- El teléfono solo debe permitir números
- La contraseña debe cumplir políticas de seguridad
- El orientador queda automáticamente vinculado a la institución del rector que lo crea
- No permitir documentos duplicados en el sistema

---

### RF-NU-006: Registro de grados o cursos

| **Nombre** | Registro de grados o cursos por institución |
| **Identificador** | RF-NU-006 |
| **Descripción** | El rector o coordinador registra los grados y cursos de su institución, para poder vincularlos a docentes y estudiantes |
| **Rol** | Rector, Coordinador |
| **Prioridad** | Alta |

**ENTRADAS:**
- Grado (selección: Transición, 1°, 2°... 11°)
- Nombre del curso (ej: 5° A, 5-1, Quinto A)
- Jornada (Mañana / Tarde / Completa)

**SALIDAS:**
- Si los campos están completos y correctos, mostrar mensaje de registro exitoso
- Si los campos están incompletos, mostrar mensaje de error

**CRITERIOS DE ACEPTACIÓN:**
- Los grados deben estar predefinidos en el sistema
- No permitir cursos duplicados en una institución

---

### RF-NU-007: Registro de docentes

| **Nombre** | Registro de docentes |
| **Identificador** | RF-NU-007 |
| **Descripción** | El rector o coordinador registra docentes a cargo de cursos, para que puedan acceder al sistema |
| **Rol** | Rector, Coordinador |
| **Prioridad** | Alta |

**ENTRADAS:**
- Nombres
- Apellidos
- Tipo de documento
- Número de documento
- Teléfono celular
- Dirección
- Curso asignado
- Es director de curso (Sí/No)
- Correo
- Contraseña

**SALIDAS:**
- Si los campos están completos y correctos, mostrar mensaje de registro exitoso
- Si los campos están incompletos, mostrar mensaje de error

**CRITERIOS DE ACEPTACIÓN:**
- El correo debe tener formato válido
- El teléfono solo debe permitir números
- La contraseña debe cumplir políticas de seguridad
- Un docente puede estar asignado a múltiples cursos
- Solo puede haber un director por curso
- El docente queda automáticamente vinculado a la institución del rector
- No permitir documentos duplicados

---

### RF-NU-008: Registro de padres de familia

| **Nombre** | Registro de padres de familia o acudientes |
| **Identificador** | RF-NU-008 |
| **Descripción** | El rector, coordinador o docente registra padres de familia o acudientes, para asociarlos a estudiantes |
| **Rol** | Rector, Coordinador, Docente |
| **Prioridad** | Alta |

**ENTRADAS:**
- Nombres
- Apellidos
- Tipo de documento
- Número de documento
- Teléfono
- Correo (opcional)
- Dirección
- Parentesco (Padre, Madre, Abuelo/a, Tío/a, Otro)

**SALIDAS:**
- Si los campos están completos y correctos, mostrar mensaje de registro exitoso
- Si los campos están incompletos, mostrar mensaje de error
- Crear automáticamente usuario (teléfono) y contraseña (documento)

**CRITERIOS DE ACEPTACIÓN:**
- El teléfono solo debe permitir números
- El correo es opcional
- Usuario y contraseña se generan automáticamente
- Forzar cambio de contraseña en el primer login

---

### RF-NU-009: Registro individual de estudiantes y acudientes

| **Nombre** | Registro individual de estudiantes y acudientes |
| **Identificador** | RF-NU-009 |
| **Descripción** | El coordinador académico registra estudiantes individualmente, crea acudientes, los vincula y asigna estudiantes a cursos según el proceso de matrícula colombiano |
| **Rol** | **Coordinador Académico** (principal), Rector (secundario) |
| **Prioridad** | Alta |

**ENTRADAS ESTUDIANTE:**
- Nombres y apellidos completos
- Tipo y número de documento (validación única)
- Fecha de nacimiento (validar rango 3-18 años)
- Sexo, grupo sanguíneo, RH, EPS
- País y ciudad de nacimiento
- Estrato socioeconómico (1-6)
- Etnia, correo estudiante (opcional)
- Selección de curso disponible

**ENTRADAS ACUDIENTE:**
- Nombres y apellidos completos
- Tipo y número de documento (validación única)
- Teléfono principal y alternativo
- Dirección de residencia
- Parentesco con el estudiante
- Ocupación, tipo de trabajo, nivel educativo
- Aporta economía familiar (sí/no)
- Horario de trabajo
- Contraseña inicial = número de documento

**FUNCIONALIDADES ADICIONALES:**
- Vincular acudiente con estudiante (marcar principal)
- Asignar/reasignar estudiante a curso
- Editar información de estudiantes/acudientes
- Consultar por nombre o documento
- Gestionar retiros y traslados

**SALIDAS:**
- Si los campos están completos y correctos, mostrar mensaje de registro exitoso
- Si los campos están incompletos, mostrar mensaje de error
- Crear relación estudiante-acudiente

**CRITERIOS DE ACEPTACIÓN:**
- Deben existir cursos creados previamente
- El acudiente debe estar registrado
- Un estudiante puede tener múltiples acudientes

---

### RF-NU-010: Carga masiva de estudiantes y acudientes

| **Nombre** | Carga masiva de estudiantes y acudientes |
| **Identificador** | RF-NU-010 |
| **Descripción** | El coordinador académico puede subir archivos Excel con datos de estudiantes y acudientes para agilizar el proceso de matrícula |
| **Rol** | **Coordinador Académico** (principal), Rector (secundario) |
| **Prioridad** | Alta |

**ENTRADAS:**
- Botón "Cargar archivo"
- Archivo Excel (.xlsx o .csv) con datos de estudiantes y acudientes

**SALIDAS:**
- Si el archivo cumple la plantilla y los datos son válidos, mostrar mensaje de registro exitoso
- Si el archivo no cumple el estándar, mostrar mensaje de error detallado
- Si faltan datos obligatorios, mostrar reporte de validación

**CRITERIOS DE ACEPTACIÓN:**
- Debe permitir formatos CSV y XLSX
- Plantilla con columnas: nombres_estudiante, apellidos_estudiante, tipo_doc_estudiante, num_doc_estudiante, fecha_nacimiento, sexo, curso_id, nombres_acudiente, apellidos_acudiente, tipo_doc_acudiente, num_doc_acudiente, telefono_acudiente, parentesco, es_principal
- Vista previa con validación: ✅ válido, ❌ error con descripción
- Validaciones: documento único, curso existe, fecha nacimiento válida (3-18 años)
- Checkbox "Omitir filas con error y continuar"
- Barra de progreso: "Procesando X de Y registros"
- Reporte de errores descargable (CSV con motivos)
- No crear registros parciales (transacción completa)
- Máximo 500 filas por archivo

---

### RF-NU-011: Agregar tareas al banco

| **Nombre** | Agregar tareas o talleres al banco |
| **Identificador** | RF-NU-011 |
| **Descripción** | Los orientadores y docentes pueden agregar tareas al banco de tareas o talleres, para asignarlas posteriormente a cursos o estudiantes específicos |
| **Rol** | Orientador, Docente |
| **Prioridad** | Alta |

**ENTRADAS:**
- Título
- Descripción detallada
- Categoría (selección de lista predefinida)
- Grados objetivo (múltiple: Transición, 1°, 2°... 11°)
- Tipo de calificación (Automática / Manual)
- Criterios de calificación automática (si aplica)
- Archivos adjuntos (PDF, Word, imágenes)
- Enlaces de referencia (opcional)

**SALIDAS:**
- Si los campos están completos y correctos, mostrar mensaje de registro exitoso
- Si los campos están incompletos, mostrar mensaje de error
- La tarea queda disponible en el banco para asignación
- Registrar el usuario creador en el campo `creado_por`

**CRITERIOS DE ACEPTACIÓN:**
- Tanto orientadores como docentes pueden crear tareas (según esquema BD)
- Debe existir al menos una categoría predefinida
- Debe permitir subir máximo 3 archivos de hasta 5MB cada uno
- Formatos permitidos: PDF, DOCX, JPG, PNG
- Debe permitir múltiples grados objetivo para reutilización
- Si es calificación automática, definir criterios de puntualidad

---

### RF-NU-012: Asignar tareas a un curso

| **Nombre** | Asignar tareas a un curso |
| **Identificador** | RF-NU-012 |
| **Descripción** | El orientador o docente puede asignar tareas del banco a un curso específico |
| **Rol** | Orientador, Docente |
| **Prioridad** | Alta |

**ENTRADAS:**
- Seleccionar curso(s)
- Seleccionar tarea(s) del banco
- Fecha de publicación
- Fecha de vencimiento
- Frecuencia (Única / Semanal / Quincenal)

**SALIDAS:**
- Si los campos están completos, mostrar mensaje de asignación exitosa
- Si los campos están incompletos, mostrar mensaje de error
- Enviar notificación push a los padres de familia

**CRITERIOS DE ACEPTACIÓN:**
- Las fechas son obligatorias
- Fecha de vencimiento debe ser posterior a fecha de publicación
- Una tarea puede asignarse a múltiples cursos

---

### RF-NU-013: Asignar tareas a estudiante específico

| **Nombre** | Asignar tareas a un estudiante en específico |
| **Identificador** | RF-NU-013 |
| **Descripción** | El orientador o docente puede asignar una tarea específica a un estudiante (refuerzos, casos especiales) |
| **Rol** | Orientador, Docente |
| **Prioridad** | Media |

**ENTRADAS:**
- Seleccionar curso
- Seleccionar estudiante(s)
- Seleccionar tarea del banco
- Fecha de publicación
- Fecha de vencimiento
- Observaciones (opcional)

**SALIDAS:**
- Si los campos están completos, mostrar mensaje de asignación exitosa
- Si los campos están incompletos, mostrar mensaje de error
- Enviar notificación al acudiente del estudiante

**CRITERIOS DE ACEPTACIÓN:**
- Las fechas son obligatorias
- Fecha de vencimiento debe ser posterior a fecha de publicación

---

### RF-NU-014: Calificación automática y manual

| **Nombre** | Calificación automática y manual |
| **Identificador** | RF-NU-014 |
| **Descripción** | El sistema califica automáticamente las tareas según puntualidad. El docente puede calificar manualmente |
| **Rol** | Orientador, Docente (manual); Sistema (automática) |
| **Prioridad** | Alta |

**ENTRADAS (Calificación manual):**
- Archivo, foto o texto entregado
- Calificación o nota
- Comentarios

**SALIDAS:**
- Si los campos están completos, mostrar mensaje de registro exitoso
- Enviar notificación al padre con la calificación

**CRITERIOS DE ACEPTACIÓN:**
- **Calificación automática:**
  - Entrega a tiempo: 5.0
  - 3 días de retraso: 4.9
  - 6 días de retraso: 4.8
- **Calificación manual:**
  - Debe permitir cambiar la calificación automática
  - Los comentarios quedan registrados

---

## REQUISITOS FUNCIONALES - APLICACIÓN MÓVIL ANDROID

**Plataforma:** Android (Java)  
**Usuarios:** Acudientes/Padres de Familia  
**Fecha:** 9 de Enero 2026

### ÍNDICE DE REQUISITOS MÓVILES

**Autenticación y Seguridad**
- RF-MO-001: Inicio de sesión móvil
- RF-MO-002: Cambio de contraseña obligatorio
- RF-MO-003: Recuperación de contraseña
- RF-MO-004: Onboarding primera vez

**Gestión de Tareas**
- RF-MO-005: Visualizar tareas asignadas
- RF-MO-006: Ver detalle de tarea
- RF-MO-007: Enviar evidencias multimedia
- RF-MO-008: Editar entrega antes de fecha límite
- RF-MO-009: Filtrar tareas por estado

**Calificaciones e Historial**
- RF-MO-010: Ver historial de entregas
- RF-MO-011: Ver calificaciones y retroalimentación

**Gestión de Estudiantes**
- RF-MO-012: Cambiar estudiante activo
- RF-MO-013: Ver perfil del estudiante

**Notificaciones**
- RF-MO-014: Recibir notificaciones push
- RF-MO-015: Gestionar notificaciones

**Funcionalidad Offline**
- RF-MO-016: Almacenamiento local de tareas
- RF-MO-017: Cola de sincronización de entregas
- RF-MO-018: Sincronización automática

**Soporte y Ayuda**
- RF-MO-019: Preguntas frecuentes (FAQs)
- RF-MO-020: Contactar soporte

---

### RF-MO-001: Inicio de sesión móvil

| **Nombre** | Inicio de sesión móvil para acudientes |
| **Identificador** | RF-MO-001 |
| **Descripción** | Sistema de autenticación mediante teléfono y número de documento del acudiente en la aplicación Android |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Número de documento
- Contraseña (por defecto es el número de documento)

**SALIDAS:**
- Si los datos son válidos:
  - Almacenar token JWT en SharedPreferences
  - Cargar datos del acudiente y sus hijos
  - Si debe_cambiar_contrasena = true: redireccionar a CambiarContrasenaActivity
  - Si debe_cambiar_contrasena = false: redireccionar a MainActivity (Dashboard)
- Si los datos son incorrectos: mostrar mensaje de error específico

**CRITERIOS DE ACEPTACIÓN:**
- Validar que el número de documento exista en tabla acudientes
- La contraseña inicial generada automáticamente es el número de documento
- Después del primer login, el acudiente debe cambiar su contraseña
- Almacenar FCM token para notificaciones push
- Registrar fecha de ultimo_ingreso en tabla usuarios
- Mostrar shimmer effect durante la autenticación
- Timeout de petición: 15 segundos

**TABLAS RELACIONADAS:**
- usuarios (autenticación)
- acudientes (datos del usuario)
- estudiante_acudiente (obtener hijos vinculados)

---

### RF-MO-002: Cambio de contraseña obligatorio

| **Nombre** | Cambio obligatorio de contraseña primer ingreso |
| **Identificador** | RF-MO-002 |
| **Descripción** | Forzar al acudiente a crear una contraseña personalizada en el primer inicio de sesión |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Contraseña actual (número de documento)
- Nueva contraseña
- Confirmación de nueva contraseña

**SALIDAS:**
- Si las contraseñas coinciden y cumplen requisitos:
  - Actualizar contrasena_hash en tabla usuarios
  - Cambiar debe_cambiar_contrasena a false
  - Redireccionar a MainActivity
- Si hay errores: mostrar mensaje específico

**CRITERIOS DE ACEPTACIÓN:**
- La "Contraseña actual" es el número de documento del acudiente
- Nueva contraseña: mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo (@#$%&*)
- Confirmación debe ser idéntica a nueva contraseña
- Mostrar checklist visual de requisitos en tiempo real
- Botón "Actualizar" deshabilitado hasta cumplir todos los requisitos
- No permitir usar el número de documento como nueva contraseña
- Usar bcrypt o Argon2 para hashear (backend)

**TABLAS RELACIONADAS:**
- usuarios (actualizar contrasena_hash, debe_cambiar_contrasena)

---

### RF-MO-003: Recuperación de contraseña

| **Nombre** | Recuperación de contraseña por código de verificación |
| **Identificador** | RF-MO-003 |
| **Descripción** | Permitir al acudiente restablecer su contraseña mediante código enviado por SMS o email |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Media |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Pantalla 1: Número de teléfono o correo electrónico
- Pantalla 2: Código de verificación (6 dígitos)
- Pantalla 3: Nueva contraseña + confirmación

**SALIDAS:**
- Pantalla 1: Si el usuario existe, enviar código OTP y mostrar pantalla de verificación
- Pantalla 2: Si el código es correcto, mostrar pantalla de nueva contraseña
- Pantalla 3: Si las contraseñas coinciden, actualizar y redireccionar al login

**CRITERIOS DE ACEPTACIÓN:**
- Código OTP: 6 dígitos numéricos aleatorios
- Código expira en 15 minutos
- Máximo 3 intentos de verificación por código
- Permitir reenviar código después de 60 segundos
- Nueva contraseña: mismos requisitos que RF-MO-002
- Almacenar código en Redis o tabla temporal (backend)
- Enviar notificación de cambio de contraseña exitoso

**TABLAS RELACIONADAS:**
- usuarios (actualizar contrasena_hash)
- acudientes (obtener telefono y correo)
- notificaciones (registrar envío de código)

---

### RF-MO-004: Onboarding primera vez

| **Nombre** | Onboarding educativo primera vez |
| **Identificador** | RF-MO-004 |
| **Descripción** | Mostrar tutorial de 4 slides explicando el propósito y uso de la aplicación SOLO en el primer ingreso |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Media |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Primera apertura de la aplicación (detección por SharedPreferences)

**SALIDAS:**
- Mostrar 4 slides con ViewPager2:
  1. Bienvenida: "PARCHANDO JUNTOS - Fortalece los lazos familiares"
  2. ¿Qué es?: Explicación de Cátedra de Familia
  3. ¿Cómo funciona?: Flujo de tareas (recibir → realizar → enviar → calificar)
  4. Funciona sin internet: Ventajas del modo offline
- Botón "Saltar" en todas las pantallas
- Botón "COMENZAR 🚀" en slide 4

**CRITERIOS DE ACEPTACIÓN:**
- Mostrar SOLO si onboarding_completado = false en SharedPreferences
- Animaciones Lottie en cada slide
- Indicadores de página (dots) en la parte inferior
- Transiciones suaves entre slides
- No volver a mostrar aunque el usuario desinstale y reinstale

---

### RF-MO-005: Visualizar tareas asignadas

| **Nombre** | Ver lista de tareas asignadas a estudiante |
| **Identificador** | RF-MO-005 |
| **Descripción** | Mostrar en RecyclerView todas las tareas asignadas al curso del estudiante seleccionado, agrupadas por estado |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- ID del estudiante seleccionado
- Filtro seleccionado (Todas, Pendientes, Completadas)

**SALIDAS:**
- Lista de tareas con:
  - Título de la tarea
  - Fecha de vencimiento
  - Frecuencia (Semanal, Quincenal, Mensual)
  - Estado (Pendiente, Entregada, Calificada, Vencida)
  - Indicador de color según urgencia:
    - 🔴 Rojo: Vencida (sin entregar)
    - 🟡 Amarillo: Próxima a vencer (≤ 3 días)
    - 🔵 Azul: Pendiente normal
    - ✅ Verde: Completada/Calificada
  - Botón "VER DETALLE" en cada card
- Pull-to-refresh para actualizar

**CRITERIOS DE ACEPTACIÓN:**
- Cargar tareas del periodo activo (periodos.esta_activo = true)
- Incluir tareas asignadas directamente al curso
- Ordenar por fecha de vencimiento (ascendente)
- Mostrar estado vacío si no hay tareas
- Funcionar offline con datos cacheados en SQLite

**TABLAS RELACIONADAS:**
- asignaciones
- asignacion_cursos
- entregas
- calificaciones
- periodos
- estudiantes
- cursos

---

### RF-MO-006: Ver detalle de tarea

| **Nombre** | Ver detalle completo de tarea asignada |
| **Identificador** | RF-MO-006 |
| **Descripción** | Mostrar información completa de la tarea seleccionada, incluyendo descripción, criterios, y estado de entrega |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- ID de la asignación

**SALIDAS:**
- ScrollView con:
  - Encabezado: Título, Categoría, Tema
  - Información: Descripción, Frecuencia, Fechas, Incluye en boletín
  - Estado de entrega:
    - Si NO está entregada: mostrar formulario de envío (RF-MO-007)
    - Si está entregada: mostrar evidencias enviadas
    - Si está calificada: mostrar calificación y retroalimentación

**CRITERIOS DE ACEPTACIÓN:**
- Mostrar estado visual según fecha de vencimiento
- Si viene de banco de tareas: mostrar "Entregable esperado"
- Cargar datos desde SQLite si no hay conexión
- Botón "Compartir tarea" (Intent.ACTION_SEND)
- Transición animada desde TareasActivity

**TABLAS RELACIONADAS:**
- asignaciones
- categorias
- banco_tareas
- entregas
- calificaciones

---

### RF-MO-007: Enviar evidencias multimedia

| **Nombre** | Enviar evidencias de realización de tarea |
| **Identificador** | RF-MO-007 |
| **Descripción** | Permitir al acudiente subir fotos, videos y descripción textual como evidencia de la tarea realizada |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Texto de evidencia (máx. 500 caracteres)
- Archivos multimedia (fotos/videos):
  - Desde cámara
  - Desde galería
  - Desde archivos (DocumentProvider)
- Máximo 3 archivos por entrega
- Tamaño máximo: 5MB por archivo (15MB total por entrega)

**SALIDAS:**
- Si hay conexión:
  - Subir archivos a servidor (multipart/form-data)
  - Guardar URLs en entregas.archivos_url (JSONB)
  - Mostrar Snackbar "✅ Evidencia enviada correctamente"
- Si NO hay conexión:
  - Guardar entrega en cola local (SQLite)
  - Mostrar Snackbar "📶 Se enviará cuando tengas internet"

**CRITERIOS DE ACEPTACIÓN:**
- EditText multiline para descripción textual
- RecyclerView horizontal para preview de archivos
- Botones: 📷 Cámara, 🖼️ Galería, 📁 Archivos
- Compresión automática de imágenes (id.zelory:compressor)
- Validar que haya al menos texto O archivos
- Mostrar ProgressBar durante upload
- Solicitar permisos de cámara y almacenamiento (runtime)
- Generar nombre único para cada entrega

**TABLAS RELACIONADAS:**
- entregas (crear registro)
- asignaciones (validar que exista)
- estudiantes (asociar entrega)
- acudientes (registrar quién envió)

---

### RF-MO-008: Editar entrega antes de fecha límite

| **Nombre** | Editar entrega antes de fecha de vencimiento |
| **Identificador** | RF-MO-008 |
| **Descripción** | Permitir modificar texto o archivos de una entrega mientras no esté calificada y la fecha límite no haya expirado |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Media |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- ID de la entrega existente
- Nuevo texto de evidencia
- Nuevos archivos (reemplazar o agregar)

**SALIDAS:**
- Si la edición es permitida:
  - Actualizar registro en tabla entregas
  - Mostrar confirmación "✏️ Entrega actualizada"
- Si NO es permitida:
  - Mostrar diálogo: "No puedes editar esta entrega porque [ya fue calificada / la fecha límite expiró]"

**CRITERIOS DE ACEPTACIÓN:**
- Solo permitir si:
  - entregas.estado = 'enviada' (no calificada)
  - asignaciones.fecha_vencimiento >= CURRENT_DATE
- Mantener archivos antiguos si no se reemplazan
- Confirmar con MaterialAlertDialog antes de guardar cambios
- Registrar edición en tabla auditoria (backend)

**TABLAS RELACIONADAS:**
- entregas (actualizar)
- calificaciones (validar que no exista)
- asignaciones (validar fecha)

---

### RF-MO-009: Filtrar tareas por estado

| **Nombre** | Filtrar tareas por estado de entrega |
| **Identificador** | RF-MO-009 |
| **Descripción** | Permitir al acudiente filtrar la lista de tareas usando chips para ver solo las que necesita |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Media |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Selección de chip: 📋 Todas, ⏳ Pendientes, ✅ Completadas

**SALIDAS:**
- RecyclerView actualizado con tareas filtradas
- Toast mostrando cantidad: "Mostrando X tareas pendientes"
- Chip seleccionado con estilo resaltado

**CRITERIOS DE ACEPTACIÓN:**
- Todas: mostrar todas las asignaciones del periodo activo
- Pendientes: tareas sin entrega
- Completadas: tareas con entrega o calificación
- ChipGroup con selección única
- Aplicar filtro inmediatamente sin recargar desde API
- Mantener filtro seleccionado al rotar pantalla

**TABLAS RELACIONADAS:**
- asignaciones
- entregas

---

### RF-MO-010: Ver historial de entregas

| **Nombre** | Ver historial de entregas pasadas por periodo |
| **Identificador** | RF-MO-010 |
| **Descripción** | Mostrar todas las entregas realizadas por el estudiante, agrupadas por periodo académico |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Media |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- ID del estudiante
- Periodo seleccionado (Spinner con todos los periodos)

**SALIDAS:**
- RecyclerView con cards de entregas:
  - Título de la tarea
  - Fecha de entrega
  - Estado (Enviada, Calificada)
  - Vista previa de evidencia textual
  - Indicador visual de calificación (si existe)
- Resumen al final: "Completadas: 8/10 tareas", "Promedio: 4.3 (Alto)"

**CRITERIOS DE ACEPTACIÓN:**
- Cargar entregas del periodo seleccionado
- Ordenar por fecha de entrega (descendente)
- Mostrar imágenes en miniatura si existen
- Permitir descargar archivos adjuntos
- Estado vacío: "Sin entregas en este periodo"
- Funcionar offline con datos cacheados

**TABLAS RELACIONADAS:**
- entregas
- asignaciones
- periodos
- calificaciones

---

### RF-MO-011: Ver calificaciones y retroalimentación

| **Nombre** | Ver calificación y feedback del docente |
| **Identificador** | RF-MO-011 |
| **Descripción** | Mostrar la calificación asignada por el docente junto con la retroalimentación escrita |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- ID de la entrega calificada

**SALIDAS:**
- Card con:
  - Calificación numérica: 4.5/5.0
  - Escala cualitativa: "Alto"
  - Nota cualitativa: "Sobresaliente" (si aplica)
  - Retroalimentación del docente: texto completo
  - Calificado por: Nombre del docente
  - Fecha de calificación
  - Indicador visual por escala:
    - 🟢 Alto (4.0 - 5.0)
    - 🔵 Medio (3.0 - 3.9)
    - 🟡 Bajo (1.0 - 2.9)

**CRITERIOS DE ACEPTACIÓN:**
- Solo mostrar si existe registro en tabla calificaciones
- Formato de nota: 1 decimal (ej: 4.5)
- Retroalimentación puede estar vacía (mostrar "Sin comentarios")
- Incluir avatar del docente (si disponible)
- Animación de entrada al mostrar card

**TABLAS RELACIONADAS:**
- calificaciones
- entregas
- docentes

---

### RF-MO-012: Cambiar estudiante activo

| **Nombre** | Cambiar hijo activo en vista |
| **Identificador** | RF-MO-012 |
| **Descripción** | Permitir al acudiente cambiar entre sus hijos vinculados para ver tareas y calificaciones específicas |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Media |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Lista de estudiantes vinculados al acudiente
- Selección de estudiante desde Spinner o NavigationDrawer

**SALIDAS:**
- Actualizar toda la UI con datos del estudiante seleccionado:
  - Tareas del curso del estudiante
  - Historial de entregas
  - Calificaciones
  - Notificaciones filtradas
- Guardar selección en SharedPreferences (estudiante_activo_id)
- Actualizar header con foto y nombre del estudiante

**CRITERIOS DE ACEPTACIÓN:**
- Cargar estudiantes desde tabla estudiante_acudiente
- Mostrar foto de perfil, nombre completo y curso/grado
- Marcar estudiante principal con badge "Principal" si es_principal = true
- Persistir selección entre sesiones
- Al cambiar, recargar datos automáticamente

**TABLAS RELACIONADAS:**
- estudiante_acudiente
- estudiantes
- cursos
- grados

---

### RF-MO-013: Ver perfil del estudiante

| **Nombre** | Ver información completa del estudiante |
| **Identificador** | RF-MO-013 |
| **Descripción** | Mostrar perfil con datos personales y académicos del estudiante seleccionado |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Baja |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- ID del estudiante seleccionado

**SALIDAS:**
- Activity con secciones:
  - Datos personales: Foto, nombres, documento, fecha de nacimiento, sexo
  - Datos médicos: Grupo sanguíneo + RH, EPS
  - Datos académicos: Curso, grado, jornada, institución
  - Estadísticas del periodo: Total tareas, completadas, promedio

**CRITERIOS DE ACEPTACIÓN:**
- Datos médicos opcionales (pueden estar vacíos)
- Formato de fecha: DD/MM/YYYY
- Edad calculada automáticamente
- Mostrar placeholder si no hay foto
- Botón flotante para editar información (solo datos de contacto)

**TABLAS RELACIONADAS:**
- estudiantes
- cursos
- grados
- instituciones
- entregas (estadísticas)
- calificaciones (promedio)

---

### RF-MO-014: Recibir notificaciones push

| **Nombre** | Recibir notificaciones push en tiempo real |
| **Identificador** | RF-MO-014 |
| **Descripción** | Recibir alertas mediante Firebase Cloud Messaging sobre eventos importantes |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Token FCM del dispositivo (generado automáticamente)
- Notificación enviada desde backend

**SALIDAS:**
- Notificación en barra de estado con título, mensaje, ícono, sonido/vibración
- Al tocar:
  - Si es tarea nueva: abrir TareaDetalleActivity
  - Si es calificación: abrir vista de calificación
  - Si es recordatorio: abrir TareasActivity filtrado por pendientes
- Badge en ícono de notificaciones en MainActivity

**CRITERIOS DE ACEPTACIÓN:**
- Tipos de notificaciones:
  - 🆕 Nueva tarea asignada
  - 📝 Tarea calificada
  - ⏰ Recordatorio de vencimiento (3 días antes)
  - ⚠️ Tarea vencida sin entregar
- Usar NotificationChannel para Android 8+ (categorías: tareas, calificaciones, recordatorios)
- Guardar notificación en SQLite al recibirla
- Permitir desactivar notificaciones desde configuración
- Agrupar notificaciones si hay múltiples
- Registrar FCM token en tabla usuarios al iniciar sesión

**TABLAS RELACIONADAS:**
- notificaciones (crear registro)
- usuarios (almacenar token_fcm)

---

### RF-MO-015: Gestionar notificaciones

| **Nombre** | Ver y gestionar centro de notificaciones |
| **Identificador** | RF-MO-015 |
| **Descripción** | Mostrar historial de notificaciones recibidas, marcar como leídas, y acceder a contenido relacionado |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Media |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Acceso desde botón de notificaciones en MainActivity

**SALIDAS:**
- RecyclerView con dos secciones:
  - No leídas (badge con número, fondo resaltado)
  - Anteriores (estilo atenuado)
- Al tocar notificación: marcar como leída y navegar al contenido relacionado
- Botón "Marcar todas como leídas"

**CRITERIOS DE ACEPTACIÓN:**
- Cargar desde SQLite local
- Ordenar por fecha (descendente)
- Actualizar badge al marcar como leída
- Llamada a API PATCH /api/notificaciones/{id}/leer
- Límite de 50 notificaciones mostradas
- Refresh manual con pull-to-refresh
- Estado vacío: "No tienes notificaciones"

**TABLAS RELACIONADAS:**
- notificaciones (actualizar leido_en)

---

### RF-MO-016: Almacenamiento local de tareas

| **Nombre** | Cachear tareas en base de datos local |
| **Identificador** | RF-MO-016 |
| **Descripción** | Almacenar tareas descargadas en SQLite Room para acceso offline |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Respuesta de API GET /api/asignaciones

**SALIDAS:**
- Insertar/actualizar registros en SQLite:
  - Tabla asignaciones_local
  - Tabla entregas_local
  - Tabla calificaciones_local
- Timestamp de última sincronización
- Indicador visual "Última actualización: hace X minutos"

**CRITERIOS DE ACEPTACIÓN:**
- Sincronizar al abrir TareasActivity si hay conexión
- Reemplazar datos antiguos (estrategia: eliminar todo + insertar)
- Mantener entregas pendientes de envío en cola separada
- Mostrar banner amarillo si datos tienen >24 horas
- Limitar caché a periodo activo (eliminar periodos antiguos)

**TABLAS RELACIONADAS:**
- SQLite: asignaciones_local, entregas_local, calificaciones_local

---

### RF-MO-017: Cola de sincronización de entregas

| **Nombre** | Guardar entregas offline en cola de sincronización |
| **Identificador** | RF-MO-017 |
| **Descripción** | Almacenar entregas creadas sin conexión en SQLite y sincronizarlas automáticamente cuando haya internet |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Entrega creada sin conexión (RF-MO-007)

**SALIDAS:**
- Insertar en tabla cola_sincronizacion con:
  - Datos de la entrega (JSON)
  - Archivos guardados localmente (ruta temporal)
  - Estado: pendiente
  - Timestamp de creación
- Mostrar ícono de sincronización pendiente en la tarea
- Badge en MainActivity con número de entregas pendientes

**CRITERIOS DE ACEPTACIÓN:**
- WorkManager para procesar cola en background
- Verificar conexión cada 15 minutos
- Reintentar entregas fallidas (máx. 3 intentos)
- Mostrar notificación cuando todas se sincronicen
- Al sincronizar exitosamente:
  - Actualizar estado = 'sincronizada'
  - Eliminar archivos temporales
  - Recargar tareas desde API

**TABLAS RELACIONADAS:**
- SQLite: cola_sincronizacion
- Backend: entregas (crear)

---

### RF-MO-018: Sincronización automática

| **Nombre** | Sincronizar datos automáticamente con backend |
| **Identificador** | RF-MO-018 |
| **Descripción** | Sincronizar tareas, calificaciones y notificaciones automáticamente cuando hay conexión (delta sync para reducir tráfico de datos) |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Alta |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Detección de conectividad (BroadcastReceiver)
- Apertura de MainActivity
- Intervalo periódico (WorkManager - cada 1 hora)

**SALIDAS:**
- Banner superior mostrando:
  - 🔄 "Sincronizando datos..." (durante sincronización)
  - ✅ "✓ X tareas nuevas, Y calificaciones" (resultado)
  - ⚠️ "Sin conexión - Modo offline" (sin internet)
- Actualizar última sincronización en SharedPreferences

**CRITERIOS DE ACEPTACIÓN:**
- WorkManager con restricción de red: setRequiredNetworkType(NetworkType.CONNECTED)
- Endpoints a sincronizar:
  - GET /api/asignaciones (tareas)
  - GET /api/entregas (entregas y calificaciones)
  - GET /api/notificaciones (notificaciones)
- Mostrar ProgressBar en Toolbar durante sincronización
- Permitir cancelar sincronización (botón X en banner)
- Si falla: mostrar Snackbar con botón "Reintentar"

**TABLAS RELACIONADAS:**
- Todas las tablas locales SQLite

---

### RF-MO-019: Preguntas frecuentes (FAQs)

| **Nombre** | Consultar preguntas frecuentes |
| **Identificador** | RF-MO-019 |
| **Descripción** | Mostrar sección de ayuda con preguntas frecuentes expandibles sobre el uso de la aplicación |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Baja |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Acceso desde menú "Ayuda" o botón en MainActivity

**SALIDAS:**
- RecyclerView con FAQs expandibles:
  - 📱 ¿Cómo recupero mi contraseña?
  - 📤 ¿Cómo envío evidencias?
  - 📷 ¿Por qué no puedo subir fotos?
  - 📶 ¿Funciona sin internet?
  - 📊 ¿Cómo se calcula la nota?
  - 👥 ¿Puedo cambiar de hijo?
- Búsqueda de FAQs (SearchView)
- Botón "¿No resolviste tu duda? Contáctanos"

**CRITERIOS DE ACEPTACIÓN:**
- Cargar desde archivo JSON local (res/raw/faq.json)
- Animación de expansión/colapso suave
- Funcionamiento offline completo
- Ícono ▶️ para preguntas colapsadas, ▼ para expandidas
- Botón flotante para ir al inicio

---

### RF-MO-020: Contactar soporte

| **Nombre** | Contactar al equipo de soporte |
| **Identificador** | RF-MO-020 |
| **Descripción** | Permitir al acudiente comunicarse con soporte técnico vía email o WhatsApp |
| **Rol** | Acudiente/Padre de Familia |
| **Prioridad** | Baja |
| **Plataforma** | Android (Java) |

**ENTRADAS:**
- Selección del canal de contacto: 📧 Email, 💬 WhatsApp

**SALIDAS:**
- Email (Intent.ACTION_SENDTO):
  - Para: parchandojuntos2025@gmail.com
  - Asunto: "Soporte App Móvil - [Nombre Acudiente]"
  - Cuerpo: Plantilla con datos del usuario (nombre, teléfono, versión app)
- WhatsApp (Intent con URI):
  - Número: +57 310 739 2818
  - Mensaje predefinido: "Hola, necesito ayuda con la app PARCHANDO JUNTOS..."

**CRITERIOS DE ACEPTACIÓN:**
- Verificar que la app de email/WhatsApp esté instalada
- Si no: mostrar diálogo con opciones alternativas
- Incluir automáticamente: Versión app, modelo de dispositivo, versión de Android
- Mostrar Toast "Abriendo [Email/WhatsApp]..."

**DATOS DE CONTACTO:**
- Email: parchandojuntos2025@gmail.com
- WhatsApp: +57 310 739 2818

---

### RESUMEN DE PRIORIDADES MÓVIL

| Prioridad | Cantidad | Identificadores |
|-----------|----------|-----------------|
| **Alta** | 10 | RF-MO-001, 002, 005, 006, 007, 011, 014, 016, 017, 018 |
| **Media** | 8 | RF-MO-003, 004, 008, 009, 010, 012, 015 |
| **Baja** | 2 | RF-MO-013, 019, 020 |

---

### TECNOLOGÍAS Y HERRAMIENTAS MÓVIL

| Componente | Tecnología |
|------------|------------|
| Lenguaje | Java (Android SDK 24+) |
| Base de datos local | SQLite con Room |
| HTTP Client | Retrofit 2 + OkHttp |
| Imágenes | Glide/Coil |
| Notificaciones | Firebase Cloud Messaging |
| Compresión | id.zelory:compressor |
| UI | Material Design 3 |
| Animaciones | Lottie |
| Background tasks | WorkManager |

---

## REQUISITOS NO FUNCIONALES

### RNF-NU-001: Rendimiento

| **Nombre** | Rendimiento del sistema |
| **Identificador** | RNF-NU-001 |
| **Descripción** | El sistema debe garantizar tiempos de respuesta óptimos |

**Criterios:**
- Tiempo de respuesta API < 500ms en el 95% de peticiones
- Tiempo de carga de pantallas móviles < 2 segundos
- Capacidad de 500 usuarios concurrentes

---

### RNF-NU-002: Seguridad

| **Nombre** | Seguridad de la información |
| **Identificador** | RNF-NU-002 |
| **Descripción** | Proteger los datos personales de menores de edad y usuarios cumpliendo la legislación colombiana |

**Criterios:**
- Cumplimiento de Ley 1581/2012 (Habeas Data)
- Encriptación HTTPS/TLS 1.3
- Autenticación JWT con expiración de tokens (24 horas)
- Control de acceso basado en roles (RBAC)
- Auditoría de acciones críticas

---

### RNF-NU-003: Usabilidad

| **Nombre** | Usabilidad y accesibilidad |
| **Identificador** | RNF-NU-003 |
| **Descripción** | La aplicación debe ser fácil de usar para usuarios con diferentes niveles de alfabetización digital |

**Criterios:**
- Cumplir WCAG 2.1 Nivel AA
- Tamaños táctiles mínimos 44x44dp
- Funcionalidad offline completa para padres de familia
- Tutorial de bienvenida obligatorio la primera vez

---

### RNF-NU-004: Compatibilidad y Stack Tecnológico

| **Nombre** | Compatibilidad de plataformas y stack tecnológico |
| **Identificador** | RNF-NU-004 |
| **Descripción** | El sistema debe funcionar con el stack definido en las plataformas más comunes en Colombia |

**Stack Tecnológico Obligatorio:**
- **Frontend Web**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: AdonisJS 6 + TypeScript
- **Base de Datos**: PostgreSQL 14+ (con Supabase para gestión)
- **Móvil**: Android Studio + Java nativo (API 24+)
- **Hosting**: Por definir (AWS, Google Cloud o similar)
- **Almacenamiento**: AWS S3 o equivalente según hosting
- **Notificaciones**: Firebase Cloud Messaging (FCM)
- **Autenticación**: JWT tokens

**Compatibilidad Mínima:**
- **Móvil**: Android 7.0+ (95% cobertura Colombia)
- **Web**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Conexión**: 3G (1Mbps) para sincronización, offline completo
- **Almacenamiento local**: 100MB mínimo en dispositivo móvil
