import { db } from '../config/db';
import { alerta, tipo_alerta, lectura_sensor } from '../config/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Definición de reglas para el MVP (Hardcoded)
// En el futuro, esto podría venir de una tabla 'reglas_alerta' configurada por usuario
// 🔊 Reglas base (Parámetros físicos)
const REGLAS_BASE = [
    {
        codigo: 'TEMP_ALTA',
        nombre: 'Temperatura Alta',
        descripcion: 'Temperatura supera el umbral seguro',
        condicion: (l: any) => Number(l.temperatura_c) > 35,
        prioridad: 'alta' as const,
        color: '#FF0000'
    },
    {
        codigo: 'TEMP_BAJA',
        nombre: 'Temperatura Baja',
        descripcion: 'Temperatura bajo el mínimo seguro',
        condicion: (l: any) => Number(l.temperatura_c) < 5,
        prioridad: 'media' as const,
        color: '#0000FF'
    },
    {
        codigo: 'HUM_ALTA',
        nombre: 'Humedad Alta',
        descripcion: 'Humedad ambiente crítica',
        condicion: (l: any) => Number(l.humedad_h) > 80,
        prioridad: 'media' as const,
        color: '#FFFF00'
    },
    {
        codigo: 'HUM_BAJA',
        nombre: 'Humedad Baja',
        descripcion: 'Humedad ambiente crítica',
        condicion: (l: any) => Number(l.humedad_h) < 20,
        prioridad: 'media' as const,
        color: '#FFA500'
    },
    {
        codigo: 'SONIDO_ALTO',
        nombre: 'Nivel Ruido Alto',
        descripcion: 'Posible perturbación o ataque (sonido > 500Hz)',
        condicion: (l: any) => Number(l.sonido_hz) > 500,
        prioridad: 'alta' as const,
        color: '#800080'
    },
    {
        codigo: 'SONIDO_BAJO',
        nombre: 'Nivel Ruido Bajo',
        descripcion: 'Actividad inusualmente baja (sonido < 50Hz)',
        condicion: (l: any) => Number(l.sonido_hz) < 50,
        prioridad: 'media' as const,
        color: '#808080'
    },
    {
        codigo: 'PESO_ALTO',
        nombre: 'Peso Alto',
        descripcion: 'Aumento significativo de peso (más de 10kg)',
        condicion: (l: any) => Number(l.peso_kg) > 10,
        prioridad: 'baja' as const,
        color: '#00FF00'
    },
    {
        codigo: 'PESO_BAJO',
        nombre: 'Peso Bajo',
        descripcion: 'Disminución significativa de peso (menos de 2kg)',
        condicion: (l: any) => Number(l.peso_kg) < 2,
        prioridad: 'baja' as const,
        color: '#008000'
    },
    {
        codigo: 'PRESION_ALTA',
        nombre: 'Presión Alta',
        descripcion: 'Presión atmosférica elevada',
        condicion: (l: any) => Number(l.presion_hpa) > 1020,
        prioridad: 'baja' as const,
        color: '#00FFFF'
    },
    {
        codigo: 'PRESION_BAJA',
        nombre: 'Presión Baja',
        descripcion: 'Presión atmosférica baja',
        condicion: (l: any) => Number(l.presion_hpa) < 980,
        prioridad: 'baja' as const,
        color: '#FFC0CB'
    },
    {
        codigo: 'HUM_CRITICA',
        nombre: 'Humedad Crítica',
        descripcion: 'Humedad extremadamente baja',
        condicion: (l: any) => Number(l.humedad_h) < 10,
        prioridad: 'alta' as const,
        color: '#FF69B4'
    },
    {
        codigo: 'TEMP_EXTREMA',
        nombre: 'Temperatura Extrema',
        descripcion: 'Temperatura fuera de rango extremo',
        condicion: (l: any) => Number(l.temperatura_c) < 0 || Number(l.temperatura_c) > 40,
        prioridad: 'alta' as const,
        color: '#8B0000'
    },
    {
        codigo: 'SONIDO_EXTREMO',
        nombre: 'Nivel de Sonido Extremo',
        descripcion: 'Nivel de sonido extremadamente alto',
        condicion: (l: any) => Number(l.sonido_hz) > 1000,
        prioridad: 'alta' as const,
        color: '#4B0082'
    },
    {
        codigo: 'PESO_CRITICO',
        nombre: 'Peso Crítico',
        descripcion: 'Peso extremadamente bajo',
        condicion: (l: any) => Number(l.peso_kg) < 1,
        prioridad: 'alta' as const,
        color: '#2F4F4F'
    },
    {
        codigo: 'ENJAMBRAZON',
        nombre: 'Posible Enjambrazón',
        descripcion: 'Pérdida súbita de peso detectada (posible salida de enjambre)',
        condicion: (l: any, p: any) => p && l.peso_kg && p.peso_kg && (Number(p.peso_kg) - Number(l.peso_kg) >= 2),
        prioridad: 'alta' as const,
        color: '#FF4500'
    },
    {
        codigo: 'AMENAZA_INCENDIO',
        nombre: 'Posible Incendio Detectado',
        descripcion: 'Detección de calor extremo y sequedad compatible con fuego cercano',
        condicion: (l: any, p: any) =>
            Number(l.temperatura_c) >= 45 ||
            (p && Number(l.temperatura_c) >= Number(p.temperatura_c) + 5 && Number(l.humedad_h) < 15),
        prioridad: 'alta' as const,
        color: '#FF0000'
    },
    {
        codigo: 'ROBO_VANDALISMO',
        nombre: 'Posible Robo o Vandalismo',
        descripcion: 'Actividad física o pérdida de peso inusual en horario nocturno',
        condicion: (l: any, p: any) => {
            const hora = new Date().getHours();
            const esNocturno = hora >= 21 || hora <= 6;
            if (!esNocturno) return false;

            // Caso 1: Pérdida significativa de peso nocturna (> 3kg)
            const perdidaPeso = p && p.peso_kg && l.peso_kg && (Number(p.peso_kg) - Number(l.peso_kg) >= 3);
            // Caso 2: Ruido fuerte nocturno (> 400Hz) indica manipulación
            const ruidoInusual = Number(l.sonido_hz) > 400;

            return perdidaPeso || ruidoInusual;
        },
        prioridad: 'alta' as const,
        color: '#000000'
    }
];

// 🔊 Reglas acústicas avanzadas
const REGLAS_ACUSTICAS = [
    {
        codigo: 'ORFANDAD_ACUSTICA',
        nombre: 'Posible Orfandad Detectada',
        descripcion: 'Patrón acústico tipo warble/rugido compatible con ausencia de reina',
        condicion: (l: any, p: any) =>
            p &&
            Number(l.sonido_hz) >= 165 &&
            Number(l.sonido_hz) <= 285 &&
            Number(p.sonido_hz) > 0 &&
            (Number(p.sonido_hz) - Number(l.sonido_hz)) / Number(p.sonido_hz) >= 0.3,
        prioridad: 'alta' as const,
        color: '#B22222'
    },
    {
        codigo: 'PRE_ENJAMBRAZON_ACUSTICA',
        nombre: 'Alta Probabilidad de Enjambrazón',
        descripcion: 'Incremento acústico progresivo compatible con preparación de enjambre',
        condicion: (l: any, p: any) =>
            p &&
            Number(l.sonido_hz) >= 180 &&
            Number(l.sonido_hz) <= 350 &&
            Number(l.sonido_hz) > Number(p.sonido_hz) &&
            (!l.peso_kg || !p.peso_kg || Math.abs(Number(l.peso_kg) - Number(p.peso_kg)) < 1),
        prioridad: 'media' as const,
        color: '#FFA500'
    },
    {
        codigo: 'ENJAMBRAZON_ACUSTICA_CONFIRMADA',
        nombre: 'Enjambrazón en Progreso',
        descripcion: 'Aumento acústico seguido de pérdida de peso indica salida de enjambre',
        condicion: (l: any, p: any) =>
            p &&
            Number(l.sonido_hz) >= 400 &&
            p.peso_kg &&
            l.peso_kg &&
            (Number(p.peso_kg) - Number(l.peso_kg)) >= 2,
        prioridad: 'alta' as const,
        color: '#FF4500'
    },
    {
        codigo: 'ATAQUE_O_ESTRES',
        nombre: 'Estrés Defensivo o Ataque Externo',
        descripcion: 'Pico acústico agudo indica perturbación severa o ataque',
        condicion: (l: any, p: any) =>
            p &&
            Number(l.sonido_hz) >= 700 &&
            Number(l.sonido_hz) > Number(p.sonido_hz) * 1.5,
        prioridad: 'alta' as const,
        color: '#8B0000'
    }
];

const REGLAS = [
    ...REGLAS_BASE,
    ...REGLAS_ACUSTICAS
];


export async function checkAndCreateAlerts(
    lectura: typeof lectura_sensor.$inferSelect,
    colmenaId: string
) {
    try {
        // Buscar la lectura anterior para reglas que comparan datos (como enjambrazón)
        const lecturasAnteriores = await db
            .select()
            .from(lectura_sensor)
            .where(
                and(
                    eq(lectura_sensor.id_colmena, colmenaId),
                    sql`${lectura_sensor.id} != ${lectura.id}`
                )
            )
            .orderBy(desc(lectura_sensor.fecha_registro))
            .limit(1);

        const lecturaAnterior = lecturasAnteriores[0] || null;

        for (const regla of REGLAS) {
            if (regla.condicion(lectura, lecturaAnterior)) {
                console.log(`⚠️ ALERTA DETECTADA: ${regla.nombre} en colmena ${colmenaId}`);
                await createAlert(lectura, colmenaId, regla, lecturaAnterior);
            }
        }
    } catch (error) {
        console.error('Error evaluando alertas:', error);
    }
}

async function createAlert(
    lectura: typeof lectura_sensor.$inferSelect,
    colmenaId: string,
    regla: typeof REGLAS[0],
    lecturaAnterior: any = null
) {
    // 1. Obtener o crear el tipo de alerta
    let tipo = await db.query.tipo_alerta.findFirst({
        where: eq(tipo_alerta.codigo, regla.codigo)
    });

    if (!tipo) {
        const nuevosTipos = await db.insert(tipo_alerta).values({
            codigo: regla.codigo,
            nombre: regla.nombre,
            descripcion: regla.descripcion,
            color_hex: regla.color
        }).returning();
        tipo = nuevosTipos[0];
    }

    // 2. 🔍 VERIFICAR SI YA EXISTE UNA ALERTA PENDIENTE SIMILAR (últimas 24 horas)
    const hace24Horas = new Date();
    hace24Horas.setHours(hace24Horas.getHours() - 24);
    const hace24HorasISO = hace24Horas.toISOString();

    const alertasExistentes = await db
        .select()
        .from(alerta)
        .where(
            and(
                eq(alerta.id_colmena, colmenaId),
                eq(alerta.id_tipo_alerta, tipo.id),
                eq(alerta.estado, 'pendiente'),
                sql`${alerta.fecha_evento} >= ${hace24HorasISO}`
            )
        )
        .orderBy(desc(alerta.fecha_evento))
        .limit(1);

    if (alertasExistentes.length > 0) {
        const alertaExistente = alertasExistentes[0]!;
        const minutosDesdeUltimaAlerta = Math.floor(
            (Date.now() - new Date(alertaExistente.fecha_evento!).getTime()) / 1000 / 60
        );

        console.log(
            `⏭️ ALERTA DUPLICADA OMITIDA: ${regla.nombre} en colmena ${colmenaId} ` +
            `(ya existe alerta pendiente hace ${minutosDesdeUltimaAlerta} minutos)`
        );
        return; // No crear alerta duplicada
    }

    // 3. Generar descripción dinámica
    let descripcion = `${regla.nombre} detectada: ${getTriggerParam(lectura, regla.codigo)}`;

    if ((regla.codigo === 'ENJAMBRAZON' || regla.codigo === 'ENJAMBRAZON_ACUSTICA_CONFIRMADA') && lecturaAnterior) {
        const diff = Number(lecturaAnterior.peso_kg) - Number(lectura.peso_kg);
        descripcion = `${regla.nombre}: Pérdida de ${diff.toFixed(2)}kg (de ${lecturaAnterior.peso_kg}kg a ${lectura.peso_kg}kg)`;
        if (regla.codigo === 'ENJAMBRAZON_ACUSTICA_CONFIRMADA') {
            descripcion += ` con pico acústico de ${lectura.sonido_hz}Hz`;
        }
    }

    if (regla.codigo === 'AMENAZA_INCENDIO' && lecturaAnterior) {
        const diffTemp = Number(lectura.temperatura_c) - Number(lecturaAnterior.temperatura_c);
        if (diffTemp >= 5) {
            descripcion = `¡ALERTA DE INCENDIO!: Aumento crítico de ${diffTemp.toFixed(1)}°C detectado abruptamente. Humedad: ${lectura.humedad_h}%`;
        } else {
            descripcion = `¡ALERTA DE INCENDIO!: Temperatura extrema de ${lectura.temperatura_c}°C detectada.`;
        }
    }

    if (regla.codigo === 'ROBO_VANDALISMO') {
        const hora = new Date().getHours();
        const causa = Number(lectura.sonido_hz) > 400 ? 'Ruido inusual' : 'Pérdida de peso';
        descripcion = `Alerta de Seguridad: ${causa} detectado a las ${hora}:00 hrs. Posible manipulación humana.`;
    }

    // 4. Crear la alerta (solo si no existe una pendiente reciente)
    await db.insert(alerta).values({
        id_colmena: colmenaId,
        id_tipo_alerta: tipo.id,
        descripcion,
        temperatura_c: lectura.temperatura_c,
        humedad_h: lectura.humedad_h,
        peso_kg: lectura.peso_kg,
        presion_hpa: lectura.presion_hpa,
        sonido_hz: lectura.sonido_hz,
        prioridad: regla.prioridad,
        origen_alerta: 'automatico',
        estado: 'pendiente'
    });

    console.log(`✅ ALERTA CREADA: ${regla.nombre} en colmena ${colmenaId}`);
}

function getTriggerParam(lectura: any, codigo: string): string {
    switch (codigo) {
        case 'TEMP_ALTA':
        case 'TEMP_BAJA':
        case 'TEMP_EXTREMA':
        case 'AMENAZA_INCENDIO':
            return `${lectura.temperatura_c}°C`;
        case 'HUM_ALTA':
        case 'HUM_BAJA':
        case 'HUM_CRITICA':
            return `${lectura.humedad_h}%`;
        case 'SONIDO_ALTO':
        case 'SONIDO_BAJO':
        case 'SONIDO_EXTREMO':
            return `${lectura.sonido_hz}Hz`;
        case 'PESO_ALTO':
        case 'PESO_BAJO':
        case 'PESO_CRITICO':
            return `${lectura.peso_kg}kg`;
        case 'PRESION_ALTA':
        case 'PRESION_BAJA':
            return `${lectura.presion_hpa}hPa`;
        case 'ENJAMBRAZON':
        case 'ENJAMBRAZON_ACUSTICA_CONFIRMADA':
            return `${lectura.peso_kg}kg`;
        case 'ORFANDAD_ACUSTICA':
        case 'PRE_ENJAMBRAZON_ACUSTICA':
        case 'ATAQUE_O_ESTRES':
            return `${lectura.sonido_hz}Hz`;
        case 'ROBO_VANDALISMO':
            return `${lectura.peso_kg}kg / ${lectura.sonido_hz}Hz`;
        default:
            return 'N/A';
    }
}