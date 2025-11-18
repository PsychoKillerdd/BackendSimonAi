import { db } from '../config/db';
import { apiario, colmena, ubicacion_apiario, dispositivo_simonia } from '../config/db/schema';
import { eq } from 'drizzle-orm';

export type ApiarioInput = {
  nombre: string;
  limite_colmenas?: number;
  locacion: string; // ubicación inicial del apiario
};

export type ColmenaInput = {
  nombre_colmena: string;
  id_apiario_actual: string;
  id_dispositivo?: string;
  fecha_instalacion?: string;
};

export async function createApiarioWithUbicacion(empresaId: string, payload: ApiarioInput) {
  // Crear apiario
  const apiarioPayload = {
    id_empresa: empresaId,
    nombre: payload.nombre,
    limite_colmenas: payload.limite_colmenas ?? 100,
  };

  const apiarioResult = await db.insert(apiario).values(apiarioPayload).returning();
  const apiarioData = apiarioResult[0];

  if (!apiarioData) {
    throw new Error('Error al crear el apiario');
  }

  // Crear ubicación inicial del apiario
  const ubicacionPayload = {
    id_apiario: apiarioData.id,
    locacion: payload.locacion,
  };

  const ubicacionResult = await db.insert(ubicacion_apiario).values(ubicacionPayload).returning();

  return {
    apiario: apiarioData,
    ubicacion: ubicacionResult[0],
  };
}

export async function getApiariosByEmpresa(empresaId: string) {
  // Nota: Drizzle no soporta joins automáticos como Supabase
  // Por ahora retornamos solo los apiarios
  const apiarios = await db.select().from(apiario).where(eq(apiario.id_empresa, empresaId));
  
  // Para obtener ubicaciones, necesitarías hacer queries separados o usar leftJoin
  // Ejemplo con datos adicionales:
  const result = [];
  for (const api of apiarios) {
    const ubicaciones = await db.select().from(ubicacion_apiario).where(eq(ubicacion_apiario.id_apiario, api.id));
    result.push({ ...api, ubicacion_apiario: ubicaciones });
  }
  
  return result;
}

export async function getApiarioById(apiarioId: string) {
  const apiarios = await db.select().from(apiario).where(eq(apiario.id, apiarioId));
  if (apiarios.length === 0) return null;
  
  const api = apiarios[0];
  if (!api) return null;
  
  const ubicaciones = await db.select().from(ubicacion_apiario).where(eq(ubicacion_apiario.id_apiario, api.id));
  const colmenas = await db.select().from(colmena).where(eq(colmena.id_apiario_actual, api.id));
  
  return { ...api, ubicacion_apiario: ubicaciones, colmena: colmenas };
}

export async function createColmena(empresaId: string, payload: ColmenaInput) {
  const colmenaPayload: any = {
    nombre_colmena: payload.nombre_colmena,
    id_apiario_actual: payload.id_apiario_actual,
    id_empresa: empresaId,
  };

  if (payload.id_dispositivo) {
    colmenaPayload.id_dispositivo = payload.id_dispositivo;
  }

  if (payload.fecha_instalacion) {
    colmenaPayload.fecha_instalacion = payload.fecha_instalacion;
  }

  const result = await db.insert(colmena).values(colmenaPayload).returning();
  return result[0];
}

export async function getColmenasByApiario(apiarioId: string) {
  const colmenas = await db.select().from(colmena).where(eq(colmena.id_apiario_actual, apiarioId));
  
  const result = [];
  for (const col of colmenas) {
    if (col.id_dispositivo) {
      const dispositivos = await db.select().from(dispositivo_simonia).where(eq(dispositivo_simonia.id, col.id_dispositivo));
      result.push({ ...col, dispositivo_simonia: dispositivos[0] || null });
    } else {
      result.push({ ...col, dispositivo_simonia: null });
    }
  }
  
  return result;
}

export async function getColmenasByEmpresa(empresaId: string) {
  const colmenas = await db.select().from(colmena).where(eq(colmena.id_empresa, empresaId));
  
  const result = [];
  for (const col of colmenas) {
    const apiarios = col.id_apiario_actual ? await db.select().from(apiario).where(eq(apiario.id, col.id_apiario_actual)) : [];
    const dispositivos = col.id_dispositivo ? await db.select().from(dispositivo_simonia).where(eq(dispositivo_simonia.id, col.id_dispositivo)) : [];
    
    result.push({
      ...col,
      apiario: apiarios[0] || null,
      dispositivo_simonia: dispositivos[0] || null
    });
  }
  
  return result;
}
