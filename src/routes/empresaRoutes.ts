import express from 'express';
import { createEmpresa } from '../services/empresaService';

const router = express.Router();

// POST /api/empresas
router.post('/empresas', async (req, res) => {
  try {
    const { nombre, pais, direccion, numero_telefono, correo_contacto } = req.body;

    if (!nombre || typeof nombre !== 'string') {
      return res.status(400).json({ success: false, message: 'El campo "nombre" es obligatorio y debe ser texto.' });
    }

    const payload = {
      nombre: nombre.trim(),
      pais,
      direccion,
      numero_telefono: numero_telefono ? Number(numero_telefono) : undefined,
      correo_contacto,
    };

    const empresa = await createEmpresa(payload);

    return res.status(201).json({ success: true, data: empresa });
  } catch (error: any) {
    console.error('Error al crear empresa:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error interno al crear empresa' });
  }
});

export default router;
