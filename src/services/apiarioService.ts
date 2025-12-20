import { db } from '../config/db';
import { apiario, colmena, ubicacion_apiario, dispositivo_simonia } from '../config/db/schema';
import { eq, inArray } from 'drizzle-orm';

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
  const apiarios = await db.select().from(apiario).where(eq(apiario.id_empresa, empresaId));

  if (apiarios.length === 0) return [];

  const apiarioIds = apiarios.map(a => a.id);
  const allUbicaciones = await db
    .select()
    .from(ubicacion_apiario)
    .where(inArray(ubicacion_apiario.id_apiario, apiarioIds));

  const result = apiarios.map(api => ({
    ...api,
    ubicacion_apiario: allUbicaciones.filter(u => u.id_apiario === api.id)
  }));

  return result;
}

export async function getApiarioById(apiarioId: string) {
  const apiarios = await db.select().from(apiario).where(eq(apiario.id, apiarioId));
  if (apiarios.length === 0) return null;

  const api = apiarios[0];
  if (!api) return null;

  const ubicaciones = await db.select().from(ubicacion_apiario).where(eq(ubicacion_apiario.id_apiario, api.id));

  const colmenasWithDevices = await db
    .select({
      colmena: colmena,
      dispositivo_simonia: dispositivo_simonia,
    })
    .from(colmena)
    .leftJoin(dispositivo_simonia, eq(colmena.id_dispositivo, dispositivo_simonia.id))
    .where(eq(colmena.id_apiario_actual, api.id));

  return {
    ...api,
    ubicacion_apiario: ubicaciones,
    colmena: colmenasWithDevices.map(row => ({
      ...row.colmena,
      dispositivo_simonia: row.dispositivo_simonia
    }))
  };
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
  const rows = await db
    .select({
      colmena: colmena,
      dispositivo_simonia: dispositivo_simonia,
    })
    .from(colmena)
    .leftJoin(dispositivo_simonia, eq(colmena.id_dispositivo, dispositivo_simonia.id))
    .where(eq(colmena.id_apiario_actual, apiarioId));

  return rows.map(row => ({
    ...row.colmena,
    dispositivo_simonia: row.dispositivo_simonia
  }));
}

export async function getColmenasByEmpresa(empresaId: string) {
  const rows = await db
    .select({
      colmena: colmena,
      apiario: apiario,
      dispositivo_simonia: dispositivo_simonia,
    })
    .from(colmena)
    .leftJoin(apiario, eq(colmena.id_apiario_actual, apiario.id))
    .leftJoin(dispositivo_simonia, eq(colmena.id_dispositivo, dispositivo_simonia.id))
    .where(eq(colmena.id_empresa, empresaId));

  return rows.map(row => ({
    ...row.colmena,
    apiario: row.apiario,
    dispositivo_simonia: row.dispositivo_simonia
  }));
}
