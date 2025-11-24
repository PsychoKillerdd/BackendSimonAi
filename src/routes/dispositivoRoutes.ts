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

// Crear dispositivo (sin autenticación - SimonIA crea inventario externo)
router.post('/dispositivos', createDispositivoHandler);

// Obtener todos los dispositivos (sin autenticación)
router.get('/dispositivos', getAllDispositivosHandler);

// Obtener dispositivos sin asignar - inventario SimonIA (sin autenticación)
router.get('/dispositivos/sin-asignar/lista', getDispositivosSinAsignarHandler);

// Obtener dispositivos de mi empresa (sin autenticación)
router.get('/dispositivos/empresa/mis-dispositivos', getDispositivosByEmpresaHandler);

// Obtener dispositivo por ID (sin autenticación)
router.get('/dispositivos/:dispositivoId', getDispositivoByIdHandler);

// Obtener dispositivo por código único (sin autenticación)
router.get('/dispositivos/codigo/:codigo', getDispositivoByCodigoHandler);

// Actualizar estado del dispositivo (sin autenticación)
router.patch('/dispositivos/:dispositivoId/estado', updateDispositivoEstadoHandler);

// Asignar dispositivo a empresa (sin autenticación)
router.patch('/dispositivos/:dispositivoId/asignar', asignarDispositivoHandler);

export default router;
