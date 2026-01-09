import { db } from '../config/db';
import { inspecciones_colmenas, alerta, tipo_alerta } from '../config/db/schema';
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
    observaciones?: string;
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
        observaciones: data.observaciones || '',
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

/**
 * Obtiene la bitácora combinada de inspecciones y alertas atendidas
 */
export async function getBitacoraByColmena(colmenaId: string) {
    // 1. Obtener inspecciones
    const inspecciones = await db.select()
        .from(inspecciones_colmenas)
        .where(eq(inspecciones_colmenas.colmena_id, colmenaId))
        .orderBy(desc(inspecciones_colmenas.fecha_inspeccion));

    // 2. Obtener alertas atendidas
    const alertas = await db.select({
        id: alerta.id,
        fecha_evento: alerta.fecha_evento,
        descripcion: alerta.descripcion,
        estado: alerta.estado,
        prioridad: alerta.prioridad,
        comentario_atencion: alerta.comentario_atencion,
        tipo_alerta_nombre: tipo_alerta.nombre,
        tipo_alerta_codigo: tipo_alerta.codigo,
        temperatura_c: alerta.temperatura_c,
        humedad_h: alerta.humedad_h,
        peso_kg: alerta.peso_kg,
        presion_hpa: alerta.presion_hpa,
        sonido_hz: alerta.sonido_hz,
    })
        .from(alerta)
        .leftJoin(tipo_alerta, eq(alerta.id_tipo_alerta, tipo_alerta.id))
        .where(
            and(
                eq(alerta.id_colmena, colmenaId),
                eq(alerta.estado, 'resuelta')
            )
        )
        .orderBy(desc(alerta.fecha_evento));

    // 3. Unificar y etiquetar
    const bitacora = [
        ...inspecciones.map(ins => ({ ...ins, tipo_registro: 'inspeccion' })),
        ...alertas.map(alt => ({
            id: alt.id,
            fecha_inspeccion: alt.fecha_evento,
            nombre_inspeccion: `Alerta Atendida: ${alt.tipo_alerta_nombre}`,
            observaciones: alt.descripcion,
            recomendaciones: alt.comentario_atencion,
            estado_colmena: alt.prioridad === 'critica' || alt.prioridad === 'alta' ? 'Malo' : 'Regular',
            temperatura: alt.temperatura_c,
            humedad: alt.humedad_h,
            peso_kg: alt.peso_kg,
            presion_hpa: alt.presion_hpa,
            sonido_hz: alt.sonido_hz,
            tipo_registro: 'alerta'
        }))
    ];

    // 4. Ordenar por fecha descendente
    return bitacora.sort((a, b) => {
        const dateA = new Date(a.fecha_inspeccion as string).getTime();
        const dateB = new Date(b.fecha_inspeccion as string).getTime();
        return dateB - dateA;
    });
}
