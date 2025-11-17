import { Router } from 'express';
import {
  createApiarioHandler,
  getApiariosHandler,
  getApiarioByIdHandler,
  createColmenaHandler,
  getColmenasHandler,
} from '../controllers/apiarioController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Rutas para apiarios (requieren autenticación y rol admin)
router.post('/apiarios', authenticateToken, requireAdmin, createApiarioHandler);
router.get('/apiarios', authenticateToken, getApiariosHandler);
router.get('/apiarios/:apiarioId', authenticateToken, getApiarioByIdHandler);

// Rutas para colmenas (requieren autenticación y rol admin para crear)
router.post('/colmenas', authenticateToken, requireAdmin, createColmenaHandler);
router.get('/colmenas', authenticateToken, getColmenasHandler);

export default router;
