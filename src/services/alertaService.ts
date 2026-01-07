import { db } from '../config/db';
import { alerta, tipo_alerta, lectura_sensor } from '../config/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * 🌎 Lógica Estacional de Chile
 * Verano: Enero (0) - Abril (3)
 * Otoño-Invierno: Mayo (4) - Septiembre (8)
 * Primavera: Septiembre (8) - Diciembre (11)
 * (Nota: Hay solapamientos biológicos, se manejan con prioridades dinámicas)
 */
const getTemporadaChile = () => {
    const mes = new Date().getMonth(); // 0-11
    if (mes >= 0 && mes <= 3) return 'VERANO';
    if (mes >= 4 && mes <= 7) return 'INVIERNO'; // Mayo a Agosto (Core de invierno)
    if (mes >= 8 && mes <= 11) return 'PRIMAVERA'; // Septiembre a Diciembre
    return 'VERANO';
};

// 🐝 CONFIGURACIÓN TÉCNICA - ITERACIÓN II
const CONFIG_AUDIO = {
    BAND_NORMAL_MIN: 200,
    BAND_NORMAL_MAX: 300,
    BAND_WARBLE_MIN: 165,
    BAND_WARBLE_MAX: 285,
    BAND_PIPING_MIN: 350,
    BAND_PIPING_MAX: 550,
    BAND_HISS_MIN: 600, // Ajustado por filtro paso-banda 100-600Hz
};

const CONFIG_AMBIENTAL = {
    TEMP_OPTIMA_MIN: 32.0,
    TEMP_OPTIMA_MAX: 36.0,
    HUM_CRITICA: 80.0
};

const TEMPORALIDAD = {
    PERSISTENCIA_ORFANDAD: 4, // 4 muestras para confirmar orfandad
};

type Prioridad = 'baja' | 'media' | 'alta' | 'critica';

type Regla = {
    codigo: string;
    nombre: string;
    descripcion: string;
    condicion: (l: any, p?: any, h?: any[]) => boolean;
    prioridad: Prioridad;
    color: string;
};

// ⚠️ TODAS LAS REGLAS BASE DESACTIVADAS POR SOLICITUD DEL JEFE
// Solo quedan activas: Orfandad, Enjambrazón, Estrés Defensivo
const REGLAS_BASE: Regla[] = [
    // ⚠️ DESACTIVADO: Por solicitud del jefe
    // {
    //     codigo: 'TEMP_ALTA',
    //     nombre: 'Estrés por Calor / Colapso',
    //     descripcion: 'Riesgo de asfixia de la cría y derretimiento de ceras. T° > 38°C.',
    //     condicion: (l: any) => Number(l.temperatura_c) > 38,
    //     prioridad: 'media' as const,
    //     color: '#FF4500'
    // },
    // {
    //     codigo: 'TEMP_BAJA',
    //     nombre: 'Debilidad Térmica',
    //     descripcion: 'Población insuficiente para calentar el nido. T° < 32°C.',
    //     condicion: (l: any) => Number(l.temperatura_c) < 32,
    //     prioridad: 'media' as const,
    //     color: '#0000FF'
    // },
    // {
    //     codigo: 'HUM_ALTA',
    //     nombre: 'Riesgo Sanitario (Humedad)',
    //     descripcion: 'Ambiente propicio para hongos (Ascosferosis). Humedad > 75%.',
    //     condicion: (l: any) => Number(l.humedad_h) > 75,
    //     prioridad: 'media' as const,
    //     color: '#FFFF00'
    // },
    // {
    //     codigo: 'HUM_BAJA',
    //     nombre: 'Humedad Baja',
    //     descripcion: 'Humedad ambiente crítica',
    //     condicion: (l: any) => Number(l.humedad_h) < 20,
    //     prioridad: 'media' as const,
    //     color: '#FFA500'
    // },
    // {
    //     codigo: 'SONIDO_ALTO',
    //     nombre: 'Nivel Ruido Alto',
    //     descripcion: 'Posible perturbación o ataque (sonido > 500Hz)',
    //     condicion: (l: any) => Number(l.sonido_hz) > 500,
    //     prioridad: 'alta' as const,
    //     color: '#800080'
    // },
    // {
    //     codigo: 'SONIDO_BAJO',
    //     nombre: 'Nivel Ruido Bajo',
    //     descripcion: 'Actividad inusualmente baja (sonido < 50Hz)',
    //     condicion: (l: any) => Number(l.sonido_hz) < 50,
    //     prioridad: 'media' as const,
    //     color: '#808080'
    // },
    // {
    //     codigo: 'PRESION_ALTA',
    //     nombre: 'Presión Alta',
    //     descripcion: 'Presión atmosférica elevada',
    //     condicion: (l: any) => Number(l.presion_hpa) > 1020,
    //     prioridad: 'baja' as const,
    //     color: '#00FFFF'
    // },
    // {
    //     codigo: 'PRESION_BAJA',
    //     nombre: 'Presión Baja',
    //     descripcion: 'Presión atmosférica baja',
    //     condicion: (l: any) => Number(l.presion_hpa) < 980,
    //     prioridad: 'baja' as const,
    //     color: '#FFC0CB'
    // },
    // {
    //     codigo: 'HUM_CRITICA',
    //     nombre: 'Humedad Crítica',
    //     descripcion: 'Humedad extremadamente baja',
    //     condicion: (l: any) => Number(l.humedad_h) < 10,
    //     prioridad: 'alta' as const,
    //     color: '#FF69B4'
    // },
    // {
    //     codigo: 'TEMP_EXTREMA',
    //     nombre: 'Temperatura Extrema',
    //     descripcion: 'Temperatura fuera de rango extremo',
    //     condicion: (l: any) => Number(l.temperatura_c) < 0 || Number(l.temperatura_c) > 40,
    //     prioridad: 'alta' as const,
    //     color: '#8B0000'
    // },
    // {
    //     codigo: 'SONIDO_EXTREMO',
    //     nombre: 'Nivel de Sonido Extremo',
    //     descripcion: 'Nivel de sonido extremadamente alto',
    //     condicion: (l: any) => Number(l.sonido_hz) > 1000,
    //     prioridad: 'alta' as const,
    //     color: '#4B0082'
    // },
    // {
    //     codigo: 'AMENAZA_INCENDIO',
    //     nombre: 'Posible Incendio Detectado',
    //     descripcion: 'Detección de calor extremo y sequedad compatible con fuego cercano',
    //     condicion: (l: any, p: any) =>
    //         Number(l.temperatura_c) >= 45 ||
    //         (p && Number(l.temperatura_c) >= Number(p.temperatura_c) + 5 && Number(l.humedad_h) < 15),
    //     prioridad: 'alta' as const,
    //     color: '#FF0000'
    // },
    // {
    //     codigo: 'ROBO_VANDALISMO',
    //     nombre: 'Posible Robo o Vandalismo',
    //     descripcion: 'Actividad física o pérdida de peso inusual en horario nocturno',
    //     condicion: (l: any, p: any) => {
    //         const hora = new Date().getHours();
    //         const esNocturno = hora >= 21 || hora <= 6;
    //         if (!esNocturno) return false;
    //         const perdidaPeso = p && p.peso_kg && l.peso_kg && (Number(p.peso_kg) - Number(l.peso_kg) >= 3);
    //         const ruidoInusual = Number(l.sonido_hz) > 400;
    //         return perdidaPeso || ruidoInusual;
    //     },
    //     prioridad: 'alta' as const,
    //     color: '#000000'
    // }
];

// 🔊 Reglas acústicas avanzadas - SOLO ESTAS 3 ESTÁN ACTIVAS
const REGLAS_ACUSTICAS = [
    // ✅ ACTIVA: Posible Orfandad Detectada (Warble)
    {
        codigo: 'ORFANDAD_ACUSTICA',
        nombre: 'Posible Orfandad Detectada',
        descripcion: 'Vigor Crítico: Patrón acústico de "rugido" (Warble) entre 165-285Hz sostenido (>1h), indicando falta de reina.',
        condicion: (l: any, p: any, history: any[]) => {
            if (!history || history.length < TEMPORALIDAD.PERSISTENCIA_ORFANDAD) return false;
            // Verificar si las últimas N lecturas están en rango de orfandad
            return history.slice(0, TEMPORALIDAD.PERSISTENCIA_ORFANDAD).every(h =>
                Number(h.sonido_hz) >= CONFIG_AUDIO.BAND_WARBLE_MIN &&
                Number(h.sonido_hz) <= CONFIG_AUDIO.BAND_WARBLE_MAX
            );
        },
        prioridad: 'alta' as const,
        color: '#B22222'
    },
    // ✅ ACTIVA: Alta Probabilidad de Enjambrazón (Éxodo)
    {
        codigo: 'PRE_ENJAMBRAZON_ACUSTICA',
        nombre: 'Alta Probabilidad de Enjambrazón',
        descripcion: 'Vigor Excedente: Salto súbito de frecuencia (400-550Hz) y temperatura (>35°C) compatible con salida inminente de enjambre.',
        condicion: (l: any, p: any) =>
            p &&
            Number(l.sonido_hz) >= CONFIG_AUDIO.BAND_PIPING_MIN &&
            Number(l.sonido_hz) <= CONFIG_AUDIO.BAND_PIPING_MAX &&
            Number(p.sonido_hz) < CONFIG_AUDIO.BAND_NORMAL_MAX &&
            Number(l.temperatura_c) > 35,
        prioridad: 'critica' as const,
        color: '#FFA500'
    },
    // ✅ ACTIVA: Estrés Defensivo o Ataque Externo (Hissing)
    {
        codigo: 'ATAQUE_O_ESTRES',
        nombre: 'Estrés Defensivo o Ataque Externo',
        descripcion: 'Respuesta de "siseo" (Hissing) detectada por picos de espectro completo o fuera de rango normal (>600Hz).',
        condicion: (l: any) =>
            Number(l.sonido_hz) >= CONFIG_AUDIO.BAND_HISS_MIN,
        prioridad: 'alta' as const,
        color: '#8B0000'
    }
];

/**
 * 📊 Algoritmo Cálculo Índice de Vitalidad (IV)
 * Basado en Documento Iteración II
 */
export function calculateVitalityIndex(l: any) {
    let iv = 100;
    const temp = Number(l.temperatura_c || 0);
    const hum = Number(l.humedad_h || 0);
    const hz = Number(l.sonido_hz || 0);

    // 1. Penalización Térmica (Termorregulación)
    if (temp < CONFIG_AMBIENTAL.TEMP_OPTIMA_MIN || temp > CONFIG_AMBIENTAL.TEMP_OPTIMA_MAX) {
        if (temp < 30) {
            iv -= (30 - temp) * 2;
        } else if (temp > 37) {
            iv -= (temp - 37) * 5;
        } else {
            iv -= 10; // Fuera de rango óptimo pero no crítico
        }
    }

    // 2. Penalización Higrométrica
    if (hum >= CONFIG_AMBIENTAL.HUM_CRITICA) {
        iv -= 15;
    }

    // 3. Penalización Acústica
    if (hz >= CONFIG_AUDIO.BAND_WARBLE_MIN && hz <= CONFIG_AUDIO.BAND_WARBLE_MAX) {
        iv -= 40; // Orfandad detectada
    } else if (hz >= CONFIG_AUDIO.BAND_HISS_MIN) {
        iv -= 20; // Estrés detectado
    } else if (hz > 0 && hz < 100) {
        iv -= 50; // Baja actividad crítica
    }

    return Math.max(0, Math.min(100, Math.round(iv)));
}

// 🎯 SOLO 3 ALERTAS ACTIVAS POR SOLICITUD DEL JEFE:
// 1. Alta Probabilidad de Enjambrazón (PRE_ENJAMBRAZON_ACUSTICA)
// 2. Posible Orfandad Detectada (ORFANDAD_ACUSTICA)
// 3. Estrés Defensivo o Ataque Externo (ATAQUE_O_ESTRES)
const REGLAS = [
    ...REGLAS_BASE,
    ...REGLAS_ACUSTICAS
];


export async function checkAndCreateAlerts(
    lectura: typeof lectura_sensor.$inferSelect,
    colmenaId: string
) {
    try {
        // Buscar las últimas lecturas para análisis de persistencia y comparativa
        const lecturasPrevias = await db
            .select()
            .from(lectura_sensor)
            .where(eq(lectura_sensor.id_colmena, colmenaId))
            .orderBy(desc(lectura_sensor.fecha_registro))
            .limit(10);

        const lecturaAnterior = lecturasPrevias[1] || null; // La 0 es la actual si ya se guardó, pero aquí le pasamos la 'lectura' del argumento
        // Filtramos para asegurar que no incluimos la lectura actual en el historial previo si es necesario
        const historialParaReglas = lecturasPrevias.filter(lp => lp.id !== lectura.id);

        const temporada = getTemporadaChile();
        const ivActual = calculateVitalityIndex(lectura);
        console.log(`🐝 IV CALCULADO para colmena ${colmenaId}: ${ivActual}%`);

        for (const regla of REGLAS) {
            if (regla.condicion(lectura, lecturaAnterior, historialParaReglas)) {
                // 🚀 AJUSTE DE PRIORIDAD ESTACIONAL
                let prioridadFinal: Prioridad = regla.prioridad;

                // Lógica de potenciación de alertas según temporada
                if (temporada === 'VERANO') {
                    if (['TEMP_ALTA', 'AMENAZA_INCENDIO', 'ROBO_VANDALISMO', 'SONIDO_EXTREMO'].includes(regla.codigo)) {
                        prioridadFinal = 'alta';
                    }
                } else if (temporada === 'INVIERNO') {
                    if (['TEMP_BAJA', 'HUM_ALTA', 'HUM_CRITICA', 'PESO_CRITICO'].includes(regla.codigo)) {
                        prioridadFinal = 'alta';
                    }
                } else if (temporada === 'PRIMAVERA') {
                    if (['ENJAMBRAZON', 'ORFANDAD_ACUSTICA', 'PRE_ENJAMBRAZON_ACUSTICA', 'ENJAMBRAZON_ACUSTICA_CONFIRMADA'].includes(regla.codigo)) {
                        prioridadFinal = 'alta';
                    }
                }

                // 🐝 ENJAMBRAZÓN: Alta probabilidad entre 11:00 AM y 4:30 PM (momento de más calor)
                if (regla.codigo === 'ENJAMBRAZON' || regla.codigo === 'PRE_ENJAMBRAZON_ACUSTICA') {
                    const hora = new Date().getHours();
                    const minutos = new Date().getMinutes();
                    const horaDecimal = hora + (minutos / 60);
                    const esHorarioPico = horaDecimal >= 11 && horaDecimal <= 16.5; // 11:00 - 16:30

                    if (esHorarioPico) {
                        prioridadFinal = 'critica';
                        console.log(`🐝 ${regla.codigo} en horario pico (${hora}:${minutos.toString().padStart(2, '0')}) - Prioridad CRÍTICA`);
                    }
                }


                console.log(`⚠️ ALERTA DETECTADA (${temporada}): ${regla.nombre} en colmena ${colmenaId} con prioridad ${prioridadFinal}`);
                await createAlert(lectura, colmenaId, regla, lecturaAnterior, prioridadFinal);
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
    lecturaAnterior: any = null,
    prioridadAjustada?: Prioridad
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

    // Safety check para TypeScript
    if (!tipo) return;

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
        prioridad: prioridadAjustada || regla.prioridad,
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