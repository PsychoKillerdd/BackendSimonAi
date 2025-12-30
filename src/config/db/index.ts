import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 🔑 Conexión a Supabase (Directa o Pooler)
const connectionString = process.env.SUPABASE_DB_URL!;

// Detectar si estamos usando pooler (puerto 6543) o conexión directa (5432)
const isPooler = connectionString.includes(':6543');

const client = postgres(connectionString, {
  max: isPooler ? 10 : 3,       // Menos conexiones si es directa (tiene límite)
  idle_timeout: 20,             // Cerrar conexiones inactivas después de 20s
  connect_timeout: 30,          // Timeout más largo para redes lentas
  prepare: isPooler ? false : true,  // Solo desactivar prepare si es pooler
  ssl: 'require',               // SSL requerido para Supabase
});

export const db = drizzle(client, { schema });
