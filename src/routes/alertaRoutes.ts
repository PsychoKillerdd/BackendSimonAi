import { Router } from 'express';
import {
  getAlertasColmenaHandler,
  getAlertasEmpresaHandler,
  getAlertasPendientesColmenaHandler,
  getAlertasPendientesEmpresaHandler,
  marcarAlertaAtendidaHandler,
  getResumenAlertasHandler,
  getAlertasByFechaHandler,
} from '../controllers/alertaController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Alertas
 *   description: Monitoreo y gestión de alertas de colmenas
 */

/**
 * @swagger
 * /api/alertas/colmena/{colmenaId}:
 *   get:
 *     summary: Obtener todas las alertas de una colmena
 *     tags: [Alertas]
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
 *         description: Lista de alertas
 */
router.get('/alertas/colmena/:colmenaId', authenticateToken, getAlertasColmenaHandler);

/**
 * @swagger
 * /api/alertas/colmena/{colmenaId}/pendientes:
 *   get:
 *     summary: Obtener alertas pendientes de una colmena
 *     tags: [Alertas]
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
 *         description: Lista de alertas pendientes
 */
router.get('/alertas/colmena/:colmenaId/pendientes', authenticateToken, getAlertasPendientesColmenaHandler);

/**
 * @swagger
 * /api/alertas/empresa/todas:
 *   get:
 *     summary: Obtener todas las alertas de la empresa
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de alertas de la empresa
 */
router.get('/alertas/empresa/todas', authenticateToken, getAlertasEmpresaHandler);

/**
 * @swagger
 * /api/alertas/empresa/pendientes:
 *   get:
 *     summary: Obtener solo alertas pendientes de la empresa
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas pendientes
 */
router.get('/alertas/empresa/pendientes', authenticateToken, getAlertasPendientesEmpresaHandler);

/**
 * @swagger
 * /api/alertas/empresa/resumen:
 *   get:
 *     summary: Obtener resumen estadístico de alertas
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen por prioridad y estado
 */
router.get('/alertas/empresa/resumen', authenticateToken, getResumenAlertasHandler);

/**
 * @swagger
 * /api/alertas/empresa/fecha:
 *   get:
 *     summary: Buscar alertas por rango de fechas
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Alertas encontradas
 */
router.get('/alertas/empresa/fecha', authenticateToken, getAlertasByFechaHandler);

/**
 * @swagger
 * /api/alertas/{alertaId}/atender:
 *   patch:
 *     summary: Marcar una alerta como resuelta
 *     tags: [Alertas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertaId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comentario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alerta actualizada
 */
router.patch('/alertas/:alertaId/atender', authenticateToken, marcarAlertaAtendidaHandler);

export default router;
