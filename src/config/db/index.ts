import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";


const connectionString = process.env.SUPABASE_DB_URL || "postgresql://postgres.fcruzeyalswgckqcuybm:EWBKBgyRf8sbO03d@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

const client = postgres(connectionString, {
  prepare: true,            // ¡Ahora sí! El modo Session lo soporta y es más estable
  max: 10,                  // Subimos a 10 conexiones para manejar ráfagas
  idle_timeout: 30,         // Mantener conexiones abiertas un poco más (menos reconexiones)
  connect_timeout: 30,      // Damos hasta 30 segundos para el apretón de manos inicial
  onnotice: () => { },       // Silenciar avisos innecesarios
})



export const db = drizzle(client, { schema });
