import { Router } from 'express';
import {
  createLecturaSensorHandler,
  getLecturasByColmenaHandler,
  getLecturasByDispositivoHandler,
  getUltimaLecturaColmenaHandler,
} from '../controllers/lecturaController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Ingesta desde dispositivo (sin auth humana) - se podría asegurar con token de dispositivo en el futuro
router.post('/lecturas/sensor', createLecturaSensorHandler);

// Lecturas por colmena (requiere auth)
router.get('/lecturas/colmena/:colmenaId', authenticateToken, getLecturasByColmenaHandler);
router.get('/lecturas/colmena/:colmenaId/ultima', authenticateToken, getUltimaLecturaColmenaHandler);

// Lecturas por dispositivo (requiere auth)
router.get('/lecturas/dispositivo/:codigo', authenticateToken, getLecturasByDispositivoHandler);

export default router;
