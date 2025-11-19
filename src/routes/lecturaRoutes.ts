import { Router } from 'express';
import {
  createLecturaSensorHandler,
  getLecturasByColmenaHandler,
  getLecturasByDispositivoHandler,
  getUltimaLecturaColmenaHandler,
} from '../controllers/lecturaController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Documentación para el dispositivo IoT
router.get('/lecturas/sensor/docs', (_req, res) => {
  res.json({
    endpoint: 'POST /api/lecturas/sensor',
    descripcion: 'Endpoint para enviar datos desde el dispositivo IoT Simon',
    headers: {
      'Content-Type': 'application/json'
    },
    body_requerido: {
      codigo_dispositivo: 'string (REQUERIDO) - Código único del dispositivo'
    },
    body_opcional: {
      temperatura_c: 'number - Temperatura en grados Celsius',
      humedad_h: 'number - Humedad relativa en porcentaje',
      peso_kg: 'number - Peso en kilogramos',
      sonido_hz: 'number - Frecuencia de sonido en Hertz',
      presion_hpa: 'number - Presión atmosférica en hectopascales'
    },
    ejemplo_curl: `curl -X POST https://simon-backend-mvp-1.onrender.com/api/lecturas/sensor \\
  -H "Content-Type: application/json" \\
  -d '{
    "codigo_dispositivo": "SIM-002",
    "temperatura_c": 25.5,
    "humedad_h": 65.2,
    "peso_kg": 45.3,
    "sonido_hz": 120.5,
    "presion_hpa": 1013.2
  }'`,
    ejemplo_body: {
      codigo_dispositivo: 'SIM-002',
      temperatura_c: 25.5,
      humedad_h: 65.2,
      peso_kg: 45.3,
      sonido_hz: 120.5,
      presion_hpa: 1013.2
    },
    respuesta_exitosa: {
      success: true,
      data: {
        lectura: '{ datos de la lectura creada }'
      }
    },
    nota: 'Solo codigo_dispositivo es obligatorio. Los demás campos son opcionales.'
  });
});

// Ingesta desde dispositivo (sin auth humana) - se podría asegurar con token de dispositivo en el futuro
router.post('/lecturas/sensor', createLecturaSensorHandler);

// Lecturas por colmena (requiere auth)
router.get('/lecturas/colmena/:colmenaId', authenticateToken, getLecturasByColmenaHandler);
router.get('/lecturas/colmena/:colmenaId/ultima', authenticateToken, getUltimaLecturaColmenaHandler);

// Lecturas por dispositivo (requiere auth)
router.get('/lecturas/dispositivo/:codigo', authenticateToken, getLecturasByDispositivoHandler);

export default router;
