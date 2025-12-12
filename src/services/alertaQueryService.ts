import { db } from '../config/db';
import { alerta, tipo_alerta, colmena } from '../config/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// Obtener todas las alertas de una colmena
export async function getAlertasByColmena(colmenaId: string, limit = 50) {
  return await db
    .select({
      id: alerta.id,
      descripcion: alerta.descripcion,
      temperatura_c: alerta.temperatura_c,
      humedad_h: alerta.humedad_h,
      peso_kg: alerta.peso_kg,
      presion_hpa: alerta.presion_hpa,
      sonido_hz: alerta.sonido_hz,
      fecha_evento: alerta.fecha_evento,
      estado: alerta.estado,
      prioridad: alerta.prioridad,
      origen_alerta: alerta.origen_alerta,
      comentario_atencion: alerta.comentario_atencion,
      tipo_alerta: {
        nombre: tipo_alerta.nombre,
        codigo: tipo_alerta.codigo,
        color_hex: tipo_alerta.color_hex,
      },
    })
    .from(alerta)
    .leftJoin(tipo_alerta, eq(alerta.id_tipo_alerta, tipo_alerta.id))
    .where(eq(alerta.id_colmena, colmenaId))
    .orderBy(desc(alerta.fecha_evento))
    .limit(limit);
}

// Obtener todas las alertas de todas las colmenas de una empresa
export async function getAlertasByEmpresa(empresaId: string, limit = 100) {
  return await db
    .select({
      id: alerta.id,
      descripcion: alerta.descripcion,
      temperatura_c: alerta.temperatura_c,
      humedad_h: alerta.humedad_h,
      peso_kg: alerta.peso_kg,
      presion_hpa: alerta.presion_hpa,
      sonido_hz: alerta.sonido_hz,
      fecha_evento: alerta.fecha_evento,
      estado: alerta.estado,
      prioridad: alerta.prioridad,
      origen_alerta: alerta.origen_alerta,
      comentario_atencion: alerta.comentario_atencion,
      tipo_alerta: {
        nombre: tipo_alerta.nombre,
        codigo: tipo_alerta.codigo,
        color_hex: tipo_alerta.color_hex,
      },
      colmena: {
        id: colmena.id,
        nombre_colmena: colmena.nombre_colmena,
      },
    })
    .from(alerta)
    .leftJoin(tipo_alerta, eq(alerta.id_tipo_alerta, tipo_alerta.id))
    .leftJoin(colmena, eq(alerta.id_colmena, colmena.id))
    .where(eq(colmena.id_empresa, empresaId))
    .orderBy(desc(alerta.fecha_evento))
    .limit(limit);
}

// Obtener alertas pendientes de una colmena
export async function getAlertasPendientesByColmena(colmenaId: string) {
  return await db
    .select({
      id: alerta.id,
      descripcion: alerta.descripcion,
      temperatura_c: alerta.temperatura_c,
      humedad_h: alerta.humedad_h,
      peso_kg: alerta.peso_kg,
      presion_hpa: alerta.presion_hpa,
      sonido_hz: alerta.sonido_hz,
      fecha_evento: alerta.fecha_evento,
      estado: alerta.estado,
      prioridad: alerta.prioridad,
      origen_alerta: alerta.origen_alerta,
      tipo_alerta: {
        nombre: tipo_alerta.nombre,
        codigo: tipo_alerta.codigo,
        color_hex: tipo_alerta.color_hex,
      },
    })
    .from(alerta)
    .leftJoin(tipo_alerta, eq(alerta.id_tipo_alerta, tipo_alerta.id))
    .where(
      and(
        eq(alerta.id_colmena, colmenaId),
        eq(alerta.estado, 'pendiente')
      )
    )
    .orderBy(desc(alerta.fecha_evento));
}

// Obtener alertas pendientes de una empresa
export async function getAlertasPendientesByEmpresa(empresaId: string) {
  return await db
    .select({
      id: alerta.id,
      descripcion: alerta.descripcion,
      temperatura_c: alerta.temperatura_c,
      humedad_h: alerta.humedad_h,
      peso_kg: alerta.peso_kg,
      presion_hpa: alerta.presion_hpa,
      sonido_hz: alerta.sonido_hz,
      fecha_evento: alerta.fecha_evento,
      estado: alerta.estado,
      prioridad: alerta.prioridad,
      origen_alerta: alerta.origen_alerta,
      tipo_alerta: {
        nombre: tipo_alerta.nombre,
        codigo: tipo_alerta.codigo,
        color_hex: tipo_alerta.color_hex,
      },
      colmena: {
        id: colmena.id,
        nombre_colmena: colmena.nombre_colmena,
      },
    })
    .from(alerta)
    .leftJoin(tipo_alerta, eq(alerta.id_tipo_alerta, tipo_alerta.id))
    .leftJoin(colmena, eq(alerta.id_colmena, colmena.id))
    .where(
      and(
        eq(colmena.id_empresa, empresaId),
        eq(alerta.estado, 'pendiente')
      )
    )
    .orderBy(desc(alerta.fecha_evento));
}

// Marcar alerta como atendida
export async function marcarAlertaAtendida(
  alertaId: string,
  usuarioId: string,
  comentario?: string
) {
  const updated = await db
    .update(alerta)
    .set({
      estado: 'atendida',
      atendida_por: usuarioId,
      comentario_atencion: comentario,
    })
    .where(eq(alerta.id, alertaId))
    .returning();

  return updated[0];
}

// Obtener resumen de alertas por prioridad de una empresa
export async function getResumenAlertasByEmpresa(empresaId: string) {
  const resumen = await db
    .select({
      prioridad: alerta.prioridad,
      estado: alerta.estado,
      total: sql<number>`COUNT(*)`,
    })
    .from(alerta)
    .leftJoin(colmena, eq(alerta.id_colmena, colmena.id))
    .where(eq(colmena.id_empresa, empresaId))
    .groupBy(alerta.prioridad, alerta.estado);

  return resumen;
}

// Obtener alertas por rango de fechas
export async function getAlertasByFecha(
  empresaId: string,
  fechaInicio: Date,
  fechaFin: Date
) {
  const fechaInicioISO = fechaInicio.toISOString();
  const fechaFinISO = fechaFin.toISOString();

  return await db
    .select({
      id: alerta.id,
      descripcion: alerta.descripcion,
      fecha_evento: alerta.fecha_evento,
      estado: alerta.estado,
      prioridad: alerta.prioridad,
      tipo_alerta: {
        nombre: tipo_alerta.nombre,
        codigo: tipo_alerta.codigo,
        color_hex: tipo_alerta.color_hex,
      },
      colmena: {
        id: colmena.id,
        nombre_colmena: colmena.nombre_colmena,
      },
    })
    .from(alerta)
    .leftJoin(tipo_alerta, eq(alerta.id_tipo_alerta, tipo_alerta.id))
    .leftJoin(colmena, eq(alerta.id_colmena, colmena.id))
    .where(
      sql`${colmena.id_empresa} = ${empresaId} 
          AND ${alerta.fecha_evento} >= ${fechaInicioISO} 
          AND ${alerta.fecha_evento} <= ${fechaFinISO}`
    )
    .orderBy(desc(alerta.fecha_evento));
}
