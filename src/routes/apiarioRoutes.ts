import { Router } from 'express';
import {
  createApiarioHandler,
  getApiariosHandler,
  getApiarioByIdHandler,
  createColmenaHandler,
  getColmenasHandler,
  getColmenaByIdHandler,
} from '../controllers/apiarioController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Apiarios
 *   description: Gestión de apiarios
 */

/**
 * @swagger
 * tags:
 *   name: Colmenas
 *   description: Gestión de colmenas
 */

/**
 * @swagger
 * /api/apiarios:
 *   post:
 *     summary: Crear un nuevo apiario
 *     tags: [Apiarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, locacion]
 *             properties:
 *               nombre:
 *                 type: string
 *               locacion:
 *                 type: string
 *               limite_colmenas:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Apiario creado
 *   get:
 *     summary: Obtener todos los apiarios de la empresa
 *     tags: [Apiarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de apiarios
 */
router.post('/apiarios', authenticateToken, requireAdmin, createApiarioHandler);
router.get('/apiarios', authenticateToken, getApiariosHandler);

/**
 * @swagger
 * /api/apiarios/{apiarioId}:
 *   get:
 *     summary: Obtener detalle de un apiario
 *     tags: [Apiarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del apiario
 */
router.get('/apiarios/:apiarioId', authenticateToken, getApiarioByIdHandler);

/**
 * @swagger
 * /api/colmenas:
 *   post:
 *     summary: Crear una nueva colmena
 *     tags: [Colmenas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre_colmena, id_apiario_actual]
 *             properties:
 *               nombre_colmena:
 *                 type: string
 *               id_apiario_actual:
 *                 type: string
 *                 format: uuid
 *               id_dispositivo:
 *                 type: string
 *                 format: uuid
 *               fecha_instalacion:
 *                 type: string
 *                 format: date
 *               tipo_colmena:
 *                 type: string
 *                 enum: [polinizacion, produccion]
 *                 description: Tipo de colmena (polinización o producción de miel/subproductos)
 *     responses:
 *       201:
 *         description: Colmena creada

 *   get:
 *     summary: Obtener todas las colmenas (opcionalmente filtrado por apiario)
 *     tags: [Colmenas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_apiario
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de colmenas
 */
router.post('/colmenas', authenticateToken, requireAdmin, createColmenaHandler);
router.get('/colmenas', authenticateToken, getColmenasHandler);

/**
 * @swagger
 * /api/colmenas/{colmenaId}:
 *   get:
 *     summary: Obtener detalle de una colmena
 *     tags: [Colmenas]
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
 *         description: Detalle de la colmena
 *       404:
 *         description: Colmena no encontrada
 */
router.get('/colmenas/:colmenaId', authenticateToken, getColmenaByIdHandler);


export default router;
