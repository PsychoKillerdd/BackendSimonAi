import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// 🔑 Usa la URL que te da Supabase en Configuración → Database → Connection string (URI)
const client = postgres(process.env.SUPABASE_DB_URL!, {
  max: 5, // evita múltiples conexiones en entornos serverless
});

export const db = drizzle(client, { schema });
