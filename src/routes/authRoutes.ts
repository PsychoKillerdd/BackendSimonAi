import express from 'express';
import authService from '../services/authService';
import supabase from '../config/db/supbase';

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) return res.status(400).json({ success: false, message: 'correo y password son obligatorios' });

    const { data: usuario, error } = await supabase.from('usuario').select('*').ilike('correo', correo).maybeSingle();
    if (error) throw error;
    if (!usuario || !usuario.password_hash) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const valid = await authService.verifyPassword(password, usuario.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Credenciales inválidas' });

    const token = authService.generateJwt({ id: usuario.id, correo: usuario.correo, id_empresa: usuario.id_empresa, tipo_usuario: usuario.tipo_usuario });
    return res.json({ success: true, token, user: { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre, id_empresa: usuario.id_empresa } });
  } catch (err: any) {
    console.error('Login error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error interno' });
  }
});

// POST /auth/register - this will create usuario record with password (for internal use)
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, password, tipo_usuario, id_empresa, roleName, fecha_nacimiento, direccion, ciudad, region, pais, rut, telefono } = req.body;
    if (!nombre || !correo || !password) return res.status(400).json({ success: false, message: 'nombre, correo y password son obligatorios' });

    // reuse createUsuarioWithRole located in empresaService
    const { createUsuarioWithRole } = await import('../services/empresaService');
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
    };
    if (roleName) payload.roleName = roleName;

    // pass id_empresa as-is (DB may use UUIDs or integers depending on schema)
    const result = await createUsuarioWithRole(id_empresa ?? null, payload);
    return res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    console.error('Register error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Error interno' });
  }
});

export default router;
