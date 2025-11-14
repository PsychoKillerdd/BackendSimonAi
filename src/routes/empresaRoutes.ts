import express from 'express';
import { createEmpresa, getAllEmpresas, getEmpresasPaginated, getEmpresaById, createSuscripcion, createUsuarioWithRole, initUsoEmpresa, initConfiguracionReporte, onboardEmpresa } from '../services/empresaService';
import PLANS from '../config/plans';

const router = express.Router();

// POST /api/empresas
router.post('/empresas', async (req, res) => {
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
});

// GET /api/empresas/:empresaId - obtener empresa por ID (debe ir ANTES del GET genérico)
router.get('/empresas/:empresaId', async (req, res) => {
  try {
    const empresaId = req.params.empresaId;
    
    // Validar que sea un UUID válido (formato básico)
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
});

// GET /api/empresas - con paginación
router.get('/empresas', async (req, res) => {
  try {
    // Extraer parámetros de paginación de query string
    const { page, limit, sortBy, sortOrder } = req.query;

    // Si no hay parámetros de paginación, usar método sin paginación (compatible con código existente)
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
});


  // POST /api/empresas/:empresaId/create-admin - crear admin a partir de la empresa (correo de empresa por defecto)
  router.post('/empresas/:empresaId/create-admin', async (req, res) => {
    try {
      const empresaId = Number(req.params.empresaId);
      if (!empresaId) return res.status(400).json({ success: false, message: 'empresaId inválido' });

      // obtener empresa para obtener correo de contacto si no se provee
      const { supabase } = await import('../config/db/supbase');
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
  });

// POST /api/empresas/:empresaId/suscripcion
router.post('/empresas/:empresaId/suscripcion', async (req, res) => {
  try {
    const empresaId = Number(req.params.empresaId);
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

    const suscripcion = await createSuscripcion(empresaId, payload);
    return res.status(201).json({ success: true, data: suscripcion });
  } catch (error: any) {
    console.error('Error al crear suscripción:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al crear suscripción' });
  }
});

// POST /api/empresas/:empresaId/usuarios
router.post('/empresas/:empresaId/usuarios', async (req, res) => {
  try {
    const empresaId = Number(req.params.empresaId);
    if (!empresaId) return res.status(400).json({ success: false, message: 'empresaId inválido' });

    const payload = req.body;
    if (!payload.nombre || !payload.correo || !payload.tipo_usuario) {
      return res.status(400).json({ success: false, message: 'nombre, correo y tipo_usuario son obligatorios' });
    }

    const result = await createUsuarioWithRole(empresaId, payload);
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al crear usuario' });
  }
});

// POST /api/empresas/:empresaId/init - inicializar uso_empresa y configuracion_reporte
router.post('/empresas/:empresaId/init', async (req, res) => {
  try {
    const empresaId = Number(req.params.empresaId);
    if (!empresaId) return res.status(400).json({ success: false, message: 'empresaId inválido' });

    const uso = await initUsoEmpresa(empresaId);
    const config = await initConfiguracionReporte(empresaId);
    return res.status(201).json({ success: true, data: { uso, config } });
  } catch (error: any) {
    console.error('Error al inicializar empresa:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al inicializar empresa' });
  }
});

// POST /api/empresas/onboard - endpoint compuesto (no atómico)
router.post('/empresas/onboard', async (req, res) => {
  try {
    const { empresaId, suscripcion, admin } = req.body;
    const id = Number(empresaId);
    if (!id) return res.status(400).json({ success: false, message: 'empresaId inválido' });

    const result = await onboardEmpresa(id, { suscripcion, admin });
    return res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error en onboard compuesto:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno en onboarding' });
  }
});

export default router;
