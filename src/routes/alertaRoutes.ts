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

// 🚨 ALERTAS POR COLMENA (requiere autenticación)

// Obtener todas las alertas de una colmena específica
router.get('/alertas/colmena/:colmenaId', authenticateToken, getAlertasColmenaHandler);

// Obtener solo alertas PENDIENTES de una colmena
router.get('/alertas/colmena/:colmenaId/pendientes', authenticateToken, getAlertasPendientesColmenaHandler);

// 🚨 ALERTAS GENERALES DE LA EMPRESA (requiere autenticación)

// Obtener todas las alertas de la empresa
router.get('/alertas/empresa/todas', authenticateToken, getAlertasEmpresaHandler);

// Obtener solo alertas PENDIENTES de la empresa
router.get('/alertas/empresa/pendientes', authenticateToken, getAlertasPendientesEmpresaHandler);

// Obtener resumen de alertas (por prioridad y estado)
router.get('/alertas/empresa/resumen', authenticateToken, getResumenAlertasHandler);

// Obtener alertas por rango de fechas
router.get('/alertas/empresa/fecha', authenticateToken, getAlertasByFechaHandler);

// ✅ GESTIÓN DE ALERTAS

// Marcar alerta como atendida
router.patch('/alertas/:alertaId/atender', authenticateToken, marcarAlertaAtendidaHandler);

export default router;
