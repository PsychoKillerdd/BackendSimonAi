import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Usamos el Pooler de Supabase en modo TRANSACTION (puerto 6543)
 * y desactivamos 'prepare' para garantizar que las consultas siempre funcionen
 * sin errores de sesión o de DNS (ya que el host directo es solo IPv6).
 */
const connectionString = process.env.SUPABASE_DB_URL || "postgresql://postgres.fcruzeyalswgckqcuybm:EWBKBgyRf8sbO03d@aws-0-us-west-2.pooler.supabase.com:6543/postgres";

const client = postgres(connectionString, {
  prepare: false, // Obligatorio para el modo Transaction y mayor estabilidad
});

export const db = drizzle(client, { schema });


