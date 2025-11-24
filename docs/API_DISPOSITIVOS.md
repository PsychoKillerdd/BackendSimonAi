# API de Gestión de Dispositivos SimonIA

## Descripción General

API REST para la gestión de dispositivos IoT de SimonIA. **Todos los endpoints son públicos** (sin autenticación) ya que SimonIA es una empresa externa que manufactura y vende/arrienda dispositivos a empresas clientes.

## Flujo de Trabajo

1. **SimonIA crea dispositivos** → Sin propietario (inventario)
2. **SimonIA asigna dispositivo a empresa** → Después de venta/arriendo
3. **Empresa consulta sus dispositivos** → Para gestión operativa
4. **IoT device envía lecturas** → Usando código único del dispositivo

---

## Endpoints

### 1. Crear Dispositivo (Inventario SimonIA)

Crea un nuevo dispositivo **SIN propietario**. El dispositivo queda en inventario de SimonIA hasta ser asignado.

**Endpoint:** `POST /api/dispositivos`

**Autenticación:** ❌ No requiere

**Body:**
```json
{
  "codigo_unico": "SIM-DEV-001",
  "modelo": "SimonIA Sensor v2",
  "firmware_version": "1.2.3",
  "estado": "activo"
}
```

**Campos:**
- `codigo_unico` (string, **requerido**, único): Identificador único del hardware
- `modelo` (string, opcional): Modelo del dispositivo
- `firmware_version` (string, opcional): Versión del firmware instalado
- `estado` (string, opcional): Estado del dispositivo. Valores: `'activo'`, `'inactivo'`, `'mantenimiento'`. Default: `'activo'`

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id_dispositivo": "344a2ad7-852d-4dd0-8686-837224e1aedf",
    "codigo_unico": "SIM-DEV-001",
    "modelo": "SimonIA Sensor v2",
    "firmware_version": "1.2.3",
    "estado": "activo",
    "id_propietario": null,
    "fecha_creacion": "2025-11-24T10:30:00.000Z"
  },
  "message": "Dispositivo creado. Use PATCH para asignar a una empresa."
}
```

**Errores:**
- `400`: Campo `codigo_unico` faltante
- `409`: Código único duplicado
- `500`: Error interno del servidor

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/dispositivos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_unico": "SIM-DEV-001",
    "modelo": "SimonIA Sensor v2",
    "firmware_version": "1.2.3",
    "estado": "activo"
  }'
```

---

### 2. Asignar Dispositivo a Empresa

Asigna un dispositivo del inventario SimonIA a una empresa cliente (después de venta/arriendo).

**Endpoint:** `PATCH /api/dispositivos/:dispositivoId/asignar`

**Autenticación:** ❌ No requiere

**Parámetros URL:**
- `dispositivoId` (uuid, requerido): ID del dispositivo a asignar

**Body:**
```json
{
  "id_empresa": "dc3af024-75ca-4c92-b843-e034b29c22ec"
}
```

**Campos:**
- `id_empresa` (uuid, **requerido**): ID de la empresa cliente

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_dispositivo": "344a2ad7-852d-4dd0-8686-837224e1aedf",
    "codigo_unico": "SIM-DEV-001",
    "modelo": "SimonIA Sensor v2",
    "firmware_version": "1.2.3",
    "estado": "activo",
    "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec",
    "fecha_creacion": "2025-11-24T10:30:00.000Z"
  },
  "message": "Dispositivo asignado exitosamente"
}
```

**Errores:**
- `400`: Campos requeridos faltantes o dispositivo ya asignado
- `404`: Dispositivo no encontrado
- `500`: Error interno del servidor

**Ejemplo cURL:**
```bash
curl -X PATCH http://localhost:3000/api/dispositivos/344a2ad7-852d-4dd0-8686-837224e1aedf/asignar \
  -H "Content-Type: application/json" \
  -d '{
    "id_empresa": "dc3af024-75ca-4c92-b843-e034b29c22ec"
  }'
```

---

### 3. Listar Inventario SimonIA (Sin Asignar)

Obtiene todos los dispositivos que **NO** están asignados a ninguna empresa (inventario disponible).

**Endpoint:** `GET /api/dispositivos/sin-asignar/lista`

**Autenticación:** ❌ No requiere

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_dispositivo": "344a2ad7-852d-4dd0-8686-837224e1aedf",
      "codigo_unico": "SIM-DEV-001",
      "modelo": "SimonIA Sensor v2",
      "firmware_version": "1.2.3",
      "estado": "activo",
      "id_propietario": null,
      "fecha_creacion": "2025-11-24T10:30:00.000Z"
    },
    {
      "id_dispositivo": "abc123...",
      "codigo_unico": "SIM-DEV-002",
      "modelo": "SimonIA Sensor v2",
      "firmware_version": "1.2.3",
      "estado": "activo",
      "id_propietario": null,
      "fecha_creacion": "2025-11-24T11:00:00.000Z"
    }
  ],
  "count": 2
}
```

**Ejemplo cURL:**
```bash
curl http://localhost:3000/api/dispositivos/sin-asignar/lista
```

---

### 4. Listar Dispositivos de una Empresa

Obtiene todos los dispositivos asignados a una empresa específica.

**Endpoint:** `GET /api/dispositivos/empresa/mis-dispositivos`

**Autenticación:** ❌ No requiere

**Query Parameters:**
- `id_empresa` (uuid, **requerido**): ID de la empresa

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_dispositivo": "344a2ad7-852d-4dd0-8686-837224e1aedf",
      "codigo_unico": "SIM-DEV-001",
      "modelo": "SimonIA Sensor v2",
      "firmware_version": "1.2.3",
      "estado": "activo",
      "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec",
      "fecha_creacion": "2025-11-24T10:30:00.000Z"
    }
  ]
}
```

**Errores:**
- `400`: Query parameter `id_empresa` faltante
- `500`: Error interno del servidor

**Ejemplo cURL:**
```bash
curl "http://localhost:3000/api/dispositivos/empresa/mis-dispositivos?id_empresa=dc3af024-75ca-4c92-b843-e034b29c22ec"
```

---

### 5. Obtener Dispositivo por ID

Obtiene los detalles de un dispositivo específico por su ID.

**Endpoint:** `GET /api/dispositivos/:dispositivoId`

**Autenticación:** ❌ No requiere

**Parámetros URL:**
- `dispositivoId` (uuid, requerido): ID del dispositivo

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_dispositivo": "344a2ad7-852d-4dd0-8686-837224e1aedf",
    "codigo_unico": "SIM-DEV-001",
    "modelo": "SimonIA Sensor v2",
    "firmware_version": "1.2.3",
    "estado": "activo",
    "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec",
    "fecha_creacion": "2025-11-24T10:30:00.000Z"
  }
}
```

**Errores:**
- `400`: `dispositivoId` faltante
- `404`: Dispositivo no encontrado
- `500`: Error interno del servidor

**Ejemplo cURL:**
```bash
curl http://localhost:3000/api/dispositivos/344a2ad7-852d-4dd0-8686-837224e1aedf
```

---

### 6. Obtener Dispositivo por Código Único

Obtiene un dispositivo usando su código único de hardware.

**Endpoint:** `GET /api/dispositivos/codigo/:codigo`

**Autenticación:** ❌ No requiere

**Parámetros URL:**
- `codigo` (string, requerido): Código único del dispositivo

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_dispositivo": "344a2ad7-852d-4dd0-8686-837224e1aedf",
    "codigo_unico": "SIM-DEV-001",
    "modelo": "SimonIA Sensor v2",
    "firmware_version": "1.2.3",
    "estado": "activo",
    "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec",
    "fecha_creacion": "2025-11-24T10:30:00.000Z"
  }
}
```

**Errores:**
- `400`: `codigo` faltante
- `404`: Dispositivo no encontrado
- `500`: Error interno del servidor

**Ejemplo cURL:**
```bash
curl http://localhost:3000/api/dispositivos/codigo/SIM-DEV-001
```

---

### 7. Actualizar Estado de Dispositivo

Actualiza el estado operativo de un dispositivo.

**Endpoint:** `PATCH /api/dispositivos/:dispositivoId/estado`

**Autenticación:** ❌ No requiere

**Parámetros URL:**
- `dispositivoId` (uuid, requerido): ID del dispositivo

**Body:**
```json
{
  "estado": "mantenimiento"
}
```

**Campos:**
- `estado` (string, **requerido**): Nuevo estado. Valores: `'activo'`, `'inactivo'`, `'mantenimiento'`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_dispositivo": "344a2ad7-852d-4dd0-8686-837224e1aedf",
    "codigo_unico": "SIM-DEV-001",
    "modelo": "SimonIA Sensor v2",
    "firmware_version": "1.2.3",
    "estado": "mantenimiento",
    "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec",
    "fecha_creacion": "2025-11-24T10:30:00.000Z"
  }
}
```

**Errores:**
- `400`: Campos requeridos faltantes
- `500`: Error interno del servidor

**Ejemplo cURL:**
```bash
curl -X PATCH http://localhost:3000/api/dispositivos/344a2ad7-852d-4dd0-8686-837224e1aedf/estado \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "mantenimiento"
  }'
```

---

### 8. Listar Todos los Dispositivos

Obtiene todos los dispositivos del sistema (asignados y sin asignar).

**Endpoint:** `GET /api/dispositivos`

**Autenticación:** ❌ No requiere

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_dispositivo": "344a2ad7-852d-4dd0-8686-837224e1aedf",
      "codigo_unico": "SIM-DEV-001",
      "modelo": "SimonIA Sensor v2",
      "firmware_version": "1.2.3",
      "estado": "activo",
      "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec",
      "fecha_creacion": "2025-11-24T10:30:00.000Z"
    },
    {
      "id_dispositivo": "abc123...",
      "codigo_unico": "SIM-DEV-002",
      "modelo": "SimonIA Sensor v2",
      "firmware_version": "1.2.3",
      "estado": "activo",
      "id_propietario": null,
      "fecha_creacion": "2025-11-24T11:00:00.000Z"
    }
  ]
}
```

**Ejemplo cURL:**
```bash
curl http://localhost:3000/api/dispositivos
```

---

## Modelos de Datos

### Dispositivo SimonIA

```typescript
{
  id_dispositivo: string;        // UUID - Primary key
  codigo_unico: string;          // Unique - Identificador del hardware
  modelo?: string;               // Modelo del dispositivo
  firmware_version?: string;     // Versión del firmware
  estado: string;                // 'activo' | 'inactivo' | 'mantenimiento'
  id_propietario: string | null; // UUID FK a empresa (null = sin asignar)
  fecha_creacion: Date;          // Timestamp de creación
}
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `201` | Created - Recurso creado exitosamente |
| `400` | Bad Request - Datos inválidos o faltantes |
| `404` | Not Found - Recurso no encontrado |
| `409` | Conflict - Conflicto (ej: código duplicado) |
| `500` | Internal Server Error - Error del servidor |

---

## Ejemplos de Uso Completo

### Flujo: Crear dispositivo → Asignar a empresa

```bash
# 1. SimonIA crea dispositivo en inventario
curl -X POST http://localhost:3000/api/dispositivos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_unico": "SIM-DEV-003",
    "modelo": "SimonIA Pro v3",
    "firmware_version": "2.0.1",
    "estado": "activo"
  }'

# Respuesta: { "data": { "id_dispositivo": "xxx-yyy-zzz", ... } }

# 2. Ver inventario disponible
curl http://localhost:3000/api/dispositivos/sin-asignar/lista

# 3. Asignar dispositivo a empresa cliente
curl -X PATCH http://localhost:3000/api/dispositivos/xxx-yyy-zzz/asignar \
  -H "Content-Type: application/json" \
  -d '{
    "id_empresa": "dc3af024-75ca-4c92-b843-e034b29c22ec"
  }'

# 4. Verificar dispositivos de la empresa
curl "http://localhost:3000/api/dispositivos/empresa/mis-dispositivos?id_empresa=dc3af024-75ca-4c92-b843-e034b29c22ec"
```

---

## Notas Importantes

1. **Sin Autenticación**: Todos los endpoints son públicos porque SimonIA es una empresa externa que manufactura dispositivos.

2. **Método PATCH para Asignación**: El endpoint de asignación usa `PATCH`, no `POST`.

3. **Validaciones**:
   - `codigo_unico` debe ser único en toda la base de datos
   - No se puede reasignar un dispositivo ya asignado (retorna 400)
   - Los UUIDs deben ser válidos

4. **Estados Válidos**: `'activo'`, `'inactivo'`, `'mantenimiento'`

5. **Relaciones**:
   - Un dispositivo puede estar en inventario (`id_propietario = null`)
   - Un dispositivo asignado pertenece a una sola empresa
   - Las colmenas referencian dispositivos asignados
   - Las lecturas de sensores se asocian por `codigo_unico` del dispositivo

---

## Próximas Mejoras Sugeridas

- [ ] Implementar API Key para autenticar a SimonIA (seguridad externa)
- [ ] Endpoint para reasignar dispositivo (cambio de empresa)
- [ ] Historial de asignaciones de dispositivos
- [ ] Filtros avanzados (por estado, modelo, rango de fechas)
- [ ] Paginación para listados grandes
- [ ] Webhook para notificar a empresa cuando se asigna dispositivo

---

**Última actualización:** 24 de noviembre de 2025  
**Versión API:** 1.0.0
