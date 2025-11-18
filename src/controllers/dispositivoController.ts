import type { Request, Response } from 'express';
import {
  createDispositivo,
  getDispositivoById,
  getDispositivoByCodigo,
  getAllDispositivos,
  getDispositivosByEmpresa,
  updateDispositivoEstado,
  type DispositivoInput,
} from '../services/dispositivoService';
import type { AuthRequest } from '../middlewares/authMiddleware';

export async function createDispositivoHandler(req: AuthRequest, res: Response) {
  try {
    const { codigo_unico, modelo, firmware_version, estado } = req.body;

    if (!codigo_unico) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: codigo_unico',
      });
    }

    const id_propietario = req.user!.id_empresa;

    const payload: DispositivoInput = {
      codigo_unico,
      id_propietario,
      modelo,
      firmware_version,
      estado,
    };

    const dispositivo = await createDispositivo(payload);

    res.status(201).json({
      success: true,
      data: dispositivo,
    });
  } catch (error: any) {
    console.error('Error creando dispositivo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear dispositivo',
    });
  }
}

export async function getDispositivoByIdHandler(req: Request, res: Response) {
  try {
    const { dispositivoId } = req.params;

    if (!dispositivoId) {
      return res.status(400).json({
        success: false,
        error: 'dispositivoId es requerido',
      });
    }

    const dispositivo = await getDispositivoById(dispositivoId);

    if (!dispositivo) {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: dispositivo,
    });
  } catch (error: any) {
    console.error('Error obteniendo dispositivo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener dispositivo',
    });
  }
}

export async function getDispositivoByCodigoHandler(req: Request, res: Response) {
  try {
    const { codigo } = req.params;

    if (!codigo) {
      return res.status(400).json({
        success: false,
        error: 'codigo es requerido',
      });
    }

    const dispositivo = await getDispositivoByCodigo(codigo);

    if (!dispositivo) {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: dispositivo,
    });
  } catch (error: any) {
    console.error('Error obteniendo dispositivo por código:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener dispositivo',
    });
  }
}

export async function getAllDispositivosHandler(req: Request, res: Response) {
  try {
    const dispositivos = await getAllDispositivos();

    res.status(200).json({
      success: true,
      data: dispositivos,
    });
  } catch (error: any) {
    console.error('Error obteniendo dispositivos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener dispositivos',
    });
  }
}

export async function getDispositivosByEmpresaHandler(req: AuthRequest, res: Response) {
  try {
    const id_empresa = req.user!.id_empresa;
    const dispositivos = await getDispositivosByEmpresa(id_empresa);

    res.status(200).json({
      success: true,
      data: dispositivos,
    });
  } catch (error: any) {
    console.error('Error obteniendo dispositivos de la empresa:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener dispositivos',
    });
  }
}

export async function updateDispositivoEstadoHandler(req: AuthRequest, res: Response) {
  try {
    const { dispositivoId } = req.params;
    const { estado } = req.body;

    if (!dispositivoId || !estado) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: dispositivoId, estado',
      });
    }

    const dispositivo = await updateDispositivoEstado(dispositivoId, estado);

    res.status(200).json({
      success: true,
      data: dispositivo,
    });
  } catch (error: any) {
    console.error('Error actualizando estado del dispositivo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar estado',
    });
  }
}
