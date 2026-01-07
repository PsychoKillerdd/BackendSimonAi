import { db } from '../config/db';
import { apiario, colmena, ubicacion_apiario, dispositivo_simonia, lectura_sensor, alerta } from '../config/db/schema';
import { eq, inArray, desc, and, sql } from 'drizzle-orm';
import { calcularIndiceVitalidad } from './analiticaService';

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
  tipo_colmena?: string;
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

  // Obtener colmenas con sus dispositivos
  const colmenasWithDevices = await db
    .select({
      colmena: colmena,
      dispositivo_simonia: dispositivo_simonia,
    })
    .from(colmena)
    .leftJoin(dispositivo_simonia, eq(colmena.id_dispositivo, dispositivo_simonia.id))
    .where(eq(colmena.id_apiario_actual, api.id));

  // Enriquecer cada colmena con su última lectura y alertas pendientes
  const enrichedColmenas = await Promise.all(colmenasWithDevices.map(async (row) => {
    // Obtener última lectura
    const ultimaLectura = await db
      .select()
      .from(lectura_sensor)
      .where(eq(lectura_sensor.id_colmena, row.colmena.id))
      .orderBy(desc(lectura_sensor.fecha_registro))
      .limit(1);

    // Obtener conteo de alertas pendientes
    const alertasPendientes = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerta)
      .where(
        and(
          eq(alerta.id_colmena, row.colmena.id),
          eq(alerta.estado, 'pendiente')
        )
      );

    const lectura = ultimaLectura[0];
    let salud = null;

    if (lectura) {
      const iv = calcularIndiceVitalidad(
        Number(lectura.sonido_hz || 0),
        Number(lectura.temperatura_c || 0)
      );
      salud = {
        iv: iv.score,
        estado: iv.estado
      };
    }

    return {
      ...row.colmena,
      dispositivo_simonia: row.dispositivo_simonia,
      ultima_lectura: lectura || null,
      alertas_pendientes: Number(alertasPendientes[0]?.count || 0),
      salud
    };
  }));

  return {
    ...api,
    ubicacion_apiario: ubicaciones,
    colmena: enrichedColmenas
  };
}

export async function createColmena(empresaId: string, payload: ColmenaInput) {
  const colmenaPayload: any = {
    nombre_colmena: payload.nombre_colmena,
    id_apiario_actual: payload.id_apiario_actual,
    id_empresa: empresaId,
    tipo_colmena: payload.tipo_colmena,
  };

  if (payload.id_dispositivo) {
    colmenaPayload.id_dispositivo = payload.id_dispositivo;
  }

  if (payload.fecha_instalacion) {
    colmenaPayload.fecha_instalacion = payload.fecha_instalacion;
  }

  // 🐝 Tipo de colmena (opcional)
  if (payload.tipo_colmena) {
    colmenaPayload.tipo_colmena = payload.tipo_colmena;
  }

  const result = await db.insert(colmena).values(colmenaPayload).returning();
  return result[0];
}


export async function getColmenasByApiario(apiarioId: string) {
  const colmenasWithDevices = await db
    .select({
      colmena: colmena,
      dispositivo_simonia: dispositivo_simonia,
    })
    .from(colmena)
    .leftJoin(dispositivo_simonia, eq(colmena.id_dispositivo, dispositivo_simonia.id))
    .where(eq(colmena.id_apiario_actual, apiarioId));

  return Promise.all(colmenasWithDevices.map(async (row) => {
    const ultimaLectura = await db
      .select()
      .from(lectura_sensor)
      .where(eq(lectura_sensor.id_colmena, row.colmena.id))
      .orderBy(desc(lectura_sensor.fecha_registro))
      .limit(1);

    const alertasPendientes = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerta)
      .where(
        and(
          eq(alerta.id_colmena, row.colmena.id),
          eq(alerta.estado, 'pendiente')
        )
      );

    const lectura = ultimaLectura[0];
    let salud = null;

    if (lectura) {
      const iv = calcularIndiceVitalidad(
        Number(lectura.sonido_hz || 0),
        Number(lectura.temperatura_c || 0)
      );
      salud = {
        iv: iv.score,
        estado: iv.estado
      };
    }

    return {
      ...row.colmena,
      dispositivo_simonia: row.dispositivo_simonia,
      ultima_lectura: lectura || null,
      alertas_pendientes: Number(alertasPendientes[0]?.count || 0),
      salud
    };
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

  return Promise.all(rows.map(async (row) => {
    const ultimaLectura = await db
      .select()
      .from(lectura_sensor)
      .where(eq(lectura_sensor.id_colmena, row.colmena.id))
      .orderBy(desc(lectura_sensor.fecha_registro))
      .limit(1);

    const alertasPendientes = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerta)
      .where(
        and(
          eq(alerta.id_colmena, row.colmena.id),
          eq(alerta.estado, 'pendiente')
        )
      );

    const lectura = ultimaLectura[0];
    let salud = null;

    if (lectura) {
      const iv = calcularIndiceVitalidad(
        Number(lectura.sonido_hz || 0),
        Number(lectura.temperatura_c || 0)
      );
      salud = {
        iv: iv.score,
        estado: iv.estado
      };
    }

    return {
      ...row.colmena,
      apiario: row.apiario,
      dispositivo_simonia: row.dispositivo_simonia,
      ultima_lectura: lectura || null,
      alertas_pendientes: Number(alertasPendientes[0]?.count || 0),
      salud
    };
  }));
}

export async function getColmenaById(colmenaId: string) {
  const rows = await db
    .select({
      colmena: colmena,
      apiario: apiario,
      dispositivo_simonia: dispositivo_simonia,
    })
    .from(colmena)
    .leftJoin(apiario, eq(colmena.id_apiario_actual, apiario.id))
    .leftJoin(dispositivo_simonia, eq(colmena.id_dispositivo, dispositivo_simonia.id))
    .where(eq(colmena.id, colmenaId));

  if (rows.length === 0) return null;

  const row = rows[0];
  if (!row) return null;

  return {
    ...row.colmena,
    apiario: row.apiario,
    dispositivo_simonia: row.dispositivo_simonia,
  };
}

export async function updateApiario(apiarioId: string, payload: Partial<ApiarioInput>) {
  const updateValues: any = {};
  if (payload.nombre) updateValues.nombre = payload.nombre;
  if (payload.limite_colmenas) updateValues.limite_colmenas = payload.limite_colmenas;

  const result = await db
    .update(apiario)
    .set(updateValues)
    .where(eq(apiario.id, apiarioId))
    .returning();

  if (payload.locacion) {
    await db
      .update(ubicacion_apiario)
      .set({ locacion: payload.locacion })
      .where(eq(ubicacion_apiario.id_apiario, apiarioId));
  }

  return result[0];
}

export async function deleteApiario(apiarioId: string) {
  const colmenasAsociadas = await db
    .select()
    .from(colmena)
    .where(eq(colmena.id_apiario_actual, apiarioId));

  if (colmenasAsociadas.length > 0) {
    throw new Error('No se puede eliminar un apiario que tiene colmenas asignadas.');
  }

  await db.delete(ubicacion_apiario).where(eq(ubicacion_apiario.id_apiario, apiarioId));
  const result = await db.delete(apiario).where(eq(apiario.id, apiarioId)).returning();
  return result[0];
}

export async function updateColmena(colmenaId: string, payload: Partial<ColmenaInput>) {
  const updateValues: any = { ...payload };
  delete updateValues.id; // Evitar actualizar ID si viene en el payload

  const result = await db
    .update(colmena)
    .set(updateValues)
    .where(eq(colmena.id, colmenaId))
    .returning();
  return result[0];
}

export async function deleteColmena(colmenaId: string) {
  // Opcional: Verificar si tiene lecturas y decidir si eliminarlas o impedir eliminación
  const result = await db.delete(colmena).where(eq(colmena.id, colmenaId)).returning();
  return result[0];
}
