import { db } from '../config/db';
import { inspecciones_colmenas } from '../config/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export interface InspeccionInput {
    colmena_id: string;
    apiario_id?: string;
    alerta_id?: string;
    fecha_inspeccion: string;
    nombre_inspeccion: string;
    ubicacion_apiario?: string;
    temperatura?: string;
    humedad?: string;
    velocidad_viento?: string;
    direccion_viento?: string;
    cielo?: string;
    estado_colmena?: string;
    poblacion_abejas?: string;
    presencia_reina?: string;
    celdas_reales?: string;
    postura?: string;
    reservas_alimento?: string;
    comportamiento_abejas?: string;
    signos_enfermedad?: string;
    observaciones: string;
    recomendaciones?: string;
    acciones_correctivas?: string;
}

export async function createInspeccion(data: InspeccionInput) {
    const result = await db.insert(inspecciones_colmenas).values({
        ...data,
    }).returning();
    return result[0];
}

export async function getInspeccionesByColmena(colmenaId: string) {
    return await db.select()
        .from(inspecciones_colmenas)
        .where(eq(inspecciones_colmenas.colmena_id, colmenaId))
        .orderBy(desc(inspecciones_colmenas.fecha_inspeccion));
}

export async function getInspeccionById(id: string) {
    const result = await db.select()
        .from(inspecciones_colmenas)
        .where(eq(inspecciones_colmenas.id, id))
        .limit(1);
    return result[0] || null;
}
