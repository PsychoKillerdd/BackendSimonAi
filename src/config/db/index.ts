import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";


const connectionString = process.env.SUPABASE_DB_URL || "postgresql://postgres.fcruzeyalswgckqcuybm:EWBKBgyRf8sbO03d@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema });
