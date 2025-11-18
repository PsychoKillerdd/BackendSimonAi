import { db } from '../config/db';
import { lectura_sensor, dispositivo_simonia, colmena } from '../config/db/schema';
import { eq, desc } from 'drizzle-orm';

export type LecturaInput = {
  codigo_dispositivo: string; // codigo_unico del dispositivo físico
  temperatura_c?: number;
  humedad_h?: number;
  peso_kg?: number;
  sonido_hz?: number;
  presion_hpa?: number;
};

export async function createLecturaSensorByCodigo(payload: LecturaInput) {
  // Buscar dispositivo por codigo_unico
  const dispositivoRows = await db
    .select()
    .from(dispositivo_simonia)
    .where(eq(dispositivo_simonia.codigo_unico, payload.codigo_dispositivo));
  const dispositivo = dispositivoRows[0];
  if (!dispositivo) throw new Error('Dispositivo no encontrado');

  // Buscar colmena asociada al dispositivo
  const colmenaRows = await db
    .select()
    .from(colmena)
    .where(eq(colmena.id_dispositivo, dispositivo.id));
  const colmenaAsignada = colmenaRows[0];
  if (!colmenaAsignada) throw new Error('El dispositivo no está asignado a ninguna colmena');

  // Validar que existe al menos un dato de sensor
  if (
    payload.temperatura_c === undefined &&
    payload.humedad_h === undefined &&
    payload.peso_kg === undefined &&
    payload.sonido_hz === undefined &&
    payload.presion_hpa === undefined
  ) {
    throw new Error('Debe enviar al menos un valor de sensor');
  }

  const insertValues: any = {
    id_colmena: colmenaAsignada.id,
  };

  if (payload.temperatura_c !== undefined) insertValues.temperatura_c = payload.temperatura_c;
  if (payload.humedad_h !== undefined) insertValues.humedad_h = payload.humedad_h;
  if (payload.peso_kg !== undefined) insertValues.peso_kg = payload.peso_kg;
  if (payload.sonido_hz !== undefined) insertValues.sonido_hz = payload.sonido_hz;
  if (payload.presion_hpa !== undefined) insertValues.presion_hpa = payload.presion_hpa;

  const result = await db.insert(lectura_sensor).values(insertValues).returning();
  return {
    lectura: result[0],
    colmena: { id: colmenaAsignada.id, nombre_colmena: colmenaAsignada.nombre_colmena },
    dispositivo: { id: dispositivo.id, codigo_unico: dispositivo.codigo_unico },
  };
}

export async function getLecturasByColmena(colmenaId: string, limit = 50) {
  return await db
    .select()
    .from(lectura_sensor)
    .where(eq(lectura_sensor.id_colmena, colmenaId))
    .orderBy(desc(lectura_sensor.fecha_registro))
    .limit(limit);
}

export async function getLecturasByCodigoDispositivo(codigo_unico: string, limit = 50) {
  const dispositivoRows = await db
    .select()
    .from(dispositivo_simonia)
    .where(eq(dispositivo_simonia.codigo_unico, codigo_unico));
  const dispositivo = dispositivoRows[0];
  if (!dispositivo) throw new Error('Dispositivo no encontrado');

  const colmenaRows = await db
    .select()
    .from(colmena)
    .where(eq(colmena.id_dispositivo, dispositivo.id));
  const colmenaAsignada = colmenaRows[0];
  if (!colmenaAsignada) throw new Error('El dispositivo no está asignado a ninguna colmena');

  return await getLecturasByColmena(colmenaAsignada.id, limit);
}

export async function getUltimaLecturaByColmena(colmenaId: string) {
  const rows = await db
    .select()
    .from(lectura_sensor)
    .where(eq(lectura_sensor.id_colmena, colmenaId))
    .orderBy(desc(lectura_sensor.fecha_registro))
    .limit(1);
  return rows[0] || null;
}
