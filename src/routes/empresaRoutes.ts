import express from 'express';
import {
  createEmpresaHandler,
  getAllEmpresasHandler,
  getEmpresaByIdHandler,
  createAdminHandler,
  createSuscripcionHandler,
  createUsuarioHandler,
  initEmpresaHandler,
  onboardEmpresaHandler
} from '../controllers/empresaController';

const router = express.Router();

// POST /api/empresas
router.post('/empresas', createEmpresaHandler);

// GET /api/empresas/:empresaId - obtener empresa por ID (debe ir ANTES del GET genérico)
router.get('/empresas/:empresaId', getEmpresaByIdHandler);

// GET /api/empresas - con paginación
router.get('/empresas', getAllEmpresasHandler);


// POST /api/empresas/:empresaId/create-admin - crear admin a partir de la empresa (correo de empresa por defecto)
router.post('/empresas/:empresaId/create-admin', createAdminHandler);// POST /api/empresas/:empresaId/suscripcion
router.post('/empresas/:empresaId/suscripcion', createSuscripcionHandler);

// POST /api/empresas/:empresaId/usuarios
router.post('/empresas/:empresaId/usuarios', createUsuarioHandler);

// POST /api/empresas/:empresaId/init - inicializar uso_empresa y configuracion_reporte
router.post('/empresas/:empresaId/init', initEmpresaHandler);

// POST /api/empresas/onboard - endpoint compuesto (no atómico)
router.post('/empresas/onboard', onboardEmpresaHandler);

export default router;
