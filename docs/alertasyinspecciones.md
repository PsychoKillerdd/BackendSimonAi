# 🐝 Documentación de Integración API - Simón Backend (Simonia)
Esta guía detalla los endpoints necesarios para integrar el módulo de **Alertas Bioacústicas** y la **Bitácora de Inspecciones** en el Frontend.
## 🔑 Configuración General
- **Base URL:** `https://tu-api-simon.render.com` (o `http://localhost:3000` en local)
- **Cabeceras Requeridas:**  
  `Authorization: Bearer <TOKEN_JWT>`  
  `Content-Type: application/json`
---
## 🚨 1. Módulo de Alertas
Este módulo gestiona la salud de las colmenas mediante el análisis de sensores.
### Endpoints
| Método | Endpoint | Acción |
| :--- | :--- | :--- |
| **GET** | `/api/alertas/empresa/todas` | Historial total de alertas de la empresa. |
| **GET** | `/api/alertas/empresa/pendientes` | Alertas que requieren atención inmediata. |
| **GET** | `/api/alertas/colmena/{colmenaId}` | Ver alertas de una colmena específica. |
| **PATCH** | `/api/alertas/{alertaId}/atender` | Resolver/Cerrar una alerta. |
| **GET** | `/api/alertas/empresa/resumen` | Estadísticas (Cuántas altas, medias, bajas). |
### Códigos de Alerta para UI (Lógica de Colores/Iconos)
| Código | Prioridad | Contexto |
| :--- | :--- | :--- |
| `AMENAZA_INCENDIO` | **ALTA** | Calor extremo / Fuego cercano. |
| `ENJAMBRAZON_ACUSTICA_CONFIRMADA` | **ALTA** | Ruido agudo + caída de peso. |
| `ROBO_VANDALISMO` | **ALTA** | Actividad física en horario nocturno. |
| `ORFANDAD_ACUSTICA` | **ALTA** | Ausencia de reina. |
| `ATAQUE_O_ESTRES` | **ALTA** | Ataque externo de depredadores. |
| `PRE_ENJAMBRAZON_ACUSTICA` | **MEDIA** | Predicción de enjambre. |
---
## 📋 2. Módulo de Bitácora (Inspecciones)
Permite al apicultor registrar sus revisiones técnicas manuales.
### Endpoints
| Método | Endpoint | Acción |
| :--- | :--- | :--- |
| **POST** | `/api/inspecciones` | Crear nuevo registro de inspección. |
| **GET** | `/api/inspecciones/colmena/{colmenaId}` | Historial de revisiones de una colmena. |
| **GET** | `/api/inspecciones/{id}` | Ver detalle completo de una revisión. |
### Modelo de Datos para POST (Registro)
Todos los campos deben enviarse en formato JSON.
```json
{
  "colmena_id": "string (uuid)",        // Requerido
  "fecha_inspeccion": "YYYY-MM-DD",     // Requerido
  "nombre_inspeccion": "Nombre Inspector", // Requerido (Inspector)
  "observaciones": "Texto detallado",      // Requerido
  "apiario_id": "string (uuid)",        // Opcional
  "alerta_id": "string (uuid)",         // Opcional (vincular a alerta)
  "ubicacion_apiario": "Texto",
  "temperatura": "25.5",
  "humedad": "60",
  "velocidad_viento": "10",
  "direccion_viento": "Norte",
  "cielo": "Despejado/Nublado",
  "estado_colmena": "Saludable/Crítico",
  "poblacion_abejas": "Alta/Media/Baja",
  "presencia_reina": "Si/No/No vista",
  "celdas_reales": "Si/No",
  "postura": "Uniforme/Irregular",
  "reservas_alimento": "Moderada",
  "comportamiento_abejas": "Tranquilo/Defensivo",
  "signos_enfermedad": "Texto libre",
  "recomendaciones": "Texto libre",
  "acciones_correctivas": "Texto libre"
}
