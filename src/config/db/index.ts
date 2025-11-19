import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// 🔑 Usa la URL que te da Supabase en Configuración → Database → Connection string (URI)
const client = postgres(process.env.SUPABASE_DB_URL!, {
  max: 2, // evita múltiples conexiones en entornos serverless
});

export const db = drizzle(client);
