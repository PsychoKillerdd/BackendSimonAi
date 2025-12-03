# API de Lecturas de Sensores y Gráficos - SimonIA

## Descripción General

API para consultar lecturas de sensores IoT de colmenas y obtener datos formateados para gráficos en el frontend. Todos los endpoints de consulta **requieren autenticación JWT**.

---

## 📊 Endpoints para Gráficos

### 1. Historial para Gráficos (Time Series)

Obtiene lecturas históricas ordenadas cronológicamente, ideal para gráficos de líneas/áreas.

**Endpoint:** `GET /api/lecturas/colmena/:colmenaId/graficos`

**Autenticación:** ✅ Requiere JWT Token

**Parámetros URL:**
- `colmenaId` (uuid, requerido): ID de la colmena

**Query Parameters:**
- `dias` (number, opcional): Días hacia atrás. Default: 7. Ejemplos: `7`, `15`, `30`

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
      "fecha_registro": "2025-11-28T10:00:00.000Z",
      "temperatura_c": 25.5,
      "humedad_h": 65.2,
      "peso_kg": 45.3,
      "sonido_hz": 120.5,
      "presion_hpa": 1013.2
    },
    {
      "fecha_registro": "2025-11-28T11:00:00.000Z",
      "temperatura_c": 26.1,
      "humedad_h": 64.8,
      "peso_kg": 45.4,
      "sonido_hz": 118.2,
      "presion_hpa": 1013.5
    }
    // ... más lecturas ordenadas por fecha ascendente
  ],
  "periodo_dias": 7,
  "total_registros": 168
}
```

**Estructura de cada lectura:**
```typescript
{
  fecha_registro: string;      // ISO 8601: "2025-11-28T10:00:00.000Z"
  temperatura_c: number | null; // Grados Celsius
  humedad_h: number | null;     // Porcentaje (0-100)
  peso_kg: number | null;       // Kilogramos
  sonido_hz: number | null;     // Hertz
  presion_hpa: number | null;   // Hectopascales
}
```

**Errores:**
- `400`: `colmenaId` faltante
- `401`: Token inválido o expirado
- `500`: Error interno del servidor

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/lecturas/colmena/abc-123-def/graficos?dias=30" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo JavaScript (fetch):**
```javascript
const token = localStorage.getItem('token');
const colmenaId = 'abc-123-def';

const response = await fetch(
  `https://tu-api.com/api/lecturas/colmena/${colmenaId}/graficos?dias=7`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const { data } = await response.json();

// data = array de lecturas ordenadas cronológicamente
console.log(`Total lecturas: ${data.length}`);
```

---

### 2. Estadísticas Agregadas

Obtiene promedios, máximos y mínimos de los sensores, ideal para cards/resumen.

**Endpoint:** `GET /api/lecturas/colmena/:colmenaId/estadisticas`

**Autenticación:** ✅ Requiere JWT Token

**Parámetros URL:**
- `colmenaId` (uuid, requerido): ID de la colmena

**Query Parameters:**
- `dias` (number, opcional): Días hacia atrás. Default: 7

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "temp_promedio": 24.85,
    "temp_max": 32.1,
    "temp_min": 18.2,
    "humedad_promedio": 63.5,
    "peso_promedio": 44.2,
    "peso_max": 46.5,
    "peso_min": 42.1,
    "total_lecturas": 168
  },
  "periodo_dias": 7
}
```

**Estructura de respuesta:**
```typescript
{
  temp_promedio: number;    // Temperatura promedio (°C)
  temp_max: number;         // Temperatura máxima (°C)
  temp_min: number;         // Temperatura mínima (°C)
  humedad_promedio: number; // Humedad promedio (%)
  peso_promedio: number;    // Peso promedio (kg)
  peso_max: number;         // Peso máximo (kg)
  peso_min: number;         // Peso mínimo (kg)
  total_lecturas: number;   // Cantidad de lecturas en el período
}
```

**Errores:**
- `400`: `colmenaId` faltante
- `401`: Token inválido o expirado
- `500`: Error interno del servidor

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/lecturas/colmena/abc-123-def/estadisticas?dias=7" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo JavaScript (fetch):**
```javascript
const token = localStorage.getItem('token');
const colmenaId = 'abc-123-def';

const response = await fetch(
  `https://tu-api.com/api/lecturas/colmena/${colmenaId}/estadisticas?dias=7`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const { data } = await response.json();

console.log(`Temperatura promedio: ${data.temp_promedio}°C`);
console.log(`Peso actual vs promedio: ${pesoActual - data.peso_promedio}kg`);
```

---

### 3. Última Lectura (Valores Actuales)

Obtiene la lectura más reciente de la colmena, ideal para mostrar valores en tiempo real.

**Endpoint:** `GET /api/lecturas/colmena/:colmenaId/ultima`

**Autenticación:** ✅ Requiere JWT Token

**Parámetros URL:**
- `colmenaId` (uuid, requerido): ID de la colmena

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-lectura",
    "id_colmena": "uuid-colmena",
    "temperatura_c": 25.5,
    "humedad_h": 65.2,
    "peso_kg": 45.3,
    "sonido_hz": 120.5,
    "presion_hpa": 1013.2,
    "fecha_registro": "2025-11-28T10:30:00.000Z",
    "hora_registro": "10:30:00"
  }
}
```

**Si no hay lecturas:**
```json
{
  "success": true,
  "data": null
}
```

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/lecturas/colmena/abc-123-def/ultima" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Historial Completo (Paginado)

Obtiene lista de lecturas con paginación, ideal para tablas.

**Endpoint:** `GET /api/lecturas/colmena/:colmenaId`

**Autenticación:** ✅ Requiere JWT Token

**Parámetros URL:**
- `colmenaId` (uuid, requerido): ID de la colmena

**Query Parameters:**
- `limit` (number, opcional): Número máximo de registros. Default: 50, Max recomendado: 100

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
      "id": "uuid-lectura-1",
      "id_colmena": "uuid-colmena",
      "temperatura_c": 25.5,
      "humedad_h": 65.2,
      "peso_kg": 45.3,
      "sonido_hz": 120.5,
      "presion_hpa": 1013.2,
      "fecha_registro": "2025-11-28T10:30:00.000Z",
      "hora_registro": "10:30:00"
    }
    // ... más lecturas ordenadas por fecha descendente (más reciente primero)
  ]
}
```

**Ejemplo cURL:**
```bash
curl -X GET "https://tu-api.com/api/lecturas/colmena/abc-123-def?limit=100" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🎨 Integración con Frontend

### Ejemplo Completo: Dashboard de Colmena

```javascript
import axios from 'axios';

// Configurar axios con token
const api = axios.create({
  baseURL: 'https://tu-api.com/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

// 1. Obtener estadísticas para cards de resumen
async function cargarEstadisticas(colmenaId, dias = 7) {
  try {
    const { data } = await api.get(
      `/lecturas/colmena/${colmenaId}/estadisticas`,
      { params: { dias } }
    );
    
    return {
      temperaturaPromedio: data.data.temp_promedio,
      temperaturaMax: data.data.temp_max,
      temperaturaMin: data.data.temp_min,
      humedadPromedio: data.data.humedad_promedio,
      pesoPromedio: data.data.peso_promedio,
      totalLecturas: data.data.total_lecturas
    };
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
    throw error;
  }
}

// 2. Obtener datos para gráfico de temperatura (últimos 7 días)
async function cargarGraficoTemperatura(colmenaId, dias = 7) {
  try {
    const { data } = await api.get(
      `/lecturas/colmena/${colmenaId}/graficos`,
      { params: { dias } }
    );
    
    // Transformar para Chart.js, Recharts, etc.
    return {
      labels: data.data.map(lectura => 
        new Date(lectura.fecha_registro).toLocaleDateString('es-CL', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      ),
      valores: data.data.map(lectura => lectura.temperatura_c),
      totalPuntos: data.total_registros
    };
  } catch (error) {
    console.error('Error cargando gráfico:', error);
    throw error;
  }
}

// 3. Obtener última lectura para valores en tiempo real
async function cargarUltimaLectura(colmenaId) {
  try {
    const { data } = await api.get(`/lecturas/colmena/${colmenaId}/ultima`);
    
    if (!data.data) {
      return null; // No hay lecturas
    }
    
    return {
      temperatura: data.data.temperatura_c,
      humedad: data.data.humedad_h,
      peso: data.data.peso_kg,
      sonido: data.data.sonido_hz,
      presion: data.data.presion_hpa,
      fechaHora: new Date(data.data.fecha_registro)
    };
  } catch (error) {
    console.error('Error cargando última lectura:', error);
    throw error;
  }
}

// Uso en componente React/Vue/etc.
async function inicializarDashboard(colmenaId) {
  const [estadisticas, grafico, ultimaLectura] = await Promise.all([
    cargarEstadisticas(colmenaId, 7),
    cargarGraficoTemperatura(colmenaId, 7),
    cargarUltimaLectura(colmenaId)
  ]);
  
  console.log('Dashboard cargado:', { estadisticas, grafico, ultimaLectura });
}
```

---

### Ejemplo: Gráfico Multi-Variable (Chart.js)

```javascript
import Chart from 'chart.js/auto';

async function crearGraficoMultiVariable(colmenaId, dias = 7) {
  // 1. Obtener datos
  const response = await fetch(
    `https://tu-api.com/api/lecturas/colmena/${colmenaId}/graficos?dias=${dias}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  
  const { data } = await response.json();
  
  // 2. Preparar datos para Chart.js
  const labels = data.map(lectura => 
    new Date(lectura.fecha_registro).toLocaleString('es-CL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit'
    })
  );
  
  // 3. Crear gráfico
  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: data.map(l => l.temperatura_c),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Humedad (%)',
          data: data.map(l => l.humedad_h),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          yAxisID: 'y1'
        },
        {
          label: 'Peso (kg)',
          data: data.map(l => l.peso_kg),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Temperatura (°C)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Humedad (%)' },
          grid: { drawOnChartArea: false }
        },
        y2: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Peso (kg)' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}
```

---

### Ejemplo: Cards de Estadísticas (React)

```jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EstadisticasColmena({ colmenaId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function cargarEstadisticas() {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(
          `https://tu-api.com/api/lecturas/colmena/${colmenaId}/estadisticas?dias=7`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setStats(data.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    cargarEstadisticas();
  }, [colmenaId]);
  
  if (loading) return <div>Cargando...</div>;
  if (!stats) return <div>No hay datos</div>;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card title="Temperatura">
        <p className="text-2xl">{stats.temp_promedio.toFixed(1)}°C</p>
        <p className="text-sm text-gray-600">
          Min: {stats.temp_min}°C | Max: {stats.temp_max}°C
        </p>
      </Card>
      
      <Card title="Humedad">
        <p className="text-2xl">{stats.humedad_promedio.toFixed(1)}%</p>
      </Card>
      
      <Card title="Peso">
        <p className="text-2xl">{stats.peso_promedio.toFixed(2)} kg</p>
        <p className="text-sm text-gray-600">
          Min: {stats.peso_min}kg | Max: {stats.peso_max}kg
        </p>
      </Card>
      
      <Card title="Total Lecturas">
        <p className="text-2xl">{stats.total_lecturas}</p>
        <p className="text-sm text-gray-600">Últimos 7 días</p>
      </Card>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

export default EstadisticasColmena;
```

---

## 🔄 Actualización en Tiempo Real

### Polling (Recomendado para MVP)

```javascript
// Actualizar cada 30 segundos
setInterval(async () => {
  const ultimaLectura = await cargarUltimaLectura(colmenaId);
  actualizarUI(ultimaLectura);
}, 30000); // 30 segundos
```

### WebSockets (Futuro)

Para actualizaciones push en tiempo real, considerar implementar WebSockets o Server-Sent Events en el backend.

---

## 📋 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| `200` | OK - Solicitud exitosa |
| `400` | Bad Request - Parámetros inválidos o faltantes |
| `401` | Unauthorized - Token JWT inválido o expirado |
| `500` | Internal Server Error - Error del servidor |

---

## 🔐 Autenticación

Todos los endpoints requieren JWT Token en el header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Obtener token:**
```bash
# Login
curl -X POST https://tu-api.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "admin@empresa.com",
    "password": "tu_password"
  }'

# Respuesta:
# { "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

---

## 📊 Resumen de Endpoints

| Endpoint | Método | Autenticación | Descripción |
|----------|--------|---------------|-------------|
| `/lecturas/colmena/:id/graficos` | GET | ✅ JWT | Historial para gráficos (time series) |
| `/lecturas/colmena/:id/estadisticas` | GET | ✅ JWT | Estadísticas agregadas (promedio/min/max) |
| `/lecturas/colmena/:id/ultima` | GET | ✅ JWT | Última lectura (valores actuales) |
| `/lecturas/colmena/:id` | GET | ✅ JWT | Historial completo (paginado) |
| `/lecturas/dispositivo/:codigo` | GET | ✅ JWT | Lecturas por código de dispositivo |

---

## 🐝 Ejemplo Real Completo

### Frontend: Dashboard de Colmena

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dashboard Colmena - SimonIA</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    <h1>Colmena: <span id="nombreColmena"></span></h1>
    
    <!-- Cards de estadísticas -->
    <div class="stats-grid">
      <div class="card">
        <h3>Temperatura Actual</h3>
        <p id="tempActual">--°C</p>
        <small id="tempPromedio">Promedio: --°C</small>
      </div>
      <div class="card">
        <h3>Humedad Actual</h3>
        <p id="humedadActual">--%</p>
      </div>
      <div class="card">
        <h3>Peso Actual</h3>
        <p id="pesoActual">-- kg</p>
        <small id="pesoDiferencia">--</small>
      </div>
    </div>
    
    <!-- Gráfico -->
    <canvas id="graficoColmena"></canvas>
  </div>

  <script>
    const API_URL = 'https://tu-api.com/api';
    const COLMENA_ID = 'abc-123-def'; // Obtener de URL o props
    const TOKEN = localStorage.getItem('token');
    
    async function cargarDashboard() {
      try {
        // Cargar datos en paralelo
        const [ultimaLectura, estadisticas, historial] = await Promise.all([
          fetch(`${API_URL}/lecturas/colmena/${COLMENA_ID}/ultima`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          }).then(r => r.json()),
          
          fetch(`${API_URL}/lecturas/colmena/${COLMENA_ID}/estadisticas?dias=7`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          }).then(r => r.json()),
          
          fetch(`${API_URL}/lecturas/colmena/${COLMENA_ID}/graficos?dias=7`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          }).then(r => r.json())
        ]);
        
        // Actualizar cards
        if (ultimaLectura.data) {
          document.getElementById('tempActual').textContent = 
            `${ultimaLectura.data.temperatura_c}°C`;
          document.getElementById('humedadActual').textContent = 
            `${ultimaLectura.data.humedad_h}%`;
          document.getElementById('pesoActual').textContent = 
            `${ultimaLectura.data.peso_kg} kg`;
        }
        
        if (estadisticas.data) {
          document.getElementById('tempPromedio').textContent = 
            `Promedio: ${estadisticas.data.temp_promedio.toFixed(1)}°C`;
          
          const difPeso = ultimaLectura.data.peso_kg - estadisticas.data.peso_promedio;
          document.getElementById('pesoDiferencia').textContent = 
            `${difPeso > 0 ? '+' : ''}${difPeso.toFixed(2)}kg vs promedio`;
        }
        
        // Crear gráfico
        crearGrafico(historial.data);
        
      } catch (error) {
        console.error('Error cargando dashboard:', error);
        alert('Error al cargar los datos. Verifica tu conexión.');
      }
    }
    
    function crearGrafico(lecturas) {
      const ctx = document.getElementById('graficoColmena').getContext('2d');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: lecturas.map(l => 
            new Date(l.fecha_registro).toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit'
            })
          ),
          datasets: [
            {
              label: 'Temperatura (°C)',
              data: lecturas.map(l => l.temperatura_c),
              borderColor: '#FF6384',
              tension: 0.4
            },
            {
              label: 'Humedad (%)',
              data: lecturas.map(l => l.humedad_h),
              borderColor: '#36A2EB',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Lecturas últimos 7 días'
            }
          }
        }
      });
    }
    
    // Cargar al iniciar
    cargarDashboard();
    
    // Actualizar cada 30 segundos
    setInterval(cargarDashboard, 30000);
  </script>
</body>
</html>
```

---

## ⚡ Tips de Optimización

1. **Cachear estadísticas**: Las estadísticas cambian poco, cachear 1-5 minutos
2. **Limitar días**: No pedir más de 30 días en gráficos (performance)
3. **Polling inteligente**: Actualizar última lectura cada 30-60 segundos
4. **Loading states**: Mostrar skeletons mientras carga
5. **Error handling**: Manejar 401 (renovar token) y 500 (retry)

---

**Última actualización:** 28 de noviembre de 2025  
**Versión API:** 1.0.0
