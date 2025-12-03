# 🔍 Guía de Debugging - Lecturas IoT SimonIA

## Problema: "Estoy enviando datos pero no se procesan"

### 🧪 Paso 1: Verificar Conectividad Básica

Primero verifica que el servidor esté alcanzable y procesando peticiones.

**Endpoint de prueba:**
```bash
curl -X POST https://tu-api.com/api/test/echo \
  -H "Content-Type: application/json" \
  -d '{
    "test": "hola desde dispositivo",
    "timestamp": "2025-12-03T10:30:00"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Servidor recibió tu petición correctamente",
  "timestamp": "2025-12-03T10:30:15.123Z",
  "recibido": {
    "headers": {
      "content-type": "application/json",
      "user-agent": "curl/7.68.0"
    },
    "body": {
      "test": "hola desde dispositivo",
      "timestamp": "2025-12-03T10:30:00"
    },
    "method": "POST",
    "path": "/api/test/echo"
  }
}
```

✅ **Si funciona:** El servidor está online y recibiendo peticiones.  
❌ **Si falla:** Problema de red, URL incorrecta, o servidor caído.

---

### 📊 Paso 2: Probar Endpoint Real de Lecturas

**Endpoint:** `POST /api/lecturas/sensor`

**Prueba mínima (solo campo requerido):**
```bash
curl -X POST https://tu-api.com/api/lecturas/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_dispositivo": "SIM-DEV-001"
  }'
```

**Posibles respuestas y qué significan:**

#### ✅ Caso 1: Falta datos de sensores
```json
{
  "success": false,
  "error": "Debe enviar al menos un valor de sensor"
}
```
**Solución:** Agregar al menos un campo de sensor:
```bash
curl -X POST https://tu-api.com/api/lecturas/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_dispositivo": "SIM-DEV-001",
    "temperatura_c": 25.5
  }'
```

#### ❌ Caso 2: Dispositivo no existe
```json
{
  "success": false,
  "error": "Dispositivo no encontrado",
  "codigo_dispositivo": "SIM-DEV-001",
  "timestamp": "3/12/2025 10:30:15"
}
```
**Log en servidor:**
```
❌ [3/12/2025 10:30:15] ERROR AL PROCESAR LECTURA
   Tipo error: Error
   Mensaje: Dispositivo no encontrado
   Body enviado: { codigo_dispositivo: 'SIM-DEV-001', ... }
   ⚠️  CAUSA: El código "SIM-DEV-001" no existe en BD
   💡 SOLUCIÓN: Verificar que el dispositivo esté creado en /api/dispositivos
```

**Solución:** Crear el dispositivo primero:
```bash
curl -X POST https://tu-api.com/api/dispositivos \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_unico": "SIM-DEV-001",
    "modelo": "SimonIA Sensor v2",
    "estado": "activo"
  }'
```

#### ❌ Caso 3: Dispositivo sin colmena
```json
{
  "success": false,
  "error": "El dispositivo no está asignado a ninguna colmena",
  "codigo_dispositivo": "SIM-DEV-001",
  "timestamp": "3/12/2025 10:30:15"
}
```
**Log en servidor:**
```
❌ [3/12/2025 10:30:15] ERROR AL PROCESAR LECTURA
   ⚠️  CAUSA: El dispositivo existe pero no tiene colmena asignada
   💡 SOLUCIÓN: Asignar dispositivo a una colmena primero
```

**Solución:** El dispositivo debe estar asignado a una colmena. Esto se hace al crear la colmena:
```bash
# Primero obtén el ID del dispositivo
curl https://tu-api.com/api/dispositivos/codigo/SIM-DEV-001

# Luego crea una colmena con ese dispositivo
curl -X POST https://tu-api.com/api/apiarios/{apiarioId}/colmenas \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_colmena": "Colmena A1",
    "tipo_colmena": "Langstroth",
    "id_dispositivo": "uuid-del-dispositivo"
  }'
```

#### ❌ Caso 4: Falta campo requerido
```json
{
  "success": false,
  "error": "Campo requerido: codigo_dispositivo",
  "recibido": {
    "temperatura": 25.5
  }
}
```
**Log en servidor:**
```
❌ [3/12/2025 10:30:15] RECHAZADO: Falta campo codigo_dispositivo
   Body recibido completo: { temperatura: 25.5 }
```

**Causa común:** El campo se llama **`codigo_dispositivo`**, no `codigo`, `device_id`, `id_dispositivo`, etc.

**Solución:** Usar nombre correcto:
```json
{
  "codigo_dispositivo": "SIM-DEV-001",  // ✅ Correcto
  "temperatura_c": 25.5
}
```

#### ✅ Caso 5: Éxito
```json
{
  "success": true,
  "data": {
    "lectura": {
      "id": "uuid-lectura",
      "id_colmena": "uuid-colmena",
      "temperatura_c": 25.5,
      "humedad_h": 65.2,
      "peso_kg": 45.3,
      "fecha_registro": "2025-12-03T10:30:15.000Z",
      "hora_registro": "10:30:15"
    },
    "colmena": {
      "id": "uuid-colmena",
      "nombre_colmena": "Colmena A1"
    },
    "dispositivo": {
      "id": "uuid-dispositivo",
      "codigo_unico": "SIM-DEV-001"
    }
  }
}
```
**Log en servidor:**
```
✅ [3/12/2025 10:30:15] LECTURA REGISTRADA EXITOSAMENTE
   📱 Dispositivo: SIM-DEV-001
   🐝 Colmena: Colmena A1
   📊 Datos: {"codigo_dispositivo":"SIM-DEV-001","temperatura_c":25.5,...}
   🕐 Hora registro: 10:30:15
```

---

### 📝 Logs Disponibles en el Servidor

Con la nueva implementación, **cada petición genera logs detallados** visibles en:
- **Desarrollo:** Terminal donde corre `bun run dev`
- **Producción (Render):** Dashboard → Logs

#### Estructura de logs:

**1. Petición recibida:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 [3/12/2025 10:30:15] PETICIÓN RECIBIDA: POST /api/lecturas/sensor
📦 Headers: {
  "content-type": "application/json",
  "user-agent": "ESP32-HTTP-Client/1.0",
  "origin": null
}
📦 Body recibido: {
  "codigo_dispositivo": "SIM-DEV-001",
  "temperatura_c": 25.5,
  "humedad_h": 65.2
}
📦 IP origen: 192.168.1.100
```

**2. Validación:**
```
⏳ [3/12/2025 10:30:15] PROCESANDO: Buscando dispositivo "SIM-DEV-001"...
```

**3. Resultado:**
```
✅ [3/12/2025 10:30:15] LECTURA REGISTRADA EXITOSAMENTE
   📱 Dispositivo: SIM-DEV-001
   🐝 Colmena: Colmena A1
   📊 Datos: {...}
   🕐 Hora registro: 10:30:15
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

O en caso de error:
```
❌ [3/12/2025 10:30:15] ERROR AL PROCESAR LECTURA
   Tipo error: Error
   Mensaje: Dispositivo no encontrado
   Body enviado: { codigo_dispositivo: 'SIM-DEV-999', ... }
   ⚠️  CAUSA: El código "SIM-DEV-999" no existe en BD
   💡 SOLUCIÓN: Verificar que el dispositivo esté creado en /api/dispositivos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 🔧 Checklist de Debugging

Cuando tu compañero dice "estoy enviando datos pero no se reciben":

- [ ] **1. Verificar URL**
  - ¿Está usando la URL correcta? (https://tu-api.com/api/lecturas/sensor)
  - ¿Tiene el protocolo correcto? (https://, no http://)
  
- [ ] **2. Verificar método HTTP**
  - Debe ser **POST**, no GET
  
- [ ] **3. Verificar headers**
  - Debe incluir: `Content-Type: application/json`
  
- [ ] **4. Verificar estructura del body**
  - Campo requerido: `codigo_dispositivo` (no `codigo`, `device_id`, etc.)
  - Nombres correctos: `temperatura_c`, `humedad_h`, `peso_kg`, `sonido_hz`, `presion_hpa`
  - Al menos un valor de sensor debe estar presente
  
- [ ] **5. Verificar que el dispositivo existe**
  ```bash
  curl https://tu-api.com/api/dispositivos/codigo/SIM-DEV-001
  ```
  
- [ ] **6. Verificar que el dispositivo tiene colmena asignada**
  - El dispositivo debe haberse usado al crear una colmena
  - Si no tiene colmena, crear una que lo referencie
  
- [ ] **7. Revisar logs del servidor**
  - En Render: Dashboard → Logs
  - En local: Terminal
  - Buscar líneas que contengan el `codigo_dispositivo` enviado

---

### 🧪 Script de Prueba Completo

Guarda esto como `test-lectura.sh` y ejecútalo:

```bash
#!/bin/bash

API_URL="https://tu-api.com"
CODIGO_DISPOSITIVO="SIM-DEV-001"

echo "🧪 Iniciando pruebas de lectura IoT..."
echo ""

# Prueba 1: Endpoint de echo
echo "1️⃣ Probando conectividad básica..."
curl -X POST "$API_URL/api/test/echo" \
  -H "Content-Type: application/json" \
  -d '{"test":"conectividad"}' \
  -w "\nStatus: %{http_code}\n\n"

# Prueba 2: Verificar si dispositivo existe
echo "2️⃣ Verificando si dispositivo existe..."
curl -X GET "$API_URL/api/dispositivos/codigo/$CODIGO_DISPOSITIVO" \
  -w "\nStatus: %{http_code}\n\n"

# Prueba 3: Enviar lectura
echo "3️⃣ Enviando lectura de sensor..."
curl -X POST "$API_URL/api/lecturas/sensor" \
  -H "Content-Type: application/json" \
  -d "{
    \"codigo_dispositivo\": \"$CODIGO_DISPOSITIVO\",
    \"temperatura_c\": 25.5,
    \"humedad_h\": 65.2,
    \"peso_kg\": 45.3,
    \"sonido_hz\": 120.5,
    \"presion_hpa\": 1013.2
  }" \
  -w "\nStatus: %{http_code}\n\n"

echo "✅ Pruebas completadas. Revisa los logs del servidor."
```

---

### 📱 Código de Ejemplo para ESP32/Arduino

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* API_URL = "https://tu-api.com/api/lecturas/sensor";
const char* CODIGO_DISPOSITIVO = "SIM-DEV-001";

void enviarLectura(float temperatura, float humedad, float peso) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    // Configurar petición
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    
    // Crear JSON
    StaticJsonDocument<256> doc;
    doc["codigo_dispositivo"] = CODIGO_DISPOSITIVO;
    doc["temperatura_c"] = temperatura;
    doc["humedad_h"] = humedad;
    doc["peso_kg"] = peso;
    
    String json;
    serializeJson(doc, json);
    
    // Enviar
    Serial.println("📤 Enviando lectura...");
    Serial.println(json);
    
    int httpCode = http.POST(json);
    
    if (httpCode > 0) {
      String response = http.getString();
      Serial.printf("✅ Respuesta [%d]: %s\n", httpCode, response.c_str());
    } else {
      Serial.printf("❌ Error enviando: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
  } else {
    Serial.println("❌ WiFi desconectado");
  }
}
```

---

### 🎯 Resumen de Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Campo requerido: codigo_dispositivo` | Falta el campo o tiene nombre incorrecto | Usar `codigo_dispositivo` exactamente |
| `Dispositivo no encontrado` | El código no existe en BD | Crear dispositivo con `POST /api/dispositivos` |
| `El dispositivo no está asignado a ninguna colmena` | Dispositivo existe pero sin colmena | Crear colmena con `id_dispositivo` |
| `Debe enviar al menos un valor de sensor` | Solo se envió `codigo_dispositivo` | Agregar al menos un campo: `temperatura_c`, etc. |
| `Cannot POST /api/lecturas/sensor` | URL incorrecta o método HTTP incorrecto | Verificar URL completa y método POST |
| Sin respuesta/timeout | Problema de red o servidor caído | Probar endpoint `/health` primero |

---

**Última actualización:** 3 de diciembre de 2025  
**Versión:** 1.0.0
