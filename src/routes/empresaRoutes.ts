import express from 'express';
import {
  createEmpresaHandler,
  getAllEmpresasHandler,
  getEmpresaByIdHandler,
  createAdminHandler,
  createUsuarioHandler
} from '../controllers/empresaController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Empresas
 *   description: Administración de empresas y sus usuarios
 */

/**
 * @swagger
 * /api/empresas:
 *   post:
 *     summary: Crear una nueva empresa
 *     tags: [Empresas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre:
 *                 type: string
 *               pais:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo_contacto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Empresa creada
 *   get:
 *     summary: Listar todas las empresas (con paginación)
 *     tags: [Empresas]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de empresas
 */
router.post('/empresas', createEmpresaHandler);
router.get('/empresas', getAllEmpresasHandler);

/**
 * @swagger
 * /api/empresas/{empresaId}:
 *   get:
 *     summary: Obtener detalle de empresa por ID
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: empresaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle de la empresa
 */
router.get('/empresas/:empresaId', getEmpresaByIdHandler);

/**
 * @swagger
 * /api/empresas/{empresaId}/create-admin:
 *   post:
 *     summary: Crear el primer administrador para una empresa
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: empresaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Admin creado
 */
router.post('/empresas/:empresaId/create-admin', createAdminHandler);

/**
 * @swagger
 * /api/empresas/{empresaId}/usuarios:
 *   post:
 *     summary: Agregar un nuevo usuario a la empresa
 *     tags: [Empresas]
 *     parameters:
 *       - in: path
 *         name: empresaId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, tipo_usuario]
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               tipo_usuario:
 *                 type: string
 *                 enum: [admin, apicultor]
 *     responses:
 *       201:
 *         description: Usuario agregado
 */
router.post('/empresas/:empresaId/usuarios', createUsuarioHandler);

// Nota: Los siguientes endpoints están deshabilitados porque requieren tablas que no están en el schema
// - POST /api/empresas/:empresaId/suscripcion (requiere suscripcion_empresa)
// - POST /api/empresas/:empresaId/init (requiere uso_empresa, configuracion_reporte)
// - POST /api/empresas/onboard (requiere las tablas anteriores)

export default router;
