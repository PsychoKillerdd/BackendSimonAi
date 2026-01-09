import { Router } from 'express';
import * as inspeccionController from '../controllers/inspeccionController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Inspecciones
 *   description: Gestión de inspecciones de colmenas
 */

/**
 * @swagger
 * /api/inspecciones:
 *   post:
 *     summary: Crear una nueva inspección de colmena
 *     tags: [Inspecciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - colmena_id
 *               - fecha_inspeccion
 *               - nombre_inspeccion
 *               - observaciones
 *             properties:
 *               colmena_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la colmena inspeccionada
 *               apiario_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del apiario (opcional)
 *               alerta_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la alerta relacionada (opcional)
 *               fecha_inspeccion:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la inspección (YYYY-MM-DD)
 *               nombre_inspeccion:
 *                 type: string
 *                 description: Título o nombre de la inspección
 *               ubicacion_apiario:
 *                 type: string
 *                 description: Ubicación del apiario
 *               temperatura:
 *                 type: string
 *                 description: Temperatura ambiente (°C)
 *               humedad:
 *                 type: string
 *                 description: Humedad ambiente (%)
 *               velocidad_viento:
 *                 type: string
 *                 description: Velocidad del viento (km/h)
 *               direccion_viento:
 *                 type: string
 *                 description: Dirección del viento
 *               cielo:
 *                 type: string
 *                 description: Estado del cielo (Despejado, Nublado, etc.)
 *               estado_colmena:
 *                 type: string
 *                 description: Estado general de la colmena (Bueno, Regular, Malo, Crítico)
 *               poblacion_abejas:
 *                 type: string
 *                 description: Nivel de población (Alta, Media, Baja)
 *               presencia_reina:
 *                 type: string
 *                 description: Estado de la reina (Confirmada, No observada, Ausente)
 *               celdas_reales:
 *                 type: string
 *                 description: Celdas reales observadas
 *               postura:
 *                 type: string
 *                 description: Estado de la postura
 *               reservas_alimento:
 *                 type: string
 *                 description: Nivel de reservas (Abundantes, Suficientes, Escasas)
 *               comportamiento_abejas:
 *                 type: string
 *                 description: Comportamiento (Tranquilas, Agitadas, Defensivas)
 *               signos_enfermedad:
 *                 type: string
 *                 description: Signos de enfermedad observados
 *               observaciones:
 *                 type: string
 *                 description: Observaciones generales del inspector
 *               recomendaciones:
 *                 type: string
 *                 description: Recomendaciones para acciones futuras
 *               acciones_correctivas:
 *                 type: string
 *                 description: Acciones correctivas tomadas
 *           example:
 *             colmena_id: "a2abdf80-4b01-4ef8-a4db-77ff20649d4b"
 *             fecha_inspeccion: "2025-12-30"
 *             nombre_inspeccion: "Inspección de Rutina - Diciembre"
 *             ubicacion_apiario: "Sector Norte"
 *             temperatura: "25"
 *             humedad: "60"
 *             cielo: "Despejado"
 *             estado_colmena: "Bueno"
 *             poblacion_abejas: "Alta"
 *             presencia_reina: "Confirmada"
 *             postura: "Activa y uniforme"
 *             reservas_alimento: "Suficientes"
 *             comportamiento_abejas: "Tranquilas"
 *             signos_enfermedad: "Sin signos visibles"
 *             observaciones: "Colmena en buen estado general."
 *             recomendaciones: "Revisar en 15 días"
 *     responses:
 *       201:
 *         description: Inspección creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Campos requeridos faltantes
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/', inspeccionController.createInspeccionHandler);

router.get('/colmena/:colmenaId', inspeccionController.getInspeccionesByColmenaHandler);
router.get('/colmena/:colmenaId/historial', inspeccionController.getBitacoraByColmenaHandler);

/**
 * @swagger
 * /api/inspecciones/{id}:
 *   get:
 *     summary: Obtener una inspección por ID
 *     tags: [Inspecciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la inspección
 *     responses:
 *       200:
 *         description: Datos de la inspección
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       404:
 *         description: Inspección no encontrada
 *       401:
 *         description: No autorizado
 */
router.get('/:id', inspeccionController.getInspeccionByIdHandler);

export default router;
