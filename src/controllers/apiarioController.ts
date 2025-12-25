import type { Request, Response } from 'express';
import {
  createApiarioWithUbicacion,
  getApiariosByEmpresa,
  getApiarioById,
  createColmena,
  getColmenasByApiario,
  getColmenasByEmpresa,
  type ApiarioInput,
  type ColmenaInput,
} from '../services/apiarioService';
import type { AuthRequest } from '../middlewares/authMiddleware';
import { getCachedData, invalidateCache } from '../utils/cache';

export async function createApiarioHandler(req: AuthRequest, res: Response) {
  try {
    const { nombre, limite_colmenas, locacion } = req.body;

    if (!nombre || !locacion) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: nombre, locacion',
      });
    }

    const id_empresa = req.user!.id_empresa;

    const payload: ApiarioInput = {
      nombre,
      limite_colmenas,
      locacion,
    };

    const result = await createApiarioWithUbicacion(id_empresa, payload);

    // ⚡ INVALIDAR CACHE: Como creamos un apiario, el listado viejo ya no sirve
    invalidateCache(`apiarios_empresa_${id_empresa}`);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error creando apiario:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear apiario',
    });
  }
}

export async function getApiariosHandler(req: AuthRequest, res: Response) {
  try {
    const id_empresa = req.user!.id_empresa;
    const cacheKey = `apiarios_empresa_${id_empresa}`;

    // Cacheamos el listado por 5 minutos (300 segundos)
    const apiarios = await getCachedData(cacheKey, 300, async () => {
      return await getApiariosByEmpresa(id_empresa);
    });

    res.status(200).json({
      success: true,
      data: apiarios,
    });
  } catch (error: any) {
    console.error('Error obteniendo apiarios:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener apiarios',
    });
  }
}

export async function getApiarioByIdHandler(req: Request, res: Response) {
  try {
    const { apiarioId } = req.params;

    if (!apiarioId) {
      return res.status(400).json({
        success: false,
        error: 'apiarioId es requerido',
      });
    }

    const apiario = await getApiarioById(apiarioId);

    if (!apiario) {
      return res.status(404).json({
        success: false,
        error: 'Apiario no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: apiario,
    });
  } catch (error: any) {
    console.error('Error obteniendo apiario:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener apiario',
    });
  }
}

export async function createColmenaHandler(req: AuthRequest, res: Response) {
  try {
    const {
      nombre_colmena,
      id_apiario_actual,
      id_dispositivo,
      fecha_instalacion,
    } = req.body;

    if (!nombre_colmena || !id_apiario_actual) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: nombre_colmena, id_apiario_actual',
      });
    }

    const id_empresa = req.user!.id_empresa;

    const payload: ColmenaInput = {
      nombre_colmena,
      id_apiario_actual,
      id_dispositivo,
      fecha_instalacion,
    };

    const colmena = await createColmena(id_empresa, payload);

    res.status(201).json({
      success: true,
      data: colmena,
    });
  } catch (error: any) {
    console.error('Error creando colmena:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear colmena',
    });
  }
}

export async function getColmenasHandler(req: AuthRequest, res: Response) {
  try {
    const { id_apiario } = req.query;
    const id_empresa = req.user!.id_empresa;

    if (id_apiario) {
      const colmenas = await getColmenasByApiario(id_apiario as string);
      return res.status(200).json({
        success: true,
        data: colmenas,
      });
    }

    const colmenas = await getColmenasByEmpresa(id_empresa);
    return res.status(200).json({
      success: true,
      data: colmenas,
    });
  } catch (error: any) {
    console.error('Error obteniendo colmenas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener colmenas',
    });
  }
}
