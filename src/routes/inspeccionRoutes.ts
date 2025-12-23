import { Router } from 'express';
import * as inspeccionController from '../controllers/inspeccionController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.post('/', inspeccionController.createInspeccionHandler);
router.get('/colmena/:colmenaId', inspeccionController.getInspeccionesByColmenaHandler);
router.get('/:id', inspeccionController.getInspeccionByIdHandler);

export default router;
