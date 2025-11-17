import type { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../services/authService';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    correo: string;
    id_empresa: string;
    tipo_usuario: string;
  };
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token no proporcionado',
    });
  }

  try {
    const decoded = verifyJwt(token);
    req.user = {
      id: decoded.id,
      correo: decoded.correo,
      id_empresa: decoded.id_empresa,
      tipo_usuario: decoded.tipo_usuario,
    };
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Token inválido o expirado',
    });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Usuario no autenticado',
    });
  }

  if (req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador',
    });
  }

  next();
}
