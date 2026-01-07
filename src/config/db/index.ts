import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";


const connectionString = process.env.SUPABASE_DB_URL || "postgresql://postgres.fcruzeyalswgckqcuybm:EWBKBgyRf8sbO03d@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

const client = postgres(connectionString, { 
  prepare: false,
  max: 5,                   // Menos conexiones = menos saturación en el pooler
  idle_timeout: 20,         // Cerrar conexiones inactivas rápido
  connect_timeout: 10,      // Si no conecta en 10s, que falle rápido para reintentar
  max_lifetime: 60 * 5,     // Forzar refresco de conexión cada 5 minutos (evita conexiones stale)
})


export const db = drizzle(client, { schema });
