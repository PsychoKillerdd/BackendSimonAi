import type { Request, Response } from 'express';
import { createEmpresa, getAllEmpresas, getEmpresaById, getEmpresasPaginated, createSuscripcion, createUsuarioWithRole, initUsoEmpresa, initConfiguracionReporte, onboardEmpresa } from '../services/empresaService';
import PLANS from '../config/plans';
import supabase from '../config/db/supbase';

export async function createEmpresaHandler(req: Request, res: Response) {
  try {
    const { nombre, pais, direccion, telefono, correo_contacto } = req.body;

    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ success: false, message: 'El campo "nombre" es obligatorio y debe ser texto.' });
    }

    const payload = {
      nombre: nombre.trim(),
      pais,
      direccion,
      telefono: telefono ? Number(telefono) : undefined,
      correo_contacto,
    };

    const empresa = await createEmpresa(payload);
    return res.status(201).json({ success: true, data: empresa });
  } catch (error: any) {
    console.error('Error al crear empresa:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al crear empresa' });
  }
}

export async function getAllEmpresasHandler(req: Request, res: Response) {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    // Si no hay parámetros de paginación, usar método sin paginación
    if (!page && !limit) {
      const empresas = await getAllEmpresas();
      return res.status(200).json({ success: true, data: empresas });
    }

    // Usar paginación
    const result = await getEmpresasPaginated({
      page: page as string | undefined,
      limit: limit as string | undefined,
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error al obtener empresas:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al obtener empresas' });
  }
}

export async function getEmpresaByIdHandler(req: Request, res: Response) {
  try {
    const empresaId = req.params.empresaId;
    
    if (!empresaId || empresaId.length < 10) {
      return res.status(400).json({ success: false, message: 'empresaId inválido' });
    }

    const empresa = await getEmpresaById(empresaId);
    
    if (!empresa) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    }

    return res.status(200).json({ success: true, data: empresa });
  } catch (error: any) {
    console.error('Error al obtener empresa por ID:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al obtener empresa' });
  }
}

export async function createAdminHandler(req: Request, res: Response) {
  try {
    const empresaId = req.params.empresaId;
    if (!empresaId) return res.status(400).json({ success: false, message: 'empresaId inválido' });

    // obtener empresa para obtener correo de contacto si no se provee
    const { data: empresaData, error: empresaErr } = await supabase.from('empresa').select('*').eq('id', empresaId).maybeSingle();
    if (empresaErr) throw empresaErr;

    const body = req.body || {};
    const correo = body.correo || empresaData?.correo_contacto;
    const nombre = body.nombre || (correo ? correo.split('@')[0] : 'Admin');

    if (!correo) return res.status(400).json({ success: false, message: 'correo no proporcionado y empresa no tiene correo_contacto' });

    const payload = {
      nombre,
      correo,
      tipo_usuario: 'admin',
      roleName: 'admin'
    };

    const result = await createUsuarioWithRole(empresaId, payload as any);
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error al crear admin desde empresa:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al crear admin' });
  }
}

export async function createSuscripcionHandler(req: Request, res: Response) {
  try {
    const empresaId = req.params.empresaId;
    if (!empresaId) return res.status(400).json({ success: false, message: 'empresaId inválido' });

    // Apply plan defaults; if no plan provided, default to 'free'
    const payload = { ...req.body };
    if (!payload.plan) payload.plan = 'free';
    if (payload.plan && typeof payload.plan === 'string') {
      const planKey = payload.plan.toLowerCase();
      const plan = (PLANS as any)[planKey];
      if (plan) {
        // Only set fields that are undefined in payload so client can override
        if (typeof payload.max_colmenas === 'undefined') payload.max_colmenas = plan.max_colmenas;
        if (typeof payload.max_apiarios === 'undefined') payload.max_apiarios = plan.max_apiarios;
        if (typeof payload.max_usuarios === 'undefined') payload.max_usuarios = plan.max_usuarios;
        if (typeof payload.precio_mensual === 'undefined') payload.precio_mensual = plan.precio_mensual;
      }
    }

    const suscripcion = await createSuscripcion(empresaId as any, payload);
    return res.status(201).json({ success: true, data: suscripcion });
  } catch (error: any) {
    console.error('Error al crear suscripción:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al crear suscripción' });
  }
}

export async function createUsuarioHandler(req: Request, res: Response) {
  try {
    const empresaId = req.params.empresaId;
    if (!empresaId) return res.status(400).json({ success: false, message: 'empresaId inválido' });

    const payload = req.body;
    if (!payload.nombre || !payload.correo || !payload.tipo_usuario) {
      return res.status(400).json({ success: false, message: 'nombre, correo y tipo_usuario son obligatorios' });
    }

    const result = await createUsuarioWithRole(empresaId as any, payload);
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al crear usuario' });
  }
}

export async function initEmpresaHandler(req: Request, res: Response) {
  try {
    const empresaId = req.params.empresaId;
    if (!empresaId) return res.status(400).json({ success: false, message: 'empresaId inválido' });

    const uso = await initUsoEmpresa(empresaId as any);
    const config = await initConfiguracionReporte(empresaId as any);
    return res.status(201).json({ success: true, data: { uso, config } });
  } catch (error: any) {
    console.error('Error al inicializar empresa:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al inicializar empresa' });
  }
}

export async function onboardEmpresaHandler(req: Request, res: Response) {
  try {
    const { empresaId, suscripcion, admin } = req.body;
    if (!empresaId) return res.status(400).json({ success: false, message: 'empresaId inválido' });

    const result = await onboardEmpresa(empresaId, { suscripcion, admin });
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error en onboard compuesto:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno en onboarding' });
  }
}
