# API de Alertas - SimonIA

## Descripción General

API REST para gestionar alertas de colmenas. Las alertas se generan automáticamente cuando las lecturas de sensores superan umbrales críticos (temperatura alta/baja, humedad baja, ruido alto, etc.). **Todos los endpoints requieren autenticación JWT**.

---

## 🚨 Endpoints de Alertas

### 1. Obtener Todas las Alertas de una Colmena

Retorna historial completo de alertas de una colmena específica.

**Endpoint:** `GET /api/alertas/colmena/:colmenaId`

**Autenticación:** ✅ Requiere JWT Token

**Parámetros URL:**
- `colmenaId` (uuid, requerido): ID de la colmena

**Query Parameters:**
- `limit` (number, opcional): Número máximo de alertas. Default: 50

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-alerta",
      "descripcion": "Temperatura Alta detectada: 36.5°C",
      "temperatura_c": "36.5",
      "humedad_h": "65.2",
      "peso_kg": "45.3",
      "presion_hpa": "1013.2",
      "sonido_hz": "120.5",
      "fecha_evento": "2025-12-12T10:30:00.000Z",
      "estado": "pendiente",
      "prioridad": "alta",
      "origen_alerta": "automatico",
      "comentario_atencion": null,
      "tipo_alerta": {
        "nombre": "Temperatura Alta",
        "codigo": "TEMP_ALTA",
        "color_hex": "#FF0000"
      }
    },
    {
      "id": "uuid-alerta-2",
      "descripcion": "Humedad Baja detectada: 18%",
      "temperatura_c": "25.5",
      "humedad_h": "18.0",
      "peso_kg": "45.1",
      "presion_hpa": "1012.8",
      "sonido_hz": "115.2",
      "fecha_evento": "2025-12-12T09:15:00.000Z",
      "estado": "resuelta",
      "prioridad": "media",
      "origen_alerta": "automatico",
      "comentario_atencion": "Revisado y corregido sistema de ventilación",
      "tipo_alerta": {
        "nombre": "Humedad Baja",
        "codigo": "HUM_BAJA",
        "color_hex": "#FFA500"
      }
    }
  ],
  "total": 2
}
```

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/alertas/colmena/abc-123-def?limit=50" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 2. Obtener Solo Alertas PENDIENTES de una Colmena

Retorna únicamente las alertas que NO han sido atendidas.

**Endpoint:** `GET /api/alertas/colmena/:colmenaId/pendientes`

**Autenticación:** ✅ Requiere JWT Token

**Parámetros URL:**
- `colmenaId` (uuid, requerido): ID de la colmena

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-alerta",
      "descripcion": "Temperatura Alta detectada: 36.5°C",
      "temperatura_c": "36.5",
      "humedad_h": "65.2",
      "peso_kg": "45.3",
      "presion_hpa": "1013.2",
      "sonido_hz": "120.5",
      "fecha_evento": "2025-12-12T10:30:00.000Z",
      "estado": "pendiente",
      "prioridad": "alta",
      "origen_alerta": "automatico",
      "tipo_alerta": {
        "nombre": "Temperatura Alta",
        "codigo": "TEMP_ALTA",
        "color_hex": "#FF0000"
      }
    }
  ],
  "total": 1
}
```

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/alertas/colmena/abc-123-def/pendientes" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Obtener Todas las Alertas de la Empresa

Retorna alertas de **todas las colmenas** de la empresa del usuario autenticado.

**Endpoint:** `GET /api/alertas/empresa/todas`

**Autenticación:** ✅ Requiere JWT Token

**Query Parameters:**
- `limit` (number, opcional): Número máximo de alertas. Default: 100

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-alerta",
      "descripcion": "Temperatura Alta detectada: 36.5°C",
      "temperatura_c": "36.5",
      "humedad_h": "65.2",
      "peso_kg": "45.3",
      "presion_hpa": "1013.2",
      "sonido_hz": "120.5",
      "fecha_evento": "2025-12-12T10:30:00.000Z",
      "estado": "pendiente",
      "prioridad": "alta",
      "origen_alerta": "automatico",
      "comentario_atencion": null,
      "tipo_alerta": {
        "nombre": "Temperatura Alta",
        "codigo": "TEMP_ALTA",
        "color_hex": "#FF0000"
      },
      "colmena": {
        "id": "uuid-colmena",
        "nombre_colmena": "Colmena A1"
      }
    },
    {
      "id": "uuid-alerta-2",
      "descripcion": "Nivel Ruido Alto detectado: 550Hz",
      "temperatura_c": "28.2",
      "humedad_h": "62.5",
      "peso_kg": "44.8",
      "presion_hpa": "1011.5",
      "sonido_hz": "550.0",
      "fecha_evento": "2025-12-12T08:45:00.000Z",
      "estado": "pendiente",
      "prioridad": "alta",
      "origen_alerta": "automatico",
      "comentario_atencion": null,
      "tipo_alerta": {
        "nombre": "Nivel Ruido Alto",
        "codigo": "SONIDO_ALTO",
        "color_hex": "#800080"
      },
      "colmena": {
        "id": "uuid-colmena-2",
        "nombre_colmena": "Colmena B3"
      }
    }
  ],
  "total": 2
}
```

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/alertas/empresa/todas?limit=100" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Obtener Solo Alertas PENDIENTES de la Empresa

Retorna solo alertas NO atendidas de todas las colmenas.

**Endpoint:** `GET /api/alertas/empresa/pendientes`

**Autenticación:** ✅ Requiere JWT Token

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-alerta",
      "descripcion": "Temperatura Alta detectada: 36.5°C",
      "temperatura_c": "36.5",
      "humedad_h": "65.2",
      "peso_kg": "45.3",
      "presion_hpa": "1013.2",
      "sonido_hz": "120.5",
      "fecha_evento": "2025-12-12T10:30:00.000Z",
      "estado": "pendiente",
      "prioridad": "alta",
      "origen_alerta": "automatico",
      "tipo_alerta": {
        "nombre": "Temperatura Alta",
        "codigo": "TEMP_ALTA",
        "color_hex": "#FF0000"
      },
      "colmena": {
        "id": "uuid-colmena",
        "nombre_colmena": "Colmena A1"
      }
    }
  ],
  "total": 1
}
```

**Uso típico:** Mostrar badge de alertas pendientes en dashboard.

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/alertas/empresa/pendientes" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 5. Obtener Resumen de Alertas (Dashboard)

Retorna estadísticas agregadas de alertas por prioridad y estado.

**Endpoint:** `GET /api/alertas/empresa/resumen`

**Autenticación:** ✅ Requiere JWT Token

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "pendientes": {
      "alta": 3,
      "media": 5,
      "baja": 2,
      "total": 10
    },
    "atendidas": {
      "alta": 12,
      "media": 18,
      "baja": 8,
      "total": 38
    },
    "total_general": 48
  },
  "detalle": [
    { "prioridad": "alta", "estado": "pendiente", "total": "3" },
    { "prioridad": "media", "estado": "pendiente", "total": "5" },
    { "prioridad": "baja", "estado": "pendiente", "total": "2" },
    { "prioridad": "alta", "estado": "atendida", "total": "12" },
    { "prioridad": "media", "estado": "atendida", "total": "18" },
    { "prioridad": "baja", "estado": "atendida", "total": "8" }
  ]
}
```

**Uso típico:** Cards de resumen en dashboard principal.

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/alertas/empresa/resumen" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 6. Obtener Alertas por Rango de Fechas

Filtra alertas por período específico.

**Endpoint:** `GET /api/alertas/empresa/fecha`

**Autenticación:** ✅ Requiere JWT Token

**Query Parameters:**
- `fecha_inicio` (string, **requerido**): Fecha inicio en formato ISO. Ejemplo: `2025-12-01`
- `fecha_fin` (string, **requerido**): Fecha fin en formato ISO. Ejemplo: `2025-12-12`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-alerta",
      "descripcion": "Temperatura Alta detectada: 36.5°C",
      "fecha_evento": "2025-12-10T10:30:00.000Z",
      "estado": "atendida",
      "prioridad": "alta",
      "tipo_alerta": {
        "nombre": "Temperatura Alta",
        "codigo": "TEMP_ALTA",
        "color_hex": "#FF0000"
      },
      "colmena": {
        "id": "uuid-colmena",
        "nombre_colmena": "Colmena A1"
      }
    }
  ],
  "total": 1,
  "periodo": {
    "desde": "2025-12-01",
    "hasta": "2025-12-12"
  }
}
```

**Errores:**
- `400`: Fechas faltantes o formato inválido

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/alertas/empresa/fecha?fecha_inicio=2025-12-01&fecha_fin=2025-12-12" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 7. Marcar Alerta como Atendida

Cambia el estado de una alerta a "atendida" y registra quién la atendió.

**Endpoint:** `PATCH /api/alertas/:alertaId/atender`

**Autenticación:** ✅ Requiere JWT Token

**Parámetros URL:**
- `alertaId` (uuid, requerido): ID de la alerta

**Body (opcional):**
```json
{
  "comentario": "Revisado sistema de ventilación y ajustado temperatura"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-alerta",
    "id_colmena": "uuid-colmena",
    "id_tipo_alerta": "uuid-tipo",
    "descripcion": "Temperatura Alta detectada: 36.5°C",
    "temperatura_c": "36.5",
    "humedad_h": "65.2",
    "peso_kg": "45.3",
    "presion_hpa": "1013.2",
    "sonido_hz": "120.5",
    "fecha_evento": "2025-12-12T10:30:00.000Z",
    "estado": "atendida",
    "prioridad": "alta",
    "origen_alerta": "automatico",
    "atendida_por": "uuid-usuario",
    "comentario_atencion": "Revisado sistema de ventilación y ajustado temperatura"
  },
  "message": "Alerta marcada como atendida"
}
```

**Errores:**
- `400`: `alertaId` faltante
- `404`: Alerta no encontrada

**Ejemplo cURL:**
```bash
curl -X PATCH "https://tu-api.com/api/alertas/abc-123-def/atender" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "comentario": "Revisado y solucionado"
  }'
```

---

## 🎨 Integración con Frontend

### Ejemplo: Dashboard de Alertas (React)

```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'https://tu-api.com/api';
const token = localStorage.getItem('token');

function DashboardAlertas() {
  const [alertasPendientes, setAlertasPendientes] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAlertas();
  }, []);

  async function cargarAlertas() {
    try {
      // Cargar alertas pendientes y resumen en paralelo
      const [pendientesRes, resumenRes] = await Promise.all([
        axios.get(`${API_URL}/alertas/empresa/pendientes`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/alertas/empresa/resumen`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAlertasPendientes(pendientesRes.data.data);
      setResumen(resumenRes.data.data);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function atenderAlerta(alertaId, comentario) {
    try {
      await axios.patch(
        `${API_URL}/alertas/${alertaId}/atender`,
        { comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Recargar alertas
      cargarAlertas();
      alert('Alerta marcada como atendida');
    } catch (error) {
      console.error('Error atendiendo alerta:', error);
      alert('Error al atender alerta');
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="dashboard">
      {/* Cards de resumen */}
      <div className="stats-grid">
        <Card className="border-red-500">
          <h3>Alertas Pendientes</h3>
          <p className="text-3xl font-bold">{resumen.pendientes.total}</p>
          <div className="text-sm mt-2">
            <span className="text-red-600">Alta: {resumen.pendientes.alta}</span> | 
            <span className="text-yellow-600">Media: {resumen.pendientes.media}</span> | 
            <span className="text-gray-600">Baja: {resumen.pendientes.baja}</span>
          </div>
        </Card>
        
        <Card>
          <h3>Alertas Atendidas</h3>
          <p className="text-3xl font-bold">{resumen.atendidas.total}</p>
        </Card>
        
        <Card>
          <h3>Total General</h3>
          <p className="text-3xl font-bold">{resumen.total_general}</p>
        </Card>
      </div>

      {/* Lista de alertas pendientes */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Alertas Pendientes</h2>
        
        {alertasPendientes.length === 0 ? (
          <p>✅ No hay alertas pendientes</p>
        ) : (
          <div className="space-y-4">
            {alertasPendientes.map(alerta => (
              <AlertaCard
                key={alerta.id}
                alerta={alerta}
                onAtender={(comentario) => atenderAlerta(alerta.id, comentario)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AlertaCard({ alerta, onAtender }) {
  const [comentario, setComentario] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  const prioridadColor = {
    alta: 'bg-red-100 border-red-500',
    media: 'bg-yellow-100 border-yellow-500',
    baja: 'bg-gray-100 border-gray-500'
  };

  return (
    <div className={`border-l-4 p-4 rounded ${prioridadColor[alerta.prioridad]}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: alerta.tipo_alerta.color_hex }}
            />
            <h3 className="font-bold">{alerta.tipo_alerta.nombre}</h3>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
              {alerta.prioridad.toUpperCase()}
            </span>
          </div>
          
          <p className="text-gray-700 mt-2">{alerta.descripcion}</p>
          
          <div className="mt-2 text-sm text-gray-600">
            <p>🐝 Colmena: {alerta.colmena.nombre_colmena}</p>
            <p>📅 {new Date(alerta.fecha_evento).toLocaleString('es-CL')}</p>
          </div>
          
          {/* Valores de sensores */}
          <div className="mt-2 text-xs text-gray-500 flex gap-4">
            {alerta.temperatura_c && <span>🌡️ {alerta.temperatura_c}°C</span>}
            {alerta.humedad_h && <span>💧 {alerta.humedad_h}%</span>}
            {alerta.peso_kg && <span>⚖️ {alerta.peso_kg}kg</span>}
            {alerta.sonido_hz && <span>🔊 {alerta.sonido_hz}Hz</span>}
          </div>
        </div>
        
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          ✅ Atender
        </button>
      </div>
      
      {mostrarForm && (
        <div className="mt-4 border-t pt-4">
          <textarea
            className="w-full border rounded p-2"
            placeholder="Comentario (opcional)"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
          />
          <button
            onClick={() => {
              onAtender(comentario);
              setMostrarForm(false);
              setComentario('');
            }}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      {children}
    </div>
  );
}

export default DashboardAlertas;
```

---

### Ejemplo: Widget de Alertas por Colmena

```javascript
// Widget para mostrar alertas pendientes de una colmena específica
async function cargarAlertasColmena(colmenaId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `https://tu-api.com/api/alertas/colmena/${colmenaId}/pendientes`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const { data } = await response.json();
  
  // Mostrar badge si hay alertas
  const badge = document.getElementById('badge-alertas');
  if (data.length > 0) {
    badge.textContent = data.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
  
  // Renderizar lista
  const lista = document.getElementById('lista-alertas');
  lista.innerHTML = data.map(alerta => `
    <div class="alerta ${alerta.prioridad}">
      <span style="background: ${alerta.tipo_alerta.color_hex}"></span>
      <strong>${alerta.tipo_alerta.nombre}</strong>
      <p>${alerta.descripcion}</p>
      <small>${new Date(alerta.fecha_evento).toLocaleString()}</small>
    </div>
  `).join('');
}
```

---

## 📊 Tipos de Alertas Disponibles

| Código | Nombre | Color | Umbral | Prioridad |
|--------|--------|-------|--------|-----------|
| `TEMP_ALTA` | Temperatura Alta | 🔴 #FF0000 | > 35°C | Alta |
| `TEMP_BAJA` | Temperatura Baja | 🔵 #0000FF | < 5°C | Media |
| `HUM_BAJA` | Humedad Baja | 🟠 #FFA500 | < 20% | Media |
| `SONIDO_ALTO` | Nivel Ruido Alto | 🟣 #800080 | > 500Hz | Alta |

---

## 🔔 Estados de Alerta

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Alerta no atendida, requiere acción |
| `resuelta` | Alerta revisada y resuelta por usuario |

---

## 📈 Prioridades

| Prioridad | Descripción |
|-----------|-------------|
| `alta` | Requiere atención inmediata |
| `media` | Revisar pronto |
| `baja` | Informativa |

---

## 📋 Resumen de Endpoints

| Endpoint | Método | Autenticación | Descripción |
|----------|--------|---------------|-------------|
| `/alertas/colmena/:id` | GET | ✅ JWT | Todas las alertas de una colmena |
| `/alertas/colmena/:id/pendientes` | GET | ✅ JWT | Solo pendientes de una colmena |
| `/alertas/empresa/todas` | GET | ✅ JWT | Todas las alertas de la empresa |
| `/alertas/empresa/pendientes` | GET | ✅ JWT | Solo pendientes de la empresa |
| `/alertas/empresa/resumen` | GET | ✅ JWT | Estadísticas agregadas |
| `/alertas/empresa/fecha` | GET | ✅ JWT | Alertas por rango de fechas |
| `/alertas/:id/atender` | PATCH | ✅ JWT | Marcar como resuelta |

---

**Última actualización:** 12 de diciembre de 2025  
**Versión API:** 1.0.0
