import type { Request, Response } from 'express';
import authService from '../services/authService';
import { createUsuarioWithRole, getUsuarioById } from '../services/empresaService';
import type { AuthRequest } from '../middlewares/authMiddleware';

export async function getProfileHandler(req: AuthRequest, res: Response) {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const profile = await getUsuarioById(usuarioId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Perfil no encontrado' });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (err: any) {
    console.error('Profile error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error interno' });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ success: false, message: 'correo y password son obligatorios' });
    }

    const usuario = await authService.findUsuarioByCorreo(correo);
    if (!usuario || !usuario.password) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const valid = await authService.verifyPassword(password, usuario.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = authService.generateJwt({
      id: usuario.id,
      correo: usuario.correo,
      id_empresa: usuario.id_empresa,
      tipo_usuario: usuario.tipo_usuario
    });

    return res.json({
      success: true,
      token,
      user: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        id_empresa: usuario.id_empresa,
        foto_url: usuario.foto_url
      }
    });
  } catch (err: any) {
    console.error('Login error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error interno' });
  }
}

export async function registerHandler(req: Request, res: Response) {
  try {
    const {
      nombre,
      correo,
      password,
      tipo_usuario,
      id_empresa,
      roleName,
      fecha_nacimiento,
      direccion,
      ciudad,
      region,
      pais,
      rut,
      telefono,
      foto_url
    } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ success: false, message: 'nombre, correo y password son obligatorios' });
    }

    const payload: any = {
      nombre,
      correo,
      tipo_usuario: tipo_usuario ?? 'apicultor',
      password,
      // include optional fields explicitly (will be set to null by service if undefined)
      fecha_nacimiento: typeof fecha_nacimiento !== 'undefined' ? fecha_nacimiento : undefined,
      direccion: typeof direccion !== 'undefined' ? direccion : undefined,
      ciudad: typeof ciudad !== 'undefined' ? ciudad : undefined,
      region: typeof region !== 'undefined' ? region : undefined,
      pais: typeof pais !== 'undefined' ? pais : undefined,
      rut: typeof rut !== 'undefined' ? rut : undefined,
      telefono: typeof telefono !== 'undefined' ? telefono : undefined,
      foto_url: typeof foto_url !== 'undefined' ? foto_url : undefined,
    };
    if (roleName) payload.roleName = roleName;

    // pass id_empresa as-is (DB may use UUIDs or integers depending on schema)
    const result = await createUsuarioWithRole(id_empresa ?? null, payload);
    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    console.error('Register error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error interno' });
  }
}
