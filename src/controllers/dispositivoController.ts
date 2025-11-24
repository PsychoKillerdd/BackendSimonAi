import type { Request, Response } from 'express';
import {
  createDispositivo,
  getDispositivoById,
  getDispositivoByCodigo,
  getAllDispositivos,
  getDispositivosByEmpresa,
  getDispositivosSinAsignar,
  updateDispositivoEstado,
  asignarDispositivoAEmpresa,
  type DispositivoInput,
} from '../services/dispositivoService';
import type { AuthRequest } from '../middlewares/authMiddleware';

export async function createDispositivoHandler(req: Request, res: Response) {
  try {
    const { codigo_unico, modelo, firmware_version, estado } = req.body;

    if (!codigo_unico) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: codigo_unico',
      });
    }

    // ✅ NO asignar propietario al crear - dispositivo queda en inventario de SimonIA
    // El propietario se asigna después con PATCH
    const payload: DispositivoInput = {
      codigo_unico,
      id_propietario: null, // Sin propietario inicialmente
      modelo,
      firmware_version,
      estado,
    };

    const dispositivo = await createDispositivo(payload);

    res.status(201).json({
      success: true,
      data: dispositivo,
      message: 'Dispositivo creado. Use PATCH para asignar a una empresa.'
    });
  } catch (error: any) {
    console.error('Error creando dispositivo:', error);
    
    // Detectar error de código duplicado
    if (error?.code === '23505' || error?.message?.includes('unique') || error?.message?.includes('duplicate')) {
      return res.status(409).json({ 
        success: false, 
        error: 'El código único del dispositivo ya existe',
        field: 'codigo_unico'
      });
    }
    
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

export async function getDispositivosByEmpresaHandler(req: Request, res: Response) {
  try {
    const { id_empresa } = req.query;
    
    if (!id_empresa) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: id_empresa'
      });
    }
    
    const dispositivos = await getDispositivosByEmpresa(id_empresa as string);

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

export async function updateDispositivoEstadoHandler(req: Request, res: Response) {
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

export async function asignarDispositivoHandler(req: Request, res: Response) {
  try {
    const { dispositivoId } = req.params;
    const { id_empresa } = req.body;

    if (!dispositivoId || !id_empresa) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: dispositivoId (params), id_empresa (body)',
      });
    }

    // Verificar que el dispositivo existe
    const dispositivoExistente = await getDispositivoById(dispositivoId);
    if (!dispositivoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Dispositivo no encontrado',
      });
    }

    // Verificar si ya está asignado
    if (dispositivoExistente.id_propietario) {
      return res.status(400).json({
        success: false,
        error: 'El dispositivo ya está asignado a una empresa',
        current_owner: dispositivoExistente.id_propietario
      });
    }

    const dispositivo = await asignarDispositivoAEmpresa(dispositivoId, id_empresa);

    res.status(200).json({
      success: true,
      data: dispositivo,
      message: 'Dispositivo asignado exitosamente'
    });
  } catch (error: any) {
    console.error('Error asignando dispositivo a empresa:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al asignar dispositivo',
    });
  }
}

export async function getDispositivosSinAsignarHandler(req: Request, res: Response) {
  try {
    const dispositivos = await getDispositivosSinAsignar();

    res.status(200).json({
      success: true,
      data: dispositivos,
      count: dispositivos.length
    });
  } catch (error: any) {
    console.error('Error obteniendo dispositivos sin asignar:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener dispositivos',
    });
  }
}
