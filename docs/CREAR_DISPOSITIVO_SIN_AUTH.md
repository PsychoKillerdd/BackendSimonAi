# 📱 Crear Dispositivo - Sin Autenticación

## ✅ Endpoint Público

**Endpoint:** `POST /api/dispositivos`

**⚠️ SIN AUTENTICACIÓN** - SimonIA (empresa externa) crea dispositivos antes de venderlos

**Headers:**
```http
Content-Type: application/json
```

**Body:**
```json
{
  "codigo_unico": "SIM-12345",
  "modelo": "Simonia V2",
  "firmware_version": "1.0.0",
  "estado": "activo"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-generado",
    "id_propietario": null,
    "codigo_unico": "SIM-12345",
    "modelo": "Simonia V2",
    "firmware_version": "1.0.0",
    "estado": "activo",
    "fecha_registro": "2025-11-24T10:30:00.000Z"
  },
  "message": "Dispositivo creado. Use PATCH para asignar a una empresa."
}
```

## 🔒 Endpoints que SÍ requieren autenticación (admin):

- `PATCH /api/dispositivos/:id/asignar` - Asignar a empresa
- `GET /api/dispositivos/sin-asignar/lista` - Ver inventario
- `PATCH /api/dispositivos/:id/estado` - Cambiar estado

## 🧪 Prueba sin token:

```bash
curl -X POST https://simon-backend-mvp-1.onrender.com/api/dispositivos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_unico": "SIM-999",
    "modelo": "Simonia V2",
    "firmware_version": "1.0.0"
  }'
```

## 🔄 Flujo completo:

1. **SimonIA crea dispositivo** (sin auth) → inventario
2. **Admin asigna a empresa** (con auth admin) → venta/arriendo
3. **Empresa ve sus dispositivos** (con auth empresa)
