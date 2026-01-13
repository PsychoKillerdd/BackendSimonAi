import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { usuario } from '../config/db/schema';
import { ilike } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '8h') as string;

// Validar que JWT_SECRET esté configurado correctamente
if (!JWT_SECRET || JWT_SECRET.length < 32) {
	console.error('⚠️ SEGURIDAD CRÍTICA: JWT_SECRET no está configurado o es muy corto (mínimo 32 caracteres)');
	if (process.env.NODE_ENV === 'production') {
		throw new Error('JWT_SECRET debe estar configurado en producción');
	}
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateJwt(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}

export async function findUsuarioByCorreo(correo: string) {
  const result = await db.select().from(usuario).where(ilike(usuario.correo, correo));
  return result[0] || null;
}

export default {
  hashPassword,
  verifyPassword,
  generateJwt,
  verifyJwt,
  findUsuarioByCorreo,
};
