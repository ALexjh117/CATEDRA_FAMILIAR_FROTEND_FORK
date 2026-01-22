# 🚨 ENDPOINTS CRÍTICOS - COORDINADOR ACADÉMICO

> **Prioridad**: Alta  
> **Fecha requerida**: ASAP  
> **Autenticación**: JWT (rol: coordinador)

---

## 1. GET /coordinadores/estadisticas

**Dashboard general del coordinador**

```json
{
  "totalCursos": 12,
  "totalDocentes": 15,
  "totalOrientadores": 2,
  "totalEstudiantes": 350,
  "tareasCreadas": 48,
  "tareasCalificadas": 35,
  "tareasPendientes": 13,
  "promedioGeneral": 3.8,
  "cursosConAlerta": 3
}
```

---

## 2. GET /coordinadores/cursos

**Lista de cursos con métricas académicas**

```json
[
  {
    "id": 1,
    "nombre": "5°A",
    "grado": { "id": 5, "nombre": "Quinto" },
    "jornada": "Mañana",
    "docenteTitular": { "id": 10, "nombre": "Juan", "apellido": "Pérez" },
    "orientador": { "id": 5, "nombre": "María", "apellido": "López" },
    "totalEstudiantes": 30,
    "promedioGeneral": 3.9,
    "distribucionRendimiento": {
      "superior": 8,
      "alto": 12,
      "basico": 7,
      "bajo": 3
    },
    "tareasCreadas": 5,
    "entregasRealizadas": 120,
    "entregasPendientes": 30,
    "tieneAlertas": false
  }
]
```

---

## 3. GET /coordinadores/docentes

**Docentes con seguimiento académico**

```json
[
  {
    "id": 10,
    "nombre": "Juan",
    "apellido": "Pérez",
    "correo": "juan.perez@institucion.edu.co",
    "cursosAsignados": 2,
    "cursos": [
      { "id": 1, "nombre": "5°A" },
      { "id": 2, "nombre": "5°B" }
    ],
    "tareasCreadas": 10,
    "tareasCalificadas": 8,
    "tareasPendientesCalificar": 2,
    "tiempoPromedioCalificacion": 3,
    "participacionAcudientes": 75,
    "estadoAcademico": "bien"
  }
]
```

**⚠️ NO incluir**: salarios, contratos, datos sensibles

---

## 4. GET /coordinadores/orientadores

**Orientadores con métricas de acompañamiento**

```json
[
  {
    "id": 5,
    "nombre": "María",
    "apellido": "López",
    "gradosAsignados": [
      { "id": 5, "nombre": "Quinto" },
      { "id": 6, "nombre": "Sexto" }
    ],
    "cursosAcompanados": 6,
    "intervencionesAcademicas": 15,
    "casosAcompanamiento": 8,
    "cursosConAlerta": 2
  }
]
```

**⚠️ Solo conteos**: No incluir detalles de casos individuales

---

## 5. GET /coordinadores/alertas

**Alertas académicas consolidadas**

```json
{
  "alertas": [
    {
      "tipo": "promedio_bajo",
      "nivel": "critico",
      "curso": { "id": 3, "nombre": "6°C" },
      "mensaje": "Promedio general del curso por debajo de 3.0",
      "fecha": "2026-01-22T10:30:00Z"
    },
    {
      "tipo": "entregas_pendientes",
      "nivel": "moderado",
      "curso": { "id": 5, "nombre": "7°A" },
      "mensaje": "Más del 40% de entregas pendientes",
      "fecha": "2026-01-22T09:15:00Z"
    }
  ],
  "resumen": {
    "criticas": 2,
    "moderadas": 5,
    "leves": 8
  }
}
```

**Tipos de alerta**: 
- `promedio_bajo`
- `entregas_pendientes`
- `sin_tareas`
- `sin_calificaciones`

**Niveles**: `critico` | `moderado` | `leve`

---

## 6. GET /coordinadores/cursos/:id/rendimiento

**Detalle de rendimiento de un curso**

```json
{
  "cursoId": 1,
  "promedioGeneral": 3.9,
  "distribucionRangos": {
    "superior": { "cantidad": 8, "porcentaje": 27 },
    "alto": { "cantidad": 12, "porcentaje": 40 },
    "basico": { "cantidad": 7, "porcentaje": 23 },
    "bajo": { "cantidad": 3, "porcentaje": 10 }
  },
  "promediosPorAsignatura": [
    { "asignatura": "Matemáticas", "promedio": 3.8 },
    { "asignatura": "Español", "promedio": 4.1 },
    { "asignatura": "Ciencias", "promedio": 3.7 }
  ],
  "tendencia": "mejorando"
}
```

**Tendencias**: `mejorando` | `estable` | `bajando`

---

## 📌 NOTAS IMPORTANTES

1. **Todos los endpoints requieren JWT** de coordinador
2. **Solo datos académicos**: NO incluir información administrativa (salarios, contratos, sanciones)
3. **Filtrado automático**: El coordinador solo ve datos de SU institución
4. **Rangos académicos**: Superior (4.6-5.0), Alto (4.0-4.5), Básico (3.0-3.9), Bajo (1.0-2.9)

---

## ✅ ENDPOINTS IMPLEMENTADOS Y LISTOS

**Status**: 🟢 Todos los endpoints están funcionando correctamente

### 🔐 CREDENCIALES DE PRUEBA:

```
Correo:      coordinador.test@institucion1.edu.co
Contraseña:  Coord123!
```

### 📡 ENDPOINTS DISPONIBLES:

| Endpoint | Método | Status | Descripción |
|----------|--------|--------|-------------|
| `/coordinadores/login` | POST | ✅ Listo | Autenticación coordinador |
| `/coordinadores/estadisticas` | GET | ✅ Listo | Dashboard general |
| `/coordinadores/cursos` | GET | ✅ Listo | Lista de cursos con métricas |
| `/coordinadores/alertas` | GET | ✅ Listo | Alertas académicas |
| `/coordinadores/docentes` | GET | ✅ Listo | Seguimiento docentes |
| `/coordinadores/orientadores` | GET | ✅ Listo | Métricas orientadores |
| `/coordinadores/cursos/:id/rendimiento` | GET | ✅ Listo | Detalle rendimiento curso |

### 🔑 AUTENTICACIÓN:

Todos los endpoints (excepto login) requieren:
```
Authorization: Bearer {token}
Content-Type: application/json
```

---

## ✅ ESTADO DE INTEGRACIÓN FRONTEND

| Componente | Status | Notas |
|------------|--------|-------|
| Login optimizado | ✅ | Detecta `.edu.co` y va directo a coordinador |
| TypeScript interfaces | ✅ | 7 interfaces para respuestas |
| apiClient methods | ✅ | 6 métodos con error handling |
| endpoints wrappers | ✅ | 6 funciones wrapper |
| DashboardCoordinadorPage | ✅ | Integrado con backend + fallbacks |
| UI coordinador | ✅ | Tema teal/emerald, 4 tabs |
| Acudientes eliminados | ✅ | Solo acceso móvil |

---

## 🚀 PRÓXIMOS PASOS

1. **Probar con credenciales reales** (`coordinador.test@institucion1.edu.co`)
2. **Verificar datos en dashboard** (estadísticas, cursos, alertas)
3. **Validar permisos** (solo ve datos de su institución)
4. **Reportar bugs si los hay** con detalles específicos
