import express from 'express';
import {
  createEmpresaHandler,
  getAllEmpresasHandler,
  getEmpresaByIdHandler,
  createAdminHandler,
  createUsuarioHandler
} from '../controllers/empresaController';

const router = express.Router();

// POST /api/empresas
router.post('/empresas', createEmpresaHandler);

// GET /api/empresas/:empresaId - obtener empresa por ID (debe ir ANTES del GET genérico)
router.get('/empresas/:empresaId', getEmpresaByIdHandler);

// GET /api/empresas - con paginación
router.get('/empresas', getAllEmpresasHandler);

// POST /api/empresas/:empresaId/create-admin - crear admin a partir de la empresa (correo de empresa por defecto)
router.post('/empresas/:empresaId/create-admin', createAdminHandler);

// POST /api/empresas/:empresaId/usuarios
router.post('/empresas/:empresaId/usuarios', createUsuarioHandler);

// Nota: Los siguientes endpoints están deshabilitados porque requieren tablas que no están en el schema
// - POST /api/empresas/:empresaId/suscripcion (requiere suscripcion_empresa)
// - POST /api/empresas/:empresaId/init (requiere uso_empresa, configuracion_reporte)
// - POST /api/empresas/onboard (requiere las tablas anteriores)

export default router;
