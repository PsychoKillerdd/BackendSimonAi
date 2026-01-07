import { db } from '../config/db';
import { inspecciones_colmenas } from '../config/db/schema';
import { eq, desc } from 'drizzle-orm';

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

// Helper para convertir string vacío a null
const emptyToNull = (val?: string): string | null => {
    if (val === undefined || val === null || val.trim() === '') {
        return null;
    }
    return val;
};

// Helper para convertir string a número o null
const toNumberOrNull = (val?: string): string | null => {
    if (val === undefined || val === null || val.trim() === '') {
        return null;
    }
    const num = parseFloat(val);
    return isNaN(num) ? null : String(num);
};

export async function createInspeccion(data: InspeccionInput) {
    // Procesar los datos para convertir strings vacíos a null
    const processedData = {
        colmena_id: data.colmena_id,
        apiario_id: emptyToNull(data.apiario_id),
        alerta_id: emptyToNull(data.alerta_id),
        fecha_inspeccion: data.fecha_inspeccion,
        nombre_inspeccion: data.nombre_inspeccion,
        ubicacion_apiario: emptyToNull(data.ubicacion_apiario),
        // Campos numéricos - convertir a número o null
        temperatura: toNumberOrNull(data.temperatura),
        humedad: toNumberOrNull(data.humedad),
        velocidad_viento: toNumberOrNull(data.velocidad_viento),
        // Campos de texto
        direccion_viento: emptyToNull(data.direccion_viento),
        cielo: emptyToNull(data.cielo),
        estado_colmena: emptyToNull(data.estado_colmena),
        poblacion_abejas: emptyToNull(data.poblacion_abejas),
        presencia_reina: emptyToNull(data.presencia_reina),
        celdas_reales: emptyToNull(data.celdas_reales),
        postura: emptyToNull(data.postura),
        reservas_alimento: emptyToNull(data.reservas_alimento),
        comportamiento_abejas: emptyToNull(data.comportamiento_abejas),
        signos_enfermedad: emptyToNull(data.signos_enfermedad),
        observaciones: data.observaciones,
        recomendaciones: emptyToNull(data.recomendaciones),
        acciones_correctivas: emptyToNull(data.acciones_correctivas),
    };

    console.log('📝 Datos procesados para inserción:', processedData);

    const result = await db.insert(inspecciones_colmenas).values(processedData).returning();
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
