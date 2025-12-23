import { Router } from 'express';
import { getDashboardOperativoHandler } from '../controllers/analiticaController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analitica
 *   description: Indicadores biológicos y dashboards de salud
 */

/**
 * @swagger
 * /api/analitica/colmena/{colmenaId}/dashboard-operativo:
 *   get:
 *     summary: Obtener indicadores de Salud y Vigor de una colmena
 *     tags: [Analitica]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: colmenaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos para los widgets del dashboard
 */
router.get('/colmena/:colmenaId/dashboard-operativo', authenticateToken, getDashboardOperativoHandler);

export default router;
