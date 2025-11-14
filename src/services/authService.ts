import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/db/supbase';

const JWT_SECRET = (process.env.JWT_SECRET || 'please-change-me') as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as string;



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
  const { data, error } = await supabase.from('usuario').select('*').ilike('correo', correo).maybeSingle();
  if (error) throw error;
  return data;
}

export default {
  hashPassword,
  verifyPassword,
  generateJwt,
  verifyJwt,
  findUsuarioByCorreo,
};
