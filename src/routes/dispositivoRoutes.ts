import { Router } from 'express';
import {
  createDispositivoHandler,
  getDispositivoByIdHandler,
  getDispositivoByCodigoHandler,
  getAllDispositivosHandler,
  getDispositivosByEmpresaHandler,
  getDispositivosSinAsignarHandler,
  updateDispositivoEstadoHandler,
  asignarDispositivoHandler,
} from '../controllers/dispositivoController';
import { authenticateToken, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dispositivos
 *   description: Inventario y asignación de dispositivos SimonIA
 */

/**
 * @swagger
 * /api/dispositivos:
 *   post:
 *     summary: Crear un nuevo dispositivo en el sistema
 *     tags: [Dispositivos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo_unico]
 *             properties:
 *               codigo_unico:
 *                 type: string
 *               modelo:
 *                 type: string
 *               firmware_version:
 *                 type: string
 *               estado:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dispositivo creado
 *   get:
 *     summary: Obtener todos los dispositivos registrados
 *     tags: [Dispositivos]
 *     responses:
 *       200:
 *         description: Lista de dispositivos
 */
router.post('/dispositivos', createDispositivoHandler);
router.get('/dispositivos', getAllDispositivosHandler);

/**
 * @swagger
 * /api/dispositivos/sin-asignar/lista:
 *   get:
 *     summary: Obtener dispositivos que no pertenecen a ninguna empresa
 *     tags: [Dispositivos]
 *     responses:
 *       200:
 *         description: Lista de dispositivos libres
 */
router.get('/dispositivos/sin-asignar/lista', getDispositivosSinAsignarHandler);

/**
 * @swagger
 * /api/dispositivos/empresa/mis-dispositivos:
 *   get:
 *     summary: Obtener dispositivos de una empresa específica
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: query
 *         name: id_empresa
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de dispositivos de la empresa
 */
router.get('/dispositivos/empresa/mis-dispositivos', getDispositivosByEmpresaHandler);

/**
 * @swagger
 * /api/dispositivos/{dispositivoId}:
 *   get:
 *     summary: Obtener detalle por ID
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: dispositivoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del dispositivo
 */
router.get('/dispositivos/:dispositivoId', getDispositivoByIdHandler);

/**
 * @swagger
 * /api/dispositivos/codigo/{codigo}:
 *   get:
 *     summary: Obtener detalle por código único (ej. SIM-XXX)
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del dispositivo
 */
router.get('/dispositivos/codigo/:codigo', getDispositivoByCodigoHandler);

/**
 * @swagger
 * /api/dispositivos/{dispositivoId}/estado:
 *   patch:
 *     summary: Actualizar estado (activo, mantenimiento, etc.)
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: dispositivoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/dispositivos/:dispositivoId/estado', updateDispositivoEstadoHandler);

/**
 * @swagger
 * /api/dispositivos/{dispositivoId}/asignar:
 *   patch:
 *     summary: Asignar dispositivo a una empresa
 *     tags: [Dispositivos]
 *     parameters:
 *       - in: path
 *         name: dispositivoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_empresa]
 *             properties:
 *               id_empresa:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispositivo asignado
 */
router.patch('/dispositivos/:dispositivoId/asignar', asignarDispositivoHandler);

export default router;
