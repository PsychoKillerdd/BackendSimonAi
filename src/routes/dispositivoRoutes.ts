import { Router } from 'express';
import {
  createDispositivoHandler,
  getDispositivoByIdHandler,
  getDispositivoByCodigoHandler,
  getAllDispositivosHandler,
  updateDispositivoEstadoHandler,
} from '../controllers/dispositivoController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Crear dispositivo (solo admin)
router.post('/dispositivos', authenticateToken, requireAdmin, createDispositivoHandler);

// Obtener todos los dispositivos
router.get('/dispositivos', authenticateToken, getAllDispositivosHandler);

// Obtener dispositivo por ID
router.get('/dispositivos/:dispositivoId', authenticateToken, getDispositivoByIdHandler);

// Obtener dispositivo por código único
router.get('/dispositivos/codigo/:codigo', authenticateToken, getDispositivoByCodigoHandler);

// Actualizar estado del dispositivo (solo admin)
router.patch('/dispositivos/:dispositivoId/estado', authenticateToken, requireAdmin, updateDispositivoEstadoHandler);

export default router;
