# CÁTEDRA DE FAMILIA - PARCHANDO JUNTOS
## Historias de Usuario

**Identificador:** CATFAM-2026-HU  
**Fecha:** 17 de Enero de 2026  
**Versión:** 1.0

---

## HISTORIAS DE USUARIO - PLATAFORMA WEB ADMINISTRATIVA

---

### 📌 ÉPICA EP-01: Registro y Validación de Instituciones Educativas

---

#### HU-01: Registrar institución educativa con datos obligatorios

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-01 |
| **Épica Relacionada** | EP-01 |
| **Rol** | Admin General (Secretaría de Educación) |
| **Característica** | Registrar una nueva institución educativa en el sistema con sus datos oficiales obligatorios |
| **Razón / Resultado** | Para crear la cuenta institucional única con aislamiento de datos (multitenancy) y habilitar la gestión descentralizada |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Formulario de registro básico | Admin está en panel de instituciones | Hace clic en "Nueva Institución" | Se muestra formulario con campos: nombre oficial, código DANE, NIT, niveles educativos, teléfono, correo, naturaleza |
| 2 | Validación de código DANE | Admin ingresa código DANE | Escribe en campo código DANE | Sistema valida en tiempo real: exactamente 11 dígitos numéricos, muestra ✅ o ❌ |
| 3 | Validación de NIT colombiano | Admin ingresa NIT | Escribe en campo NIT | Sistema valida formato colombiano con dígito verificador (ej: 891234567-1), muestra ✅ o ❌ |
| 4 | Selección de niveles educativos | Admin configura niveles | Selecciona checkboxes de niveles | Debe seleccionar al menos uno: Preescolar, Primaria, Secundaria, Media |
| 5 | Validación de unicidad DANE | Admin envía formulario con DANE existente | Hace clic en "Registrar" | Sistema muestra error "El código DANE ya está registrado en el sistema" |
| 6 | Validación de unicidad NIT | Admin envía formulario con NIT existente | Hace clic en "Registrar" | Sistema muestra error "El NIT ya está registrado en el sistema" |
| 7 | Registro exitoso | Admin completa todos los campos obligatorios correctamente | Hace clic en "Registrar" | Sistema crea institución, genera ID único, muestra mensaje "Institución registrada exitosamente" con código |
| 8 | Generación de estructura multitenancy | Sistema procesa registro exitoso | Automático tras registro | Se crea aislamiento por institution_id en todas las tablas relacionadas |

---

#### HU-02: Completar información opcional de institución

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-02 |
| **Épica Relacionada** | EP-01 |
| **Rol** | Admin General (Secretaría de Educación) |
| **Característica** | Editar y completar la información adicional de una institución previamente registrada |
| **Razón / Resultado** | Para agregar datos complementarios (ubicación, rector, características) sin bloquear el registro inicial |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso a edición | Admin está en listado de instituciones | Hace clic en "Editar" de una institución | Se abre formulario con pestañas: Contacto, Ubicación, Académico, Rector |
| 2 | Completar datos de contacto | Admin está en pestaña Contacto | Ingresa teléfono secretaría, correo rectoría, sitio web | Campos se guardan correctamente con validación de formato |
| 3 | Completar ubicación | Admin está en pestaña Ubicación | Ingresa dirección, barrio, estrato (1-6), coordenadas GPS | Sistema valida estrato en rango 1-6, coordenadas en formato válido |
| 4 | Completar datos académicos | Admin está en pestaña Académico | Selecciona modalidad, jornadas, ingresa resolución MEN | Campos opcionales se guardan, resolución MEN es texto libre |
| 5 | Completar datos del rector | Admin está en pestaña Rector | Ingresa nombre, documento, teléfono, correo del rector | Datos se asocian a la institución para referencia |
| 6 | Guardar cambios parciales | Admin completa solo algunas pestañas | Hace clic en "Guardar" | Sistema guarda solo los campos modificados, muestra confirmación |
| 7 | Auditoría de cambios | Admin guarda cualquier modificación | Sistema procesa guardado | Se registra en auditoría: usuario, fecha, campos modificados |

---

### 📌 ÉPICA EP-02: Gestión de Usuarios Administrativos

---

#### HU-03: Registrar rector de institución

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-03 |
| **Épica Relacionada** | EP-02 |
| **Rol** | Admin General (Secretaría de Educación) |
| **Característica** | Crear cuenta de rector para una institución educativa específica |
| **Razón / Resultado** | Para que el rector pueda acceder al sistema y gestionar su institución con privilegios administrativos |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Formulario de registro de rector | Admin está en gestión de usuarios | Hace clic en "Nuevo Rector" | Se muestra formulario con campos: nombres, apellidos, tipo documento, número documento, teléfono, correo institucional, institución |
| 2 | Selección de institución | Admin está en formulario | Selecciona institución del dropdown | Solo muestra instituciones sin rector activo asignado |
| 3 | Validación de correo institucional | Admin ingresa correo | Escribe correo electrónico | Sistema valida dominio institucional (@institución.edu.co o @educativo.gov.co) |
| 4 | Validación de documento único | Admin ingresa documento existente | Intenta registrar | Sistema muestra "El documento ya está registrado en el sistema" |
| 5 | Generación de contraseña temporal | Admin completa formulario correctamente | Hace clic en "Registrar" | Sistema genera contraseña temporal segura (8+ caracteres, mixta) |
| 6 | Envío de credenciales | Registro exitoso | Automático | Sistema envía correo con usuario (correo) y contraseña temporal al rector |
| 7 | Vinculación automática | Registro exitoso | Automático | Rector queda vinculado a institution_id de la institución seleccionada |
| 8 | Un rector por institución | Admin intenta crear segundo rector | Selecciona institución con rector activo | Sistema no muestra esa institución en el dropdown o indica "Ya tiene rector asignado" |

---

#### HU-04: Registrar coordinador de institución

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-04 |
| **Épica Relacionada** | EP-02 |
| **Rol** | Admin General (Secretaría de Educación) |
| **Característica** | Crear cuenta de coordinador (Académico o de Convivencia) para una institución |
| **Razón / Resultado** | Para que los coordinadores puedan gestionar matrícula, cursos y procesos específicos según su cargo |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Formulario de registro de coordinador | Admin está en gestión de usuarios | Hace clic en "Nuevo Coordinador" | Formulario con campos personales + selector de cargo (Académico/Convivencia) + institución |
| 2 | Selección de tipo de coordinador | Admin está en formulario | Selecciona tipo de cargo | Opciones: Coordinador Académico, Coordinador de Convivencia |
| 3 | Múltiples coordinadores permitidos | Admin registra coordinador | Selecciona institución | Se permite crear múltiples coordinadores por institución |
| 4 | Validación de documento único | Admin ingresa documento existente | Intenta registrar | Sistema muestra error de documento duplicado |
| 5 | Generación y envío de credenciales | Registro exitoso | Automático | Sistema genera contraseña temporal y envía correo con credenciales |
| 6 | Vinculación a institución | Registro exitoso | Automático | Coordinador queda vinculado al institution_id correspondiente |

---

#### HU-05: Iniciar sesión en plataforma web administrativa

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-05 |
| **Épica Relacionada** | EP-02 |
| **Rol** | Rector, Coordinador, Orientador, Docente |
| **Característica** | Autenticarse en la plataforma web con credenciales institucionales |
| **Razón / Resultado** | Para acceder al panel correspondiente según el rol y gestionar las funcionalidades asignadas |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Pantalla de login | Usuario accede a la URL del sistema | Carga la página | Se muestra formulario con: correo, contraseña, reCAPTCHA, botón "Ingresar" |
| 2 | Validación de reCAPTCHA | Usuario completa formulario | No resuelve reCAPTCHA | Botón "Ingresar" permanece deshabilitado |
| 3 | Credenciales válidas | Usuario ingresa datos correctos | Hace clic en "Ingresar" | Sistema autentica y redirige según rol al panel correspondiente |
| 4 | Credenciales inválidas | Usuario ingresa datos incorrectos | Hace clic en "Ingresar" | Sistema muestra "Correo o contraseña incorrectos" sin especificar cuál |
| 5 | Redirección por rol - Rector | Rector se autentica | Login exitoso | Redirige a Panel de Gestión Institucional |
| 6 | Redirección por rol - Coordinador | Coordinador se autentica | Login exitoso | Redirige a Panel de Matrícula y Cursos |
| 7 | Redirección por rol - Orientador | Orientador se autentica | Login exitoso | Redirige a Panel de Banco de Tareas |
| 8 | Redirección por rol - Docente | Docente se autentica | Login exitoso | Redirige a Panel de Asignaciones y Calificaciones |
| 9 | Registro de auditoría | Login exitoso | Automático | Se registra IP, user-agent, fecha/hora en tabla auditoría |
| 10 | Generación de token JWT | Login exitoso | Automático | Se genera token con expiración de 24 horas |

---

#### HU-06: Cambiar contraseña en primer ingreso

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-06 |
| **Épica Relacionada** | EP-02 |
| **Rol** | Rector, Coordinador, Orientador, Docente |
| **Característica** | Cambiar la contraseña temporal asignada por una personalizada en el primer login |
| **Razón / Resultado** | Para garantizar la seguridad de la cuenta mediante una contraseña conocida solo por el usuario |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Redirección forzada | Usuario con debe_cambiar_contrasena=true | Hace login exitoso | Sistema redirige a pantalla de cambio de contraseña, no permite navegar a otro lugar |
| 2 | Formulario de cambio | Usuario está en pantalla de cambio | Visualiza formulario | Campos: contraseña actual, nueva contraseña, confirmar contraseña |
| 3 | Validación de requisitos | Usuario escribe nueva contraseña | Escribe en campo | Checklist visual en tiempo real: ✅ 8 caracteres, ✅ 1 mayúscula, ✅ 1 número, ✅ 1 especial |
| 4 | Contraseñas no coinciden | Usuario confirma contraseña diferente | Escribe en confirmar | Mensaje "Las contraseñas no coinciden" |
| 5 | Contraseña actual incorrecta | Usuario ingresa contraseña actual errónea | Hace clic en "Cambiar" | Mensaje "La contraseña actual es incorrecta" |
| 6 | No usar contraseña temporal | Usuario intenta usar la misma contraseña | Ingresa contraseña temporal como nueva | Mensaje "La nueva contraseña debe ser diferente a la actual" |
| 7 | Cambio exitoso | Usuario completa correctamente | Hace clic en "Cambiar" | Sistema actualiza contraseña, cambia debe_cambiar_contrasena=false, redirige a panel |

---

#### HU-07: Cerrar sesión

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-07 |
| **Épica Relacionada** | EP-02 |
| **Rol** | Admin General, Rector, Coordinador, Orientador, Docente |
| **Característica** | Cerrar la sesión activa de manera segura |
| **Razón / Resultado** | Para proteger la cuenta al terminar de usar el sistema, especialmente en equipos compartidos |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Botón visible | Usuario está autenticado en cualquier vista | Visualiza header/sidebar | Botón "Cerrar sesión" visible en todas las pantallas |
| 2 | Confirmación de cierre | Usuario hace clic en cerrar sesión | Clic en botón | Diálogo de confirmación "¿Seguro que deseas cerrar sesión?" |
| 3 | Cancelar cierre | Usuario ve diálogo de confirmación | Hace clic en "Cancelar" | Diálogo se cierra, usuario permanece en la vista actual |
| 4 | Confirmar cierre | Usuario ve diálogo de confirmación | Hace clic en "Sí, cerrar" | Sesión se cierra, token se invalida, redirige a login |
| 5 | Limpieza de datos | Sesión cerrada | Automático | Se eliminan tokens de localStorage/sessionStorage |

---

### 📌 ÉPICA EP-03: Gestión Académica Institucional

---

#### HU-08: Registrar cursos y grados

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-08 |
| **Épica Relacionada** | EP-03 |
| **Rol** | Rector, Coordinador Académico |
| **Característica** | Crear cursos específicos (ej: 5°A, 5°B) dentro de los grados de la institución |
| **Razón / Resultado** | Para organizar la estructura académica donde se vincularán estudiantes y docentes |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso a gestión de cursos | Usuario está en panel institucional | Hace clic en "Cursos" | Se muestra listado de cursos existentes + botón "Nuevo Curso" |
| 2 | Formulario de nuevo curso | Usuario hace clic en "Nuevo Curso" | Abre formulario | Campos: Grado (dropdown), Nombre del curso (texto), Jornada (Mañana/Tarde/Completa) |
| 3 | Grados según niveles | Usuario abre dropdown de grados | Visualiza opciones | Solo muestra grados de los niveles educativos de la institución |
| 4 | Validación de duplicados | Usuario intenta crear curso existente | Ingresa "5° A" que ya existe | Mensaje "Ya existe un curso con ese nombre para el grado seleccionado" |
| 5 | Registro exitoso | Usuario completa formulario correctamente | Hace clic en "Guardar" | Curso se crea, aparece en listado, mensaje de confirmación |
| 6 | Vinculación automática | Curso creado | Automático | Curso queda asociado al institution_id del creador |
| 7 | Listado con filtros | Usuario está en listado de cursos | Usa filtros | Puede filtrar por grado, jornada, buscar por nombre |

---

#### HU-09: Registrar orientadores

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-09 |
| **Épica Relacionada** | EP-03 |
| **Rol** | Rector, Coordinador |
| **Característica** | Crear cuentas de orientador escolar para gestionar el banco de tareas institucional |
| **Razón / Resultado** | Para que los orientadores puedan crear y asignar tareas de Cátedra de Familia a toda la institución |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Formulario de orientador | Usuario está en gestión de personal | Hace clic en "Nuevo Orientador" | Formulario con: nombres, apellidos, documento, teléfono, correo, dirección |
| 2 | Validación de correo | Usuario ingresa correo | Escribe en campo | Valida formato de correo electrónico válido |
| 3 | Validación de documento único | Usuario ingresa documento existente | Intenta guardar | Mensaje "El documento ya está registrado" |
| 4 | Generación de credenciales | Registro exitoso | Automático | Sistema genera usuario (correo) y contraseña temporal |
| 5 | Vinculación institucional | Registro exitoso | Automático | Orientador queda vinculado al institution_id del creador |
| 6 | Rol asignado | Registro exitoso | Automático | Se asigna rol "Orientador" en tabla usuarios |

---

#### HU-10: Registrar docentes y asignar cursos

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-10 |
| **Épica Relacionada** | EP-03 |
| **Rol** | Rector, Coordinador |
| **Característica** | Crear cuentas de docentes y asignarlos a uno o más cursos, especificando director de curso |
| **Razón / Resultado** | Para que los docentes puedan asignar y calificar tareas de los cursos a su cargo |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Formulario de docente | Usuario está en gestión de personal | Hace clic en "Nuevo Docente" | Formulario con datos personales + selector múltiple de cursos |
| 2 | Asignación de cursos | Usuario está en formulario | Selecciona cursos del multiselect | Puede seleccionar uno o más cursos de la institución |
| 3 | Director de curso | Usuario asigna curso | Marca checkbox "Director de curso" | Opción disponible por cada curso asignado |
| 4 | Un director por curso | Usuario marca director en curso con director | Intenta guardar | Mensaje "El curso X ya tiene un director asignado: [Nombre]" |
| 5 | Validación de documento | Usuario ingresa documento existente | Intenta guardar | Mensaje de documento duplicado |
| 6 | Generación de credenciales | Registro exitoso | Automático | Sistema genera y envía credenciales por correo |
| 7 | Asignaciones múltiples | Docente ya registrado | Usuario edita docente | Puede agregar o quitar asignaciones de cursos |

---

### 📌 ÉPICA EP-04: Registro y Carga Masiva de Estudiantes y Acudientes

---

#### HU-11: Registrar estudiante individualmente

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-11 |
| **Épica Relacionada** | EP-04 |
| **Rol** | Coordinador Académico, Rector |
| **Característica** | Registrar un estudiante con todos sus datos personales, académicos y médicos |
| **Razón / Resultado** | Para matricular estudiantes individualmente cuando no se requiere carga masiva |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Formulario completo | Usuario está en gestión de estudiantes | Hace clic en "Nuevo Estudiante" | Formulario con pestañas: Datos Personales, Académico, Médico, Socioeconómico |
| 2 | Datos personales obligatorios | Usuario está en pestaña Datos Personales | Visualiza campos | Campos: nombres, apellidos, tipo documento, número documento, fecha nacimiento, sexo |
| 3 | Validación de edad | Usuario ingresa fecha de nacimiento | Sale del campo | Sistema calcula edad, valida rango 3-18 años, muestra edad calculada |
| 4 | Selección de curso | Usuario está en pestaña Académico | Selecciona curso del dropdown | Solo muestra cursos activos de la institución |
| 5 | Datos médicos opcionales | Usuario está en pestaña Médico | Visualiza campos | Campos opcionales: grupo sanguíneo, RH, EPS, alergias, condiciones especiales |
| 6 | Datos socioeconómicos | Usuario está en pestaña Socioeconómico | Visualiza campos | Campos: estrato (1-6), etnia (opcional), país/ciudad nacimiento |
| 7 | Validación de documento único | Usuario intenta registrar documento existente | Hace clic en "Guardar" | Mensaje "El estudiante con documento X ya está registrado" |
| 8 | Registro exitoso | Usuario completa datos obligatorios | Hace clic en "Guardar" | Estudiante creado, vinculado a curso, mensaje de confirmación |

---

#### HU-12: Registrar acudiente individualmente

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-12 |
| **Épica Relacionada** | EP-04 |
| **Rol** | Coordinador Académico, Rector |
| **Característica** | Registrar un padre de familia o acudiente con sus datos de contacto y laborales |
| **Razón / Resultado** | Para crear la cuenta del acudiente que usará la app móvil para entregar tareas |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Formulario de acudiente | Usuario está en gestión de acudientes | Hace clic en "Nuevo Acudiente" | Formulario con: datos personales, contacto, información laboral |
| 2 | Datos de contacto obligatorios | Usuario visualiza formulario | Revisa campos | Teléfono principal es obligatorio, teléfono alternativo y correo son opcionales |
| 3 | Información laboral | Usuario completa formulario | Ingresa datos laborales | Campos: ocupación, tipo de trabajo, nivel educativo, horario laboral, aporta economía |
| 4 | Generación automática de credenciales | Registro exitoso | Automático | Usuario = número de teléfono, Contraseña = número de documento |
| 5 | Flag de cambio de contraseña | Registro exitoso | Automático | Se establece debe_cambiar_contrasena = true |
| 6 | Validación de documento único | Usuario ingresa documento existente | Intenta guardar | Mensaje "El acudiente con documento X ya está registrado" |
| 7 | Confirmación con credenciales | Registro exitoso | Muestra modal | "Acudiente registrado. Credenciales: Usuario: 3101234567, Contraseña: 12345678" |

---

#### HU-13: Vincular estudiante con acudiente

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-13 |
| **Épica Relacionada** | EP-04 |
| **Rol** | Coordinador Académico, Rector |
| **Característica** | Establecer la relación entre un estudiante y uno o más acudientes con parentesco |
| **Razón / Resultado** | Para que el acudiente pueda ver las tareas del estudiante en la app móvil |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Buscar estudiante | Usuario está en vinculación | Busca por nombre o documento | Sistema muestra resultados coincidentes de estudiantes |
| 2 | Buscar acudiente | Usuario seleccionó estudiante | Busca acudiente por nombre o documento | Sistema muestra resultados coincidentes de acudientes |
| 3 | Seleccionar parentesco | Usuario va a vincular | Selecciona del dropdown | Opciones: Padre, Madre, Abuelo/a, Tío/a, Hermano/a, Otro |
| 4 | Marcar acudiente principal | Usuario vincula acudiente | Activa switch "Acudiente Principal" | Se marca es_principal = true en la relación |
| 5 | Un acudiente principal por estudiante | Usuario marca segundo principal | Intenta guardar | Sistema pregunta "Ya existe un acudiente principal. ¿Desea reemplazarlo?" |
| 6 | Múltiples acudientes | Estudiante ya tiene acudiente | Usuario agrega otro | Sistema permite múltiples acudientes por estudiante |
| 7 | Vinculación exitosa | Usuario completa datos | Hace clic en "Vincular" | Relación creada en tabla estudiante_acudiente, mensaje de confirmación |

---

#### HU-14: Cargar masivamente estudiantes y acudientes por Excel

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-14 |
| **Épica Relacionada** | EP-04 |
| **Rol** | Coordinador Académico |
| **Característica** | Subir archivo Excel con datos de múltiples estudiantes y acudientes para registro masivo |
| **Razón / Resultado** | Para agilizar el proceso de matrícula registrando hasta 500 estudiantes/acudientes en una sola operación |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Descargar plantilla | Usuario está en carga masiva | Hace clic en "Descargar plantilla" | Descarga archivo Excel con columnas: nombres_estudiante, apellidos_estudiante, tipo_doc_estudiante, num_doc_estudiante, fecha_nacimiento, sexo, curso_id, nombres_acudiente, apellidos_acudiente, tipo_doc_acudiente, num_doc_acudiente, telefono_acudiente, parentesco, es_principal |
| 2 | Seleccionar archivo | Usuario tiene plantilla diligenciada | Hace clic en "Cargar archivo" | Abre selector de archivos, acepta .xlsx y .csv |
| 3 | Validación de formato | Usuario sube archivo | Sistema procesa | Valida que tenga todas las columnas requeridas |
| 4 | Vista previa de datos | Archivo válido | Sistema muestra preview | Tabla con todas las filas, indicador ✅ válido o ❌ error por fila |
| 5 | Detalle de errores | Fila tiene error | Usuario ve indicador ❌ | Tooltip o columna mostrando: "Documento duplicado", "Curso no existe", "Fecha inválida" |
| 6 | Validación de edad | Sistema procesa fechas | Automático | Valida que edad calculada esté entre 3 y 18 años |
| 7 | Validación de curso | Sistema procesa curso_id | Automático | Valida que el curso exista en la institución |
| 8 | Opción omitir errores | Usuario ve filas con errores | Activa checkbox | "Omitir filas con error y continuar con las válidas" |
| 9 | Límite de filas | Usuario sube archivo grande | Sistema valida | Máximo 500 filas por archivo, mensaje si excede |
| 10 | Barra de progreso | Usuario confirma carga | Sistema procesa | Muestra "Procesando 45 de 200 registros..." con barra visual |
| 11 | Transacción completa | Procesamiento en curso | Error en medio del proceso | Si falla, no se crea ningún registro (rollback), mensaje de error |
| 12 | Reporte de errores | Procesamiento con errores omitidos | Finaliza carga | Botón "Descargar reporte de errores" con CSV detallando filas fallidas y motivos |
| 13 | Carga exitosa | Todas las filas válidas procesadas | Finaliza carga | Mensaje "Se registraron X estudiantes y Y acudientes exitosamente" |
| 14 | Generación de credenciales masiva | Carga exitosa | Automático | Cada acudiente recibe credenciales: usuario=teléfono, contraseña=documento |

---

#### HU-15: Gestionar estudiantes (editar, retirar, trasladar)

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-15 |
| **Épica Relacionada** | EP-04 |
| **Rol** | Coordinador Académico, Rector |
| **Característica** | Editar información de estudiantes, gestionar retiros y traslados entre cursos |
| **Razón / Resultado** | Para mantener actualizada la información estudiantil durante el año escolar |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Buscar estudiante | Usuario está en gestión de estudiantes | Busca por nombre o documento | Sistema muestra resultados con opciones: Editar, Cambiar curso, Retirar |
| 2 | Editar información | Usuario selecciona "Editar" | Abre formulario | Formulario pre-cargado con datos actuales, campos editables |
| 3 | Cambiar de curso | Usuario selecciona "Cambiar curso" | Abre modal | Selector de nuevo curso + campo de observaciones |
| 4 | Historial de curso | Cambio de curso exitoso | Automático | Se registra en historial: curso anterior, nuevo curso, fecha, motivo |
| 5 | Retirar estudiante | Usuario selecciona "Retirar" | Abre modal de confirmación | Solicita motivo del retiro, fecha efectiva |
| 6 | Estado de retirado | Retiro confirmado | Automático | Estudiante marcado como inactivo, no aparece en listados activos |
| 7 | Auditoría de cambios | Cualquier modificación | Automático | Se registra usuario, fecha, campos modificados en auditoría |

---

### 📌 ÉPICA EP-05: Banco de Tareas y Asignaciones

---

#### HU-16: Crear tarea en el banco institucional

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-16 |
| **Épica Relacionada** | EP-05 |
| **Rol** | Orientador, Docente |
| **Característica** | Agregar una nueva tarea o taller al banco de tareas de la institución |
| **Razón / Resultado** | Para crear actividades de Cátedra de Familia reutilizables que fortalezcan los lazos familiares |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Formulario de tarea | Usuario está en banco de tareas | Hace clic en "Nueva Tarea" | Formulario con: título, descripción, categoría, grados objetivo, tipo calificación |
| 2 | Selección de categoría | Usuario está en formulario | Abre dropdown de categoría | Muestra categorías predefinidas de Cátedra de Familia |
| 3 | Grados objetivo múltiples | Usuario selecciona grados | Usa multiselect | Puede seleccionar múltiples grados (Transición a 11°) para reutilización |
| 4 | Tipo de calificación | Usuario selecciona tipo | Elige opción | Opciones: Automática (por puntualidad), Manual (docente califica) |
| 5 | Criterios automáticos | Usuario selecciona "Automática" | Sistema muestra | Información: "A tiempo: 5.0, 3 días retraso: 4.9, 6 días: 4.8" |
| 6 | Adjuntar archivos | Usuario quiere agregar material | Hace clic en "Adjuntar" | Permite subir hasta 3 archivos (PDF, DOCX, JPG, PNG), máx 5MB c/u |
| 7 | Enlaces de referencia | Usuario agrega enlaces | Escribe en campo | Campo opcional para URLs de referencia (videos, artículos) |
| 8 | Guardar tarea | Usuario completa formulario | Hace clic en "Guardar" | Tarea creada en banco, registra creado_por, mensaje de confirmación |
| 9 | Disponible para asignación | Tarea guardada | Automático | Aparece en listado de banco filtrable por categoría y grado |

---

#### HU-17: Asignar tarea a curso(s)

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-17 |
| **Épica Relacionada** | EP-05 |
| **Rol** | Orientador, Docente |
| **Característica** | Asignar una tarea del banco a uno o múltiples cursos con fechas definidas |
| **Razón / Resultado** | Para publicar actividades de Cátedra de Familia a todos los estudiantes de los cursos seleccionados |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Seleccionar tarea | Usuario está en banco de tareas | Hace clic en "Asignar" de una tarea | Abre modal de asignación con info de la tarea |
| 2 | Seleccionar cursos | Usuario está en modal | Usa multiselect de cursos | Muestra cursos del grado objetivo de la tarea |
| 3 | Validar grado compatible | Usuario selecciona curso | Sistema valida | Solo permite cursos que coincidan con grados objetivo de la tarea |
| 4 | Fecha de publicación | Usuario configura fechas | Selecciona fecha en datepicker | Fecha desde cuando será visible para acudientes |
| 5 | Fecha de vencimiento | Usuario configura fechas | Selecciona fecha en datepicker | Fecha límite de entrega |
| 6 | Validar fechas | Usuario selecciona vencimiento | Sistema valida | Vencimiento debe ser posterior a publicación |
| 7 | Frecuencia | Usuario configura recurrencia | Selecciona del dropdown | Opciones: Única, Semanal, Quincenal, Mensual |
| 8 | Confirmar asignación | Usuario completa configuración | Hace clic en "Asignar" | Asignación creada para cada curso seleccionado |
| 9 | Notificación automática | Asignación exitosa y fecha_publicacion <= HOY | Sistema automático | Envía push notification a acudientes de estudiantes de los cursos |
| 10 | Notificación programada | Asignación con fecha_publicacion futura | Sistema programa | Notificación se enviará en la fecha de publicación |

---

#### HU-18: Asignar tarea a estudiante específico

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-18 |
| **Épica Relacionada** | EP-05 |
| **Rol** | Orientador, Docente |
| **Característica** | Asignar una tarea individual a uno o más estudiantes específicos (refuerzos, casos especiales) |
| **Razón / Resultado** | Para dar atención personalizada a estudiantes que requieren actividades adicionales o diferentes |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Seleccionar curso | Usuario está en asignación individual | Selecciona curso del dropdown | Muestra listado de estudiantes del curso |
| 2 | Seleccionar estudiantes | Usuario ve listado | Marca checkbox de estudiantes | Permite selección múltiple de estudiantes |
| 3 | Seleccionar tarea | Usuario tiene estudiantes seleccionados | Selecciona tarea del banco | Muestra tareas compatibles con el grado del curso |
| 4 | Agregar observaciones | Usuario configura asignación | Escribe en campo | Campo opcional para notas: "Refuerzo por inasistencia", "Tarea adicional" |
| 5 | Configurar fechas | Usuario completa formulario | Selecciona fechas | Fecha publicación y vencimiento obligatorias |
| 6 | Confirmar asignación | Usuario hace clic en "Asignar" | Sistema procesa | Crea asignación individual para cada estudiante seleccionado |
| 7 | Notificación personalizada | Asignación exitosa | Sistema envía | Push notification solo a acudientes de los estudiantes seleccionados |

---

### 📌 ÉPICA EP-06: Calificación y Seguimiento Académico

---

#### HU-19: Ver entregas pendientes de calificar

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-19 |
| **Épica Relacionada** | EP-06 |
| **Rol** | Docente, Orientador |
| **Característica** | Visualizar listado de entregas recibidas que requieren calificación |
| **Razón / Resultado** | Para identificar rápidamente qué trabajos necesitan ser revisados y calificados |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Listado de entregas | Usuario accede a calificaciones | Carga la pantalla | Muestra listado de entregas con estado "Entregada" (sin calificar) |
| 2 | Filtrar por curso | Usuario tiene entregas de varios cursos | Selecciona filtro de curso | Lista se actualiza mostrando solo entregas del curso seleccionado |
| 3 | Filtrar por tarea | Usuario quiere ver tarea específica | Selecciona filtro de tarea | Lista muestra solo entregas de esa tarea |
| 4 | Ordenar por fecha | Usuario ve listado | Selecciona ordenamiento | Opciones: fecha de entrega (asc/desc), estudiante (A-Z) |
| 5 | Información de cada entrega | Usuario ve listado | Visualiza cards | Cada card muestra: estudiante, tarea, fecha entrega, días de retraso (si aplica) |
| 6 | Indicador de retraso | Entrega después de vencimiento | Visualiza card | Badge rojo "X días de retraso" visible |
| 7 | Acceso a detalle | Usuario quiere calificar | Hace clic en entrega | Navega a pantalla de revisión y calificación |

---

#### HU-20: Revisar evidencias y calificar entrega

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-20 |
| **Épica Relacionada** | EP-06 |
| **Rol** | Docente, Orientador |
| **Característica** | Revisar archivos/texto enviados por el acudiente y asignar calificación con retroalimentación |
| **Razón / Resultado** | Para evaluar el trabajo realizado y proporcionar retroalimentación formativa a la familia |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Ver información de entrega | Usuario accede a detalle | Carga pantalla | Muestra: estudiante, acudiente que envió, fecha/hora de entrega, tarea asignada |
| 2 | Ver descripción textual | Entrega tiene texto | Visualiza sección | Texto completo de la descripción enviada por el acudiente |
| 3 | Ver archivos adjuntos | Entrega tiene archivos | Visualiza galería | Miniaturas de fotos/videos, opción de ampliar, descargar |
| 4 | Visualizar multimedia | Usuario hace clic en archivo | Abre visor | Visor integrado para imágenes, reproductor para videos, descarga para documentos |
| 5 | Calificación automática sugerida | Tarea es de tipo automática | Carga formulario | Sistema calcula y muestra calificación sugerida según días de retraso |
| 6 | Modificar calificación automática | Calificación sugerida visible | Edita campo | Docente puede cambiar la calificación sugerida |
| 7 | Ingresar calificación manual | Tarea es de tipo manual | Visualiza formulario | Campo numérico 1.0 - 5.0 vacío para ingresar nota |
| 8 | Seleccionar escala cualitativa | Docente ingresa nota numérica | Sistema calcula | Auto-selecciona: Bajo (1.0-2.9), Medio (3.0-3.9), Alto (4.0-5.0) |
| 9 | Nota cualitativa opcional | Docente califica | Visualiza dropdown | Opciones: Sobresaliente, Aceptable, Insuficiente (opcional) |
| 10 | Agregar retroalimentación | Docente quiere comentar | Escribe en textarea | Campo para comentarios, sugerencias, felicitaciones |
| 11 | Guardar calificación | Docente completa formulario | Hace clic en "Guardar" | Calificación registrada, calificado_por = docente actual, fecha_calificacion = ahora |
| 12 | Notificación al acudiente | Calificación guardada | Sistema automático | Push notification al acudiente con: nota, escala, extracto de retroalimentación |

---

#### HU-21: Generar reportes de entregas y calificaciones

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-21 |
| **Épica Relacionada** | EP-06 |
| **Rol** | Docente, Orientador, Coordinador |
| **Característica** | Generar reportes consolidados de entregas y calificaciones por curso, período o estudiante |
| **Razón / Resultado** | Para analizar el cumplimiento de tareas y rendimiento en Cátedra de Familia |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso a reportes | Usuario está en panel | Hace clic en "Reportes" | Muestra opciones: Por curso, Por período, Por estudiante |
| 2 | Reporte por curso | Usuario selecciona opción | Configura parámetros | Selector de curso + período + botón "Generar" |
| 3 | Resumen de curso | Reporte generado | Visualiza resultado | Muestra: total tareas, entregas recibidas, promedio curso, % cumplimiento |
| 4 | Detalle por estudiante | Usuario ve reporte de curso | Expande sección | Lista de estudiantes con: tareas asignadas, entregadas, promedio individual |
| 5 | Identificar bajo cumplimiento | Reporte muestra estudiantes | Visualiza indicadores | Resalta en rojo estudiantes con menos del 50% de entregas |
| 6 | Exportar reporte | Usuario quiere descargar | Hace clic en "Exportar" | Descarga Excel con todos los datos del reporte |
| 7 | Reporte por período | Usuario genera reporte general | Visualiza resultado | Consolidado de todos los cursos del período seleccionado |

---

## HISTORIAS DE USUARIO - APLICACIÓN MÓVIL ANDROID

---

### 📌 ÉPICA EP-07: Autenticación y Gestión de Perfil de Acudientes

---

#### HU-22: Iniciar sesión en app móvil

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-22 |
| **Épica Relacionada** | EP-07 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Autenticarse en la aplicación móvil usando las credenciales generadas por la institución |
| **Razón / Resultado** | Para acceder a las tareas de mi(s) hijo(s) y poder enviar evidencias de las actividades realizadas |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Pantalla de login | Acudiente abre la app | Carga LoginActivity | Muestra campos: número de documento, contraseña, botón "Ingresar", link "¿Olvidaste tu contraseña?" |
| 2 | Credenciales por defecto | Acudiente registrado recientemente | Intenta login | Usuario = número de documento, Contraseña = número de documento |
| 3 | Validación de campos vacíos | Acudiente deja campos vacíos | Hace clic en "Ingresar" | Mensaje "Por favor completa todos los campos" |
| 4 | Credenciales incorrectas | Acudiente ingresa datos erróneos | Hace clic en "Ingresar" | Mensaje "Documento o contraseña incorrectos" |
| 5 | Login exitoso | Credenciales correctas | Sistema valida | Almacena token JWT en SharedPreferences, registra FCM token, actualiza ultimo_ingreso |
| 6 | Shimmer durante carga | Login en proceso | Esperando respuesta | Muestra shimmer effect indicando carga |
| 7 | Timeout de conexión | Sin respuesta del servidor | Pasan 15 segundos | Mensaje "No se pudo conectar. Verifica tu conexión a internet" |
| 8 | Redirección según estado | Login exitoso + debe_cambiar = true | Sistema verifica | Redirige a CambiarContrasenaActivity |
| 9 | Redirección normal | Login exitoso + debe_cambiar = false | Sistema verifica | Redirige a MainActivity (Dashboard) |

---

#### HU-23: Ver onboarding en primer ingreso

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-23 |
| **Épica Relacionada** | EP-07 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Ver tutorial explicativo de la aplicación solo en la primera vez que la uso |
| **Razón / Resultado** | Para entender el propósito de la app y cómo usarla antes de comenzar |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Mostrar solo primera vez | Acudiente abre app por primera vez | App detecta onboarding_completado = false | Muestra OnboardingActivity antes del login |
| 2 | Slide 1 - Bienvenida | Acudiente ve onboarding | Visualiza slide 1 | Título "PARCHANDO JUNTOS", subtítulo "Fortalece los lazos familiares", animación Lottie |
| 3 | Slide 2 - Qué es | Acudiente desliza | Visualiza slide 2 | Explicación de Cátedra de Familia y su propósito |
| 4 | Slide 3 - Cómo funciona | Acudiente desliza | Visualiza slide 3 | Flujo: Recibir tarea → Realizar en familia → Enviar evidencia → Ver calificación |
| 5 | Slide 4 - Funciona offline | Acudiente desliza | Visualiza slide 4 | Mensaje "¡Funciona sin internet! Tus entregas se enviarán cuando tengas conexión" |
| 6 | Indicadores de página | En cualquier slide | Visualiza inferior | Dots indicando posición actual (ej: ●○○○) |
| 7 | Botón Saltar | En cualquier slide | Visualiza botón | Botón "Saltar" visible para omitir tutorial |
| 8 | Botón Comenzar | En slide 4 | Visualiza botón | Botón "COMENZAR 🚀" reemplaza navegación |
| 9 | Finalizar onboarding | Acudiente hace clic en Saltar o Comenzar | Procesa acción | Guarda onboarding_completado = true, navega a LoginActivity |
| 10 | No mostrar de nuevo | Acudiente abre app después | App verifica | Salta directamente a LoginActivity |

---

#### HU-24: Cambiar contraseña obligatoriamente (primer ingreso)

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-24 |
| **Épica Relacionada** | EP-07 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Cambiar la contraseña por defecto (número de documento) por una personalizada y segura |
| **Razón / Resultado** | Para proteger mi cuenta con una contraseña que solo yo conozca |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Pantalla de cambio forzoso | Acudiente con debe_cambiar = true | Login exitoso | Redirige a CambiarContrasenaActivity, no puede navegar a otro lugar |
| 2 | Formulario de cambio | Acudiente ve pantalla | Visualiza formulario | Campos: contraseña actual, nueva contraseña, confirmar contraseña |
| 3 | Contraseña actual conocida | Acudiente necesita recordar | Visualiza hint | Texto de ayuda: "Tu contraseña actual es tu número de documento" |
| 4 | Requisitos visuales en tiempo real | Acudiente escribe nueva contraseña | Escribe caracteres | Checklist visual: ✅/❌ 8 caracteres, ✅/❌ 1 mayúscula, ✅/❌ 1 número, ✅/❌ 1 especial (@#$%&*) |
| 5 | Botón deshabilitado | Requisitos no cumplidos | Visualiza botón | Botón "Actualizar" deshabilitado hasta cumplir todos los requisitos |
| 6 | Contraseñas no coinciden | Confirmación diferente | Sale del campo | Mensaje "Las contraseñas no coinciden" |
| 7 | No usar mismo documento | Acudiente usa documento como nueva | Intenta guardar | Mensaje "La nueva contraseña no puede ser tu número de documento" |
| 8 | Cambio exitoso | Acudiente completa correctamente | Hace clic en "Actualizar" | Contraseña actualizada, debe_cambiar = false, navega a MainActivity |
| 9 | Confirmación visual | Cambio exitoso | Muestra feedback | Snackbar "✅ Contraseña actualizada correctamente" |

---

#### HU-25: Recuperar contraseña olvidada

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-25 |
| **Épica Relacionada** | EP-07 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Restablecer mi contraseña mediante código de verificación enviado por SMS o email |
| **Razón / Resultado** | Para recuperar el acceso a mi cuenta si olvidé mi contraseña |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso a recuperación | Acudiente está en login | Hace clic en "¿Olvidaste tu contraseña?" | Navega a RecuperarContrasenaActivity |
| 2 | Paso 1 - Ingresar contacto | Acudiente ve pantalla | Visualiza formulario | Campo para número de teléfono o correo electrónico |
| 3 | Usuario no encontrado | Acudiente ingresa dato no registrado | Hace clic en "Enviar código" | Mensaje "No encontramos una cuenta con ese dato" |
| 4 | Envío de código | Dato válido | Sistema procesa | Envía SMS o email con código de 6 dígitos, muestra Paso 2 |
| 5 | Paso 2 - Ingresar código | Código enviado | Visualiza pantalla | 6 campos para ingresar dígitos del código OTP |
| 6 | Código expirado | Pasan más de 15 minutos | Acudiente ingresa código | Mensaje "El código ha expirado. Solicita uno nuevo" |
| 7 | Máximo 3 intentos | Acudiente ingresa código incorrecto 3 veces | Tercer intento fallido | Mensaje "Demasiados intentos. Solicita un nuevo código" |
| 8 | Reenviar código | Acudiente no recibió código | Hace clic en "Reenviar código" después de 60s | Envía nuevo código, reinicia intentos |
| 9 | Código válido | Acudiente ingresa código correcto | Sistema valida | Navega a Paso 3 - Nueva contraseña |
| 10 | Paso 3 - Nueva contraseña | Código validado | Visualiza formulario | Campos: nueva contraseña + confirmación con requisitos |
| 11 | Contraseña actualizada | Acudiente completa paso 3 | Sistema procesa | Contraseña cambiada, navega a login con mensaje de éxito |

---

#### HU-26: Cambiar entre hijos vinculados

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-26 |
| **Épica Relacionada** | EP-07 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Seleccionar cuál de mis hijos vinculados quiero ver para gestionar sus tareas |
| **Razón / Resultado** | Para ver las tareas específicas de cada uno de mis hijos si tengo más de uno registrado |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Selector de hijo visible | Acudiente tiene múltiples hijos | Carga MainActivity | Header muestra nombre del hijo seleccionado + ícono para cambiar |
| 2 | Abrir selector | Acudiente quiere cambiar | Hace clic en selector/drawer | Muestra lista de todos los hijos vinculados |
| 3 | Información de cada hijo | Acudiente ve lista | Visualiza opciones | Cada hijo muestra: foto, nombre completo, curso/grado, badge "Principal" si aplica |
| 4 | Seleccionar hijo | Acudiente hace clic en un hijo | Selecciona de la lista | Cierra selector, actualiza header con nuevo hijo seleccionado |
| 5 | Actualizar toda la UI | Hijo cambiado | Sistema procesa | Recarga tareas, historial, calificaciones del nuevo hijo seleccionado |
| 6 | Persistir selección | Acudiente cierra app | Reabre app | Mantiene el último hijo seleccionado desde SharedPreferences |
| 7 | Un solo hijo | Acudiente tiene solo un hijo | Carga MainActivity | Selector oculto o deshabilitado, muestra directamente al hijo único |

---

#### HU-27: Ver perfil del estudiante

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-27 |
| **Épica Relacionada** | EP-07 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Consultar la información completa del perfil de mi hijo |
| **Razón / Resultado** | Para verificar que los datos registrados de mi hijo están correctos |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso al perfil | Acudiente está en MainActivity | Hace clic en "Ver perfil" del hijo | Navega a PerfilEstudianteActivity |
| 2 | Sección datos personales | Acudiente ve perfil | Visualiza sección | Muestra: foto, nombres, apellidos, documento, fecha nacimiento, sexo, edad calculada |
| 3 | Sección datos médicos | Acudiente ve perfil | Visualiza sección | Muestra: grupo sanguíneo + RH, EPS (campos opcionales) |
| 4 | Sección datos académicos | Acudiente ve perfil | Visualiza sección | Muestra: institución, curso, grado, jornada |
| 5 | Estadísticas del período | Acudiente ve perfil | Visualiza sección | Muestra: total tareas asignadas, completadas, promedio del período |
| 6 | Formato de fecha | Fecha de nacimiento mostrada | Visualiza campo | Formato DD/MM/YYYY (ej: 15/03/2015) |
| 7 | Placeholder si no hay foto | Estudiante sin foto registrada | Visualiza perfil | Muestra ícono de avatar por defecto |

---

### 📌 ÉPICA EP-08: Visualización y Envío de Tareas con Soporte Offline

---

#### HU-28: Ver lista de tareas asignadas

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-28 |
| **Épica Relacionada** | EP-08 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Visualizar todas las tareas asignadas al curso de mi hijo con su estado actual |
| **Razón / Resultado** | Para saber qué tareas tengo pendientes y cuáles ya entregué |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Lista de tareas | Acudiente accede a TareasActivity | Carga pantalla | RecyclerView con cards de tareas del período activo |
| 2 | Información de cada card | Acudiente ve lista | Visualiza cards | Cada card muestra: título, fecha vencimiento, frecuencia, estado |
| 3 | Estados de tarea | Tareas con diferentes estados | Visualiza indicadores | Pendiente (azul), Entregada (verde), Calificada (verde check), Vencida (rojo) |
| 4 | Indicador de urgencia | Tarea próxima a vencer | Visualiza card | 🟡 Amarillo si quedan ≤3 días para vencer |
| 5 | Indicador de vencida | Tarea vencida sin entregar | Visualiza card | 🔴 Rojo con texto "Vencida" |
| 6 | Ordenamiento | Lista cargada | Automático | Ordenadas por fecha de vencimiento (más próximas primero) |
| 7 | Pull to refresh | Acudiente arrastra hacia abajo | Gesto de refresh | Actualiza lista desde API, muestra indicador de carga |
| 8 | Última sincronización | Lista actualizada | Visualiza inferior | Texto "Última actualización: hace X minutos" |
| 9 | Estado vacío | No hay tareas en el período | Visualiza pantalla | Mensaje "No tienes tareas asignadas en este momento" con ilustración |
| 10 | Acceso a detalle | Acudiente quiere ver tarea | Hace clic en card | Navega a TareaDetalleActivity |

---

#### HU-29: Filtrar tareas por estado

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-29 |
| **Épica Relacionada** | EP-08 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Filtrar la lista de tareas para ver solo las que necesito (pendientes, completadas, todas) |
| **Razón / Resultado** | Para encontrar rápidamente las tareas que me interesan sin revisar toda la lista |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | ChipGroup visible | Acudiente está en TareasActivity | Visualiza superior | ChipGroup con opciones: 📋 Todas, ⏳ Pendientes, ✅ Completadas |
| 2 | Filtro por defecto | Acudiente carga pantalla | Estado inicial | Chip "Todas" seleccionado |
| 3 | Seleccionar Pendientes | Acudiente toca chip Pendientes | Aplica filtro | Lista muestra solo tareas sin entregar |
| 4 | Seleccionar Completadas | Acudiente toca chip Completadas | Aplica filtro | Lista muestra solo tareas entregadas o calificadas |
| 5 | Feedback de filtro | Filtro aplicado | Visualiza feedback | Toast "Mostrando X tareas pendientes" |
| 6 | Chip seleccionado resaltado | Filtro activo | Visualiza chips | Chip seleccionado con estilo diferenciado (filled) |
| 7 | Filtro instantáneo | Acudiente cambia filtro | Sistema procesa | Lista se actualiza inmediatamente sin recargar desde API |
| 8 | Mantener filtro al rotar | Acudiente rota dispositivo | Activity recrea | Mantiene filtro seleccionado |

---

#### HU-30: Ver detalle completo de tarea

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-30 |
| **Épica Relacionada** | EP-08 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Ver toda la información de una tarea incluyendo descripción, fechas y material adjunto |
| **Razón / Resultado** | Para entender qué debo hacer y cómo completar la tarea correctamente |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Pantalla de detalle | Acudiente hace clic en tarea | Navega a TareaDetalleActivity | ScrollView con información completa de la tarea |
| 2 | Encabezado | Acudiente ve detalle | Visualiza superior | Título, categoría, indicador de estado visual |
| 3 | Descripción | Acudiente ve detalle | Visualiza sección | Texto completo de la descripción de la tarea |
| 4 | Fechas | Acudiente ve detalle | Visualiza sección | Fecha de publicación, fecha de vencimiento, días restantes |
| 5 | Frecuencia | Tarea es recurrente | Visualiza sección | Indica: Semanal, Quincenal o Mensual |
| 6 | Archivos adjuntos | Tarea tiene materiales | Visualiza sección | Lista de archivos descargables (PDF, imágenes) |
| 7 | Enlaces de referencia | Tarea tiene enlaces | Visualiza sección | Links clickeables que abren en navegador |
| 8 | Estado según vencimiento | Fecha de vencimiento pasó | Visualiza indicador | Banner rojo "Esta tarea está vencida" |
| 9 | Formulario de envío | Tarea no entregada | Visualiza inferior | Formulario de envío de evidencias (HU-31) |
| 10 | Evidencia enviada | Tarea ya entregada | Visualiza inferior | Muestra evidencia enviada + opción de editar (si aplica) |
| 11 | Calificación | Tarea calificada | Visualiza inferior | Card de calificación con nota y retroalimentación |
| 12 | Botón compartir | Acudiente quiere compartir | Hace clic en ícono | Intent.ACTION_SEND para compartir título y descripción |

---

#### HU-31: Enviar evidencia de tarea (fotos, videos, texto)

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-31 |
| **Épica Relacionada** | EP-08 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Enviar fotos, videos y descripción como evidencia de la actividad realizada en familia |
| **Razón / Resultado** | Para demostrar que realizamos la tarea y recibir calificación del docente |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Campo de descripción | Acudiente ve formulario de envío | Visualiza campo | EditText multiline para describir la actividad (máx 500 caracteres) |
| 2 | Contador de caracteres | Acudiente escribe descripción | Escribe texto | Contador "45/500" actualizado en tiempo real |
| 3 | Botones de multimedia | Acudiente ve formulario | Visualiza botones | 📷 Cámara, 🖼️ Galería, 📁 Archivos |
| 4 | Tomar foto | Acudiente hace clic en Cámara | Abre cámara | Intent de cámara, foto se agrega al preview |
| 5 | Seleccionar de galería | Acudiente hace clic en Galería | Abre galería | Selector de imágenes/videos, seleccionados se agregan al preview |
| 6 | Seleccionar archivo | Acudiente hace clic en Archivos | Abre DocumentProvider | Selector de documentos (PDF, etc.) |
| 7 | Preview de archivos | Archivos seleccionados | Visualiza preview | RecyclerView horizontal con miniaturas, botón X para eliminar |
| 8 | Límite de archivos | Acudiente tiene 3 archivos | Intenta agregar otro | Mensaje "Máximo 3 archivos por entrega" |
| 9 | Límite de tamaño | Archivo > 5MB | Intenta agregar | Mensaje "El archivo excede el tamaño máximo de 5MB" |
| 10 | Compresión de imágenes | Acudiente selecciona foto grande | Sistema procesa | Compresión automática manteniendo calidad aceptable |
| 11 | Permisos de cámara | Primera vez usando cámara | Sistema solicita | Diálogo de permiso de cámara, si deniega muestra instrucciones |
| 12 | Validación mínima | Acudiente intenta enviar vacío | Hace clic en "Enviar" | Mensaje "Debes agregar una descripción o al menos un archivo" |
| 13 | Envío con conexión | Acudiente tiene internet | Hace clic en "Enviar" | ProgressBar durante upload, Snackbar "✅ Evidencia enviada correctamente" |
| 14 | Estado de enviada | Envío exitoso | Sistema actualiza | Tarea cambia a estado "Entregada", se oculta formulario |

---

#### HU-32: Enviar evidencia sin conexión (modo offline)

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-32 |
| **Épica Relacionada** | EP-08 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Guardar la evidencia localmente cuando no tengo internet para que se envíe después automáticamente |
| **Razón / Resultado** | Para poder completar mis tareas aunque esté sin conexión, especialmente en zonas rurales |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Detectar sin conexión | Acudiente intenta enviar | No hay internet | Sistema detecta ausencia de conexión |
| 2 | Guardar en cola local | Sin conexión + envío | Sistema procesa | Guarda en SQLite: datos de entrega, archivos locales, timestamp |
| 3 | Feedback al usuario | Entrega guardada localmente | Muestra feedback | Snackbar "📶 Se enviará cuando tengas internet" |
| 4 | Badge de pendientes | Entregas en cola | Visualiza UI | Badge en MainActivity indicando "2 entregas pendientes" |
| 5 | Indicador en tarea | Tarea con entrega pendiente | Visualiza card | Ícono de sincronización pendiente en la tarea |
| 6 | Sincronización automática | Acudiente recupera conexión | WorkManager detecta | Procesa cola de entregas pendientes automáticamente |
| 7 | Notificación de sincronización | Entregas sincronizadas | Sistema notifica | Notificación "✅ Tus entregas fueron enviadas" |
| 8 | Reintentos automáticos | Fallo en sincronización | Sistema reintenta | Máximo 3 intentos por entrega |
| 9 | Reporte de fallos | Entrega falla 3 veces | Sistema notifica | Notificación "❌ No se pudo enviar la entrega de [Tarea]. Verifica e intenta de nuevo" |
| 10 | Eliminar de cola | Sincronización exitosa | Sistema limpia | Elimina de SQLite y archivos temporales |

---

#### HU-33: Editar entrega antes de la fecha límite

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-33 |
| **Épica Relacionada** | EP-08 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Modificar el texto o archivos de una entrega antes de que venza y sea calificada |
| **Razón / Resultado** | Para corregir errores o agregar más evidencia si olvidé algo |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Botón de editar visible | Tarea entregada + no vencida + no calificada | Visualiza detalle | Botón "Editar entrega" visible |
| 2 | Botón oculto si calificada | Tarea ya calificada | Visualiza detalle | Botón de editar no visible |
| 3 | Botón oculto si vencida | Fecha vencimiento pasó | Visualiza detalle | Botón de editar no visible |
| 4 | Abrir formulario de edición | Acudiente hace clic en editar | Abre formulario | Formulario pre-cargado con descripción y archivos actuales |
| 5 | Mantener archivos anteriores | Acudiente no modifica archivos | Guarda | Los archivos originales se mantienen |
| 6 | Reemplazar archivos | Acudiente elimina y agrega nuevos | Guarda | Nuevos archivos reemplazan a los anteriores |
| 7 | Confirmación antes de guardar | Acudiente hace clic en guardar | Sistema muestra | MaterialAlertDialog "¿Guardar cambios en tu entrega?" |
| 8 | Guardado exitoso | Acudiente confirma | Sistema procesa | Entrega actualizada, Snackbar "✏️ Entrega actualizada" |
| 9 | Auditoría de edición | Entrega editada | Backend registra | Registra fecha de modificación y versión |

---

#### HU-34: Ver tareas en modo offline

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-34 |
| **Épica Relacionada** | EP-08 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Consultar las tareas asignadas aunque no tenga conexión a internet |
| **Razón / Resultado** | Para revisar mis tareas pendientes sin necesidad de estar conectado |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Caché en SQLite | Acudiente sincroniza con internet | Sistema almacena | Tareas guardadas en tablas locales Room (asignaciones_local) |
| 2 | Cargar desde caché | Acudiente abre app sin internet | Sistema detecta | Carga tareas desde SQLite, muestra lista |
| 3 | Banner de modo offline | Sin conexión | Visualiza superior | Banner "⚠️ Sin conexión - Modo offline" |
| 4 | Ver detalles offline | Acudiente hace clic en tarea | Navega a detalle | Muestra información desde caché local |
| 5 | Indicador de antigüedad | Datos cacheados hace tiempo | Visualiza banner | "Última sincronización: hace 2 días" |
| 6 | Alerta de datos antiguos | Caché > 24 horas | Visualiza alerta | Banner amarillo "Los datos pueden estar desactualizados" |
| 7 | Sincronizar al conectar | Acudiente recupera internet | Sistema detecta | Sincronización automática, actualiza caché |
| 8 | Solo período activo | Sincronización completa | Sistema almacena | Solo guarda tareas del período académico activo |

---

### 📌 ÉPICA EP-09: Visualización de Calificaciones y Retroalimentación

---

#### HU-35: Ver calificación de una tarea

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-35 |
| **Épica Relacionada** | EP-09 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Consultar la calificación y retroalimentación del docente para una tarea entregada |
| **Razón / Resultado** | Para conocer cómo fue evaluado mi trabajo y las observaciones del docente |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Indicador de calificada | Tarea tiene calificación | Visualiza lista | Badge "Calificada" con ícono ✅ en la card |
| 2 | Card de calificación | Acudiente ve detalle de tarea calificada | Visualiza inferior | Card con información de calificación |
| 3 | Nota numérica | Visualiza card calificación | Muestra nota | Formato "4.5/5.0" grande y destacado |
| 4 | Escala cualitativa | Visualiza card calificación | Muestra escala | Bajo (1.0-2.9), Medio (3.0-3.9), Alto (4.0-5.0) |
| 5 | Indicador visual de escala | Según escala | Visualiza color | 🟢 Verde (Alto), 🔵 Azul (Medio), 🟡 Amarillo (Bajo) |
| 6 | Nota cualitativa | Docente agregó nota | Visualiza campo | "Sobresaliente", "Aceptable", "Insuficiente" |
| 7 | Retroalimentación | Docente escribió comentarios | Visualiza sección | Texto completo de retroalimentación |
| 8 | Sin comentarios | Docente no escribió nada | Visualiza sección | Texto "Sin comentarios del docente" |
| 9 | Calificado por | Información de calificador | Visualiza inferior | "Calificado por: Prof. María García" |
| 10 | Fecha de calificación | Información temporal | Visualiza inferior | "Calificado el: 15/01/2026" |
| 11 | Animación de entrada | Card de calificación se muestra | Visualiza | Animación de fade-in y slide-up |

---

#### HU-36: Ver historial de entregas por período

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-36 |
| **Épica Relacionada** | EP-09 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Consultar todas las entregas realizadas agrupadas por período académico |
| **Razón / Resultado** | Para revisar mi desempeño histórico y las tareas completadas en períodos anteriores |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso a historial | Acudiente está en MainActivity | Hace clic en "Historial" | Navega a HistorialActivity |
| 2 | Selector de período | Acudiente ve historial | Visualiza superior | Spinner con períodos: "Período 1 - 2026", "Período 2 - 2025", etc. |
| 3 | Lista de entregas | Período seleccionado | Carga lista | RecyclerView con todas las entregas del período |
| 4 | Información de cada entrega | Visualiza lista | Muestra cards | Título tarea, fecha entrega, estado (Enviada/Calificada), miniatura si tiene foto |
| 5 | Ordenamiento | Lista cargada | Automático | Ordenadas por fecha de entrega (más recientes primero) |
| 6 | Diferencia visual por estado | Entregas mezcladas | Visualiza cards | "Enviada" (pendiente de calificar) vs "Calificada" (con nota) |
| 7 | Ver detalle de entrega | Acudiente hace clic en entrega | Navega a detalle | Muestra evidencia enviada y calificación (si existe) |
| 8 | Descargar archivos | Entrega tiene archivos | Hace clic en archivo | Descarga el archivo adjunto |
| 9 | Estado vacío | No hay entregas en período | Visualiza pantalla | "Sin entregas en este período" con ilustración |
| 10 | Resumen estadístico | Lista cargada | Visualiza inferior | Card con: "Completadas: 8/10 tareas" + "Promedio: 4.3 (Alto)" |

---

#### HU-37: Ver estadísticas de desempeño

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-37 |
| **Épica Relacionada** | EP-09 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Visualizar resumen de cumplimiento y promedio de calificaciones del período |
| **Razón / Resultado** | Para entender el desempeño general de mi hijo en Cátedra de Familia |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Card de resumen en historial | Acudiente ve historial | Visualiza inferior | Card consolidada con estadísticas |
| 2 | Total de tareas | Estadísticas calculadas | Visualiza dato | "Total asignadas: 10 tareas" |
| 3 | Tareas completadas | Estadísticas calculadas | Visualiza dato | "Completadas: 8 tareas (80%)" |
| 4 | Promedio de calificación | Estadísticas calculadas | Visualiza dato | "Promedio: 4.3" |
| 5 | Escala del promedio | Promedio calculado | Visualiza escala | Texto "(Alto)" o "(Medio)" según rango |
| 6 | Barra de progreso visual | Porcentaje de cumplimiento | Visualiza barra | ProgressBar mostrando 80% completado |
| 7 | Comparación entre períodos | Acudiente cambia período | Visualiza datos | Estadísticas actualizadas para cada período |

---

### 📌 ÉPICA EP-10: Notificaciones Push y Soporte Técnico

---

#### HU-38: Recibir notificaciones push de tareas

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-38 |
| **Épica Relacionada** | EP-10 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Recibir alertas automáticas sobre nuevas tareas, calificaciones y recordatorios de vencimiento |
| **Razón / Resultado** | Para estar informado de las actividades escolares sin necesidad de abrir la app constantemente |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Registro de FCM token | Acudiente hace login | Sistema registra | Token FCM guardado en tabla usuarios |
| 2 | Notificación de nueva tarea | Docente asigna tarea | Sistema envía | Push: "🆕 Nueva tarea: [Título]" con descripción breve |
| 3 | Notificación de calificación | Docente califica entrega | Sistema envía | Push: "📝 Tarea calificada: [Título] - Nota: 4.5" |
| 4 | Recordatorio de vencimiento | Quedan 3 días para vencer | Sistema envía | Push: "⏰ Recuerda: [Título] vence en 3 días" |
| 5 | Notificación de tarea vencida | Tarea vence sin entregar | Sistema envía | Push: "⚠️ Tarea vencida: [Título] no fue entregada" |
| 6 | Mostrar en barra de estado | Notificación recibida | Android muestra | Notificación con ícono de app, título, mensaje, sonido |
| 7 | Badge en ícono | Notificaciones sin leer | Android muestra | Número en ícono de app indicando cantidad |
| 8 | Navegar al tocar | Acudiente toca notificación | App abre | Navega directamente al contenido relacionado |
| 9 | Almacenar localmente | Notificación recibida | Sistema guarda | Guardada en SQLite para centro de notificaciones |

---

#### HU-39: Gestionar centro de notificaciones

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-39 |
| **Épica Relacionada** | EP-10 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Ver historial de notificaciones recibidas, marcar como leídas y acceder al contenido relacionado |
| **Razón / Resultado** | Para revisar notificaciones que pude haber perdido y mantener organizado mi centro de alertas |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso al centro | Acudiente está en MainActivity | Hace clic en ícono de campana | Navega a NotificacionesActivity |
| 2 | Badge en ícono | Hay notificaciones sin leer | Visualiza MainActivity | Número sobre ícono de campana |
| 3 | Sección no leídas | Acudiente ve centro | Visualiza superior | Sección "No leídas" con fondo resaltado |
| 4 | Sección anteriores | Acudiente ve centro | Visualiza inferior | Sección "Anteriores" con estilo atenuado |
| 5 | Ordenamiento | Lista cargada | Automático | Ordenadas por fecha (más recientes primero) |
| 6 | Marcar como leída | Acudiente toca notificación | Sistema marca | leido_en = ahora, navega al contenido |
| 7 | Marcar todas como leídas | Acudiente quiere limpiar | Hace clic en botón | Todas las notificaciones marcadas como leídas |
| 8 | Actualizar badge | Notificación leída | Sistema actualiza | Badge en MainActivity se actualiza |
| 9 | Límite de historial | Muchas notificaciones | Sistema limita | Máximo 50 notificaciones almacenadas |
| 10 | Pull to refresh | Acudiente arrastra abajo | Actualiza lista | Sincroniza con servidor |
| 11 | Estado vacío | No hay notificaciones | Visualiza pantalla | "No tienes notificaciones" con ilustración |

---

#### HU-40: Configurar preferencias de notificaciones

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-40 |
| **Épica Relacionada** | EP-10 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Activar o desactivar tipos específicos de notificaciones según mis preferencias |
| **Razón / Resultado** | Para recibir solo las alertas que me interesan y evitar interrupciones innecesarias |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso a configuración | Acudiente está en menú | Hace clic en "Configuración" | Navega a ConfiguracionActivity |
| 2 | Sección de notificaciones | Acudiente ve configuración | Visualiza sección | Lista de tipos con switch on/off |
| 3 | Toggle nuevas tareas | Acudiente modifica | Cambia switch | Activa/desactiva notificaciones de tareas nuevas |
| 4 | Toggle calificaciones | Acudiente modifica | Cambia switch | Activa/desactiva notificaciones de calificaciones |
| 5 | Toggle recordatorios | Acudiente modifica | Cambia switch | Activa/desactiva recordatorios de vencimiento |
| 6 | Persistencia | Acudiente modifica preferencias | Sale de pantalla | Preferencias guardadas en SharedPreferences |
| 7 | Configuración de canales | Android 8+ | Abre config sistema | Link a configuración de canales de Android |

---

#### HU-41: Consultar preguntas frecuentes (FAQs)

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-41 |
| **Épica Relacionada** | EP-10 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Buscar respuestas a dudas comunes sobre el uso de la aplicación |
| **Razón / Resultado** | Para resolver mis dudas de forma autónoma sin necesidad de contactar soporte |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Acceso a FAQs | Acudiente está en menú | Hace clic en "Ayuda" | Navega a FAQsActivity |
| 2 | Lista de preguntas | Acudiente ve FAQs | Visualiza lista | RecyclerView con preguntas colapsadas |
| 3 | Categorías | Preguntas organizadas | Visualiza secciones | 📱 Cuenta, 📤 Entregas, 📷 Multimedia, 📶 Offline, 📊 Calificaciones |
| 4 | Expandir pregunta | Acudiente toca pregunta | Animación expandir | Pregunta se expande mostrando respuesta completa |
| 5 | Colapsar pregunta | Acudiente toca pregunta abierta | Animación colapsar | Respuesta se oculta, pregunta se colapsa |
| 6 | Indicador visual | Estado de pregunta | Visualiza ícono | ▶️ colapsada, ▼ expandida |
| 7 | Búsqueda | Acudiente quiere buscar | Usa SearchView | Filtra preguntas que contengan el texto buscado |
| 8 | Funcionamiento offline | Sin conexión | Abre FAQs | Contenido cargado desde archivo JSON local |
| 9 | Botón de contacto | Acudiente no encontró respuesta | Visualiza inferior | Botón "¿No resolviste tu duda? Contáctanos" |

---

#### HU-42: Contactar soporte técnico

| Campo | Valor |
|-------|-------|
| **ID Historia** | HU-42 |
| **Épica Relacionada** | EP-10 |
| **Rol** | Acudiente / Padre de Familia |
| **Característica** | Comunicarme con el equipo de soporte por email o WhatsApp para resolver problemas |
| **Razón / Resultado** | Para obtener ayuda personalizada cuando tengo un problema que no puedo resolver solo |

| # | Criterio de Aceptación | Contexto | Evento | Resultado Esperado |
|---|------------------------|----------|--------|-------------------|
| 1 | Opciones de contacto | Acudiente hace clic en contactar | Muestra diálogo | Opciones: 📧 Email, 💬 WhatsApp |
| 2 | Abrir email | Acudiente selecciona Email | Sistema abre | Intent con: parchandojuntos2025@gmail.com, asunto predefinido |
| 3 | Asunto de email | Intent de email | Pre-llenado | "Soporte App Móvil - [Nombre del acudiente]" |
| 4 | Cuerpo de email | Intent de email | Pre-llenado | Plantilla con: versión app, modelo dispositivo, versión Android |
| 5 | Abrir WhatsApp | Acudiente selecciona WhatsApp | Sistema abre | Intent con: +57 310 739 2818, mensaje predefinido |
| 6 | Mensaje WhatsApp | Intent de WhatsApp | Pre-llenado | "Hola, necesito ayuda con la app PARCHANDO JUNTOS..." |
| 7 | Verificar app instalada | Antes de abrir Intent | Sistema verifica | Comprueba que la app de email/WhatsApp esté instalada |
| 8 | App no instalada | Email/WhatsApp no disponible | Muestra diálogo | "No tienes [Email/WhatsApp] instalado. ¿Deseas copiar los datos de contacto?" |
| 9 | Copiar datos | Acudiente confirma copiar | Sistema copia | Copia email/número a clipboard, muestra Toast "Copiado" |
| 10 | Feedback al abrir | App abierta exitosamente | Muestra Toast | "Abriendo [Email/WhatsApp]..." |

---

## RESUMEN DE HISTORIAS DE USUARIO

### Plataforma Web Administrativa

| ID | Historia | Épica | Rol Principal | Prioridad |
|----|----------|-------|---------------|-----------|
| HU-01 | Registrar institución educativa | EP-01 | Admin General | Crítica |
| HU-02 | Completar información institucional | EP-01 | Admin General | Media |
| HU-03 | Registrar rector | EP-02 | Admin General | Crítica |
| HU-04 | Registrar coordinador | EP-02 | Admin General | Crítica |
| HU-05 | Iniciar sesión web | EP-02 | Todos | Crítica |
| HU-06 | Cambiar contraseña primer ingreso | EP-02 | Todos | Alta |
| HU-07 | Cerrar sesión | EP-02 | Todos | Media |
| HU-08 | Registrar cursos y grados | EP-03 | Rector, Coordinador | Alta |
| HU-09 | Registrar orientadores | EP-03 | Rector, Coordinador | Alta |
| HU-10 | Registrar docentes | EP-03 | Rector, Coordinador | Alta |
| HU-11 | Registrar estudiante individual | EP-04 | Coordinador Académico | Alta |
| HU-12 | Registrar acudiente individual | EP-04 | Coordinador Académico | Alta |
| HU-13 | Vincular estudiante-acudiente | EP-04 | Coordinador Académico | Alta |
| HU-14 | Carga masiva Excel | EP-04 | Coordinador Académico | Crítica |
| HU-15 | Gestionar estudiantes | EP-04 | Coordinador Académico | Media |
| HU-16 | Crear tarea en banco | EP-05 | Orientador, Docente | Alta |
| HU-17 | Asignar tarea a cursos | EP-05 | Orientador, Docente | Alta |
| HU-18 | Asignar tarea individual | EP-05 | Orientador, Docente | Media |
| HU-19 | Ver entregas pendientes | EP-06 | Docente, Orientador | Alta |
| HU-20 | Revisar y calificar entrega | EP-06 | Docente, Orientador | Crítica |
| HU-21 | Generar reportes | EP-06 | Docente, Coordinador | Media |

### Aplicación Móvil Android

| ID | Historia | Épica | Rol | Prioridad |
|----|----------|-------|-----|-----------|
| HU-22 | Iniciar sesión móvil | EP-07 | Acudiente | Crítica |
| HU-23 | Ver onboarding | EP-07 | Acudiente | Media |
| HU-24 | Cambiar contraseña obligatoria | EP-07 | Acudiente | Crítica |
| HU-25 | Recuperar contraseña | EP-07 | Acudiente | Media |
| HU-26 | Cambiar entre hijos | EP-07 | Acudiente | Media |
| HU-27 | Ver perfil estudiante | EP-07 | Acudiente | Baja |
| HU-28 | Ver lista de tareas | EP-08 | Acudiente | Crítica |
| HU-29 | Filtrar tareas | EP-08 | Acudiente | Media |
| HU-30 | Ver detalle de tarea | EP-08 | Acudiente | Crítica |
| HU-31 | Enviar evidencia | EP-08 | Acudiente | Crítica |
| HU-32 | Enviar offline | EP-08 | Acudiente | Alta |
| HU-33 | Editar entrega | EP-08 | Acudiente | Media |
| HU-34 | Ver tareas offline | EP-08 | Acudiente | Alta |
| HU-35 | Ver calificación | EP-09 | Acudiente | Alta |
| HU-36 | Ver historial entregas | EP-09 | Acudiente | Media |
| HU-37 | Ver estadísticas | EP-09 | Acudiente | Baja |
| HU-38 | Recibir notificaciones push | EP-10 | Acudiente | Alta |
| HU-39 | Gestionar notificaciones | EP-10 | Acudiente | Media |
| HU-40 | Configurar preferencias | EP-10 | Acudiente | Baja |
| HU-41 | Consultar FAQs | EP-10 | Acudiente | Baja |
| HU-42 | Contactar soporte | EP-10 | Acudiente | Baja |

---

## TRAZABILIDAD ÉPICAS → HISTORIAS

| Épica | Historias de Usuario |
|-------|----------------------|
| **EP-01** | HU-01, HU-02 |
| **EP-02** | HU-03, HU-04, HU-05, HU-06, HU-07 |
| **EP-03** | HU-08, HU-09, HU-10 |
| **EP-04** | HU-11, HU-12, HU-13, HU-14, HU-15 |
| **EP-05** | HU-16, HU-17, HU-18 |
| **EP-06** | HU-19, HU-20, HU-21 |
| **EP-07** | HU-22, HU-23, HU-24, HU-25, HU-26, HU-27 |
| **EP-08** | HU-28, HU-29, HU-30, HU-31, HU-32, HU-33, HU-34 |
| **EP-09** | HU-35, HU-36, HU-37 |
| **EP-10** | HU-38, HU-39, HU-40, HU-41, HU-42 |

---

## ESTADÍSTICAS

| Categoría | Cantidad |
|-----------|----------|
| **Total Historias Web** | 21 |
| **Total Historias Móvil** | 21 |
| **Total Historias** | 42 |
| **Prioridad Crítica** | 11 |
| **Prioridad Alta** | 15 |
| **Prioridad Media** | 11 |
| **Prioridad Baja** | 5 |
| **Total Escenarios de Aceptación** | 380+ |

---

**Documento generado:** 17 de Enero de 2026  
**Versión:** 1.0  
**Basado en:** Épicas EP-01 a EP-10  
**Próximo paso:** Estimación de puntos de historia y planificación de sprints
