import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.warn('[supbase] Aviso: SUPABASE_URL o SUPABASE_KEY no están configuradas en el entorno');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
