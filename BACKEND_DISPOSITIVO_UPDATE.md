# 📝 Actualización Backend - Endpoint Crear Dispositivo

## Cambio Requerido en `/api/dispositivos` POST

### ❌ Lógica Actual (Problemática)
```typescript
export async function createDispositivoHandler(req: AuthRequest, res: Response) {
  try {
    const { codigo_unico, modelo, firmware_version, estado } = req.body;

    if (!codigo_unico) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: codigo_unico',
      });
    }

    // ❌ PROBLEMA: Siempre toma id_empresa del JWT
    const id_propietario = req.user!.id_empresa;

    const payload: DispositivoInput = {
      codigo_unico,
      id_propietario,
      modelo,
      firmware_version,
      estado,
    };

    const dispositivo = await createDispositivo(payload);

    res.status(201).json({
      success: true,
      data: dispositivo,
    });
  } catch (error: any) {
    console.error('Error creando dispositivo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear dispositivo',
    });
  }
}
```

### ✅ Lógica Nueva (Solución)
```typescript
export async function createDispositivoHandler(req: AuthRequest, res: Response) {
  try {
    const { 
      codigo_unico, 
      modelo, 
      firmware_version, 
      estado,
      id_propietario  // ✅ Nuevo: Aceptar id_propietario del body
    } = req.body;

    if (!codigo_unico) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: codigo_unico',
      });
    }

    // ✅ SOLUCIÓN: Usar id_propietario del body si existe, sino usar JWT
    // Si viene id_propietario en el body, usarlo (permite asignar a SimonIA con id="1")
    // Si NO viene, usar el id_empresa del usuario autenticado (comportamiento anterior)
    const propietario = id_propietario || req.user!.id_empresa;

    const payload: DispositivoInput = {
      codigo_unico,
      id_propietario: propietario,
      modelo,
      firmware_version,
      estado,
    };

    const dispositivo = await createDispositivo(payload);

    res.status(201).json({
      success: true,
      data: dispositivo,
    });
  } catch (error: any) {
    console.error('Error creando dispositivo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear dispositivo',
    });
  }
}
```

## 📋 Comportamiento Esperado

### Caso 1: Dispositivo sin asignar (inventario SimonIA)
**Request:**
```json
POST /api/dispositivos
Authorization: Bearer <token_admin>
{
  "codigo_unico": "SIM-006",
  "modelo": "Simonia V2",
  "firmware_version": "1.0.0",
  "estado": "activo",
  "id_propietario": "1"  // ← Explícitamente id=1 (SimonIA)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-generado",
    "id_propietario": "1",  // ← SimonIA es el propietario
    "codigo_unico": "SIM-006",
    "modelo": "Simonia V2",
    "firmware_version": "1.0.0",
    "estado": "activo",
    "fecha_registro": "2025-11-24T10:30:00.000Z"
  }
}
```

### Caso 2: Dispositivo asignado a empresa cliente
**Request:**
```json
POST /api/dispositivos
Authorization: Bearer <token_admin>
{
  "codigo_unico": "SIM-007",
  "modelo": "Simonia V2",
  "firmware_version": "1.0.0",
  "estado": "activo",
  "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec"  // ← ID de empresa cliente
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-generado",
    "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec",  // ← Empresa cliente
    "codigo_unico": "SIM-007",
    "modelo": "Simonia V2",
    "firmware_version": "1.0.0",
    "estado": "activo",
    "fecha_registro": "2025-11-24T10:30:00.000Z"
  }
}
```

### Caso 3: Sin id_propietario en body (comportamiento legacy)
**Request:**
```json
POST /api/dispositivos
Authorization: Bearer <token_admin>
{
  "codigo_unico": "SIM-008",
  "modelo": "Simonia V2",
  "firmware_version": "1.0.0",
  "estado": "activo"
  // ← NO se envía id_propietario
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-generado",
    "id_propietario": "dc3af024-75ca-4c92-b843-e034b29c22ec",  // ← Toma del JWT (req.user.id_empresa)
    "codigo_unico": "SIM-008",
    "modelo": "Simonia V2",
    "firmware_version": "1.0.0",
    "estado": "activo",
    "fecha_registro": "2025-11-24T10:30:00.000Z"
  }
}
```

## 🔒 Seguridad y Validaciones (Opcional pero Recomendado)

```typescript
export async function createDispositivoHandler(req: AuthRequest, res: Response) {
  try {
    const { 
      codigo_unico, 
      modelo, 
      firmware_version, 
      estado,
      id_propietario
    } = req.body;

    if (!codigo_unico) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: codigo_unico',
      });
    }

    // Usar id_propietario del body si existe, sino usar JWT
    let propietario = id_propietario || req.user!.id_empresa;

    // ⚠️ OPCIONAL: Validar que la empresa existe
    if (id_propietario) {
      const empresaExiste = await verificarEmpresaExiste(id_propietario);
      if (!empresaExiste) {
        return res.status(400).json({
          success: false,
          error: 'La empresa especificada no existe',
        });
      }
    }

    const payload: DispositivoInput = {
      codigo_unico,
      id_propietario: propietario,
      modelo,
      firmware_version,
      estado,
    };

    const dispositivo = await createDispositivo(payload);

    res.status(201).json({
      success: true,
      data: dispositivo,
    });
  } catch (error: any) {
    console.error('Error creando dispositivo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear dispositivo',
    });
  }
}
```

## ✅ Resumen del Cambio

**Línea clave a modificar:**
```typescript
// ❌ Antes
const id_propietario = req.user!.id_empresa;

// ✅ Después
const propietario = id_propietario || req.user!.id_empresa;
```

**Y agregar en destructuring:**
```typescript
// ❌ Antes
const { codigo_unico, modelo, firmware_version, estado } = req.body;

// ✅ Después
const { codigo_unico, modelo, firmware_version, estado, id_propietario } = req.body;
```

Este cambio es **retrocompatible**: si no se envía `id_propietario`, funciona como antes.
