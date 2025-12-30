import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 🔑 Conexión a Supabase con Pooler (PgBouncer)
const client = postgres(process.env.SUPABASE_DB_URL!, {
  max: 10,                    // Conexiones máximas del pool local
  idle_timeout: 20,           // Cerrar conexiones inactivas después de 20s
  connect_timeout: 10,        // Timeout de conexión de 10s
  prepare: false,             // ⚠️ CRÍTICO: Desactivar prepared statements para PgBouncer
});

export const db = drizzle(client, { schema });
