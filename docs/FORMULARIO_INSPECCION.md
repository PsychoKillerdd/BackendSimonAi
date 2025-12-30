# 📋 Documentación: Formulario de Inspección de Colmena

## Endpoint

```
POST /api/inspecciones
```

### Headers Requeridos
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Campos del Formulario

### 🔴 Campos Obligatorios

| Campo | Tipo | Input Type | Descripción |
|-------|------|------------|-------------|
| `colmena_id` | UUID | hidden | ID de la colmena (se obtiene del contexto de la vista) |
| `fecha_inspeccion` | string | date | Formato: `YYYY-MM-DD` |
| `nombre_inspeccion` | string | text | Título de la inspección (ej: "Inspección Rutina Diciembre") |
| `observaciones` | string | textarea | Notas generales del inspector |

### 🟡 Campos Opcionales - Ubicación y Clima

| Campo | Tipo | Input Type | Descripción | Ejemplo |
|-------|------|------------|-------------|---------|
| `apiario_id` | UUID | select/hidden | ID del apiario (si aplica) | UUID |
| `alerta_id` | UUID | hidden | Si la inspección responde a una alerta | UUID |
| `ubicacion_apiario` | string | text | Descripción de ubicación | "Sector Norte, Fundo Las Abejas" |
| `temperatura` | number | number | Temperatura ambiente (°C) | 25 |
| `humedad` | number | number | Humedad ambiente (%) | 60 |
| `velocidad_viento` | number | number | Velocidad del viento (km/h) | 10 |
| `direccion_viento` | string | select | Dirección del viento | "Norte", "Sur", "Este", "Oeste" |
| `cielo` | string | select | Estado del cielo | "Despejado", "Nublado", "Parcial" |

### 🟢 Campos Opcionales - Estado de la Colmena

| Campo | Tipo | Input Type | Opciones Sugeridas |
|-------|------|------------|-------------------|
| `estado_colmena` | string | select | "Bueno", "Regular", "Malo", "Crítico" |
| `poblacion_abejas` | string | select | "Alta", "Media", "Baja", "Muy Baja" |
| `presencia_reina` | string | select | "Confirmada", "No observada", "Ausente" |
| `celdas_reales` | string | select | "No observadas", "Pocas", "Muchas" |
| `postura` | string | select | "Activa y uniforme", "Irregular", "Ausente" |
| `reservas_alimento` | string | select | "Abundantes", "Suficientes", "Escasas", "Sin reservas" |

### 🔵 Campos Opcionales - Comportamiento y Salud

| Campo | Tipo | Input Type | Opciones Sugeridas |
|-------|------|------------|-------------------|
| `comportamiento_abejas` | string | select | "Tranquilas", "Agitadas", "Defensivas" |
| `signos_enfermedad` | string | textarea/select | "Sin signos", "Varroa", "Loque", "Nosema", "Otros" |
| `recomendaciones` | string | textarea | Acciones sugeridas para el futuro |
| `acciones_correctivas` | string | textarea | Acciones tomadas durante la inspección |

---

## Ejemplo de Request Body

```json
{
  "colmena_id": "a2abdf80-4b01-4ef8-a4db-77ff20649d4b",
  "apiario_id": "uuid-del-apiario",
  "fecha_inspeccion": "2025-12-30",
  "nombre_inspeccion": "Inspección de Rutina - Diciembre",
  
  "ubicacion_apiario": "Sector Norte, Fundo Las Abejas",
  "temperatura": "25",
  "humedad": "60",
  "velocidad_viento": "10",
  "direccion_viento": "Norte",
  "cielo": "Despejado",
  
  "estado_colmena": "Bueno",
  "poblacion_abejas": "Alta",
  "presencia_reina": "Confirmada",
  "celdas_reales": "No observadas",
  "postura": "Activa y uniforme",
  "reservas_alimento": "Suficientes",
  
  "comportamiento_abejas": "Tranquilas",
  "signos_enfermedad": "Sin signos visibles",
  
  "observaciones": "Colmena en buen estado general. Población fuerte para la temporada.",
  "recomendaciones": "Revisar en 15 días antes de la cosecha",
  "acciones_correctivas": "Ninguna requerida"
}
```

---

## Respuestas del API

### ✅ Éxito (201 Created)
```json
{
  "success": true,
  "data": {
    "id": "uuid-de-la-inspeccion-creada",
    "colmena_id": "a2abdf80-4b01-4ef8-a4db-77ff20649d4b",
    "fecha_inspeccion": "2025-12-30",
    "nombre_inspeccion": "Inspección de Rutina - Diciembre",
    "observaciones": "Colmena en buen estado...",
    "creado_en": "2025-12-30T13:45:00.000Z"
  }
}
```

### ❌ Error - Campos Faltantes (400 Bad Request)
```json
{
  "success": false,
  "error": "Campos requeridos faltantes: colmena_id, fecha_inspeccion, nombre_inspeccion, observaciones"
}
```

### ❌ Error - No Autorizado (401 Unauthorized)
```json
{
  "success": false,
  "message": "Token no proporcionado o inválido"
}
```

---

## Endpoints Adicionales

### Obtener Inspecciones de una Colmena
```
GET /api/inspecciones/colmena/:colmenaId
Authorization: Bearer <JWT_TOKEN>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "colmena_id": "uuid",
      "fecha_inspeccion": "2025-12-30",
      "nombre_inspeccion": "Inspección Diciembre",
      "observaciones": "...",
      "creado_en": "2025-12-30T13:45:00.000Z"
    }
  ]
}
```

### Obtener Inspección por ID
```
GET /api/inspecciones/:id
Authorization: Bearer <JWT_TOKEN>
```

---

## Sugerencia de UI/UX

1. **Ubicación**: Botón "Nueva Inspección" en la vista de detalle de colmena (`/erp/colmena/:id`)
2. **Modal o Página**: Usar un modal para no perder contexto de la colmena
3. **Secciones del Formulario**:
   - Sección 1: Datos Básicos (fecha, nombre)
   - Sección 2: Condiciones Climáticas
   - Sección 3: Estado de la Colmena
   - Sección 4: Observaciones y Recomendaciones
4. **Validación**: Campos obligatorios marcados con `*`
5. **Fecha por defecto**: Usar la fecha actual como valor inicial

---

## Notas para el Frontend

- El `colmena_id` debe obtenerse de los params de la URL o del estado de la vista
- Los campos numéricos (temperatura, humedad, etc.) se envían como strings al API
- Después de crear una inspección exitosa, refrescar la lista de inspecciones de la colmena
