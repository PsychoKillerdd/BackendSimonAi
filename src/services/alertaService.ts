import { db } from '../config/db';
import { alerta, tipo_alerta, lectura_sensor } from '../config/db/schema';
import { eq, and } from 'drizzle-orm';

// Definición de reglas para el MVP (Hardcoded)
// En el futuro, esto podría venir de una tabla 'reglas_alerta' configurada por usuario
const REGLAS = [
    {
        codigo: 'TEMP_ALTA',
        nombre: 'Temperatura Alta',
        descripcion: 'Temperatura supera el umbral seguro',
        condicion: (l: any) => l.temperatura_c > 35,
        prioridad: 'alta' as const,
        color: '#FF0000'
    },
    {
        codigo: 'TEMP_BAJA',
        nombre: 'Temperatura Baja',
        descripcion: 'Temperatura bajo el mínimo seguro',
        condicion: (l: any) => l.temperatura_c < 5,
        prioridad: 'media' as const,
        color: '#0000FF'
    },
    {
        codigo: 'HUM_ALTA',
        nombre: 'Humedad Alta',
        descripcion: 'Humedad ambiente crítica',
        condicion: (l: any) => l.humedad_h > 80,
        prioridad: 'media' as const,
        color: '#FFFF00'
    },
    {
        codigo: 'HUM_BAJA',
        nombre: 'Humedad Baja',
        descripcion: 'Humedad ambiente crítica',
        condicion: (l: any) => l.humedad_h < 20,
        prioridad: 'media' as const,
        color: '#FFA500'
    },
    {
        codigo: 'SONIDO_ALTO',
        nombre: 'Nivel Ruido Alto',
        descripcion: 'Posible perturbación o ataque (sonido > 500Hz)',
        condicion: (l: any) => l.sonido_hz > 500,
        prioridad: 'alta' as const,
        color: '#800080'
    },
    {
        codigo: 'SONIDO_BAJO',
        nombre: 'Nivel Ruido Bajo',
        descripcion: 'Actividad inusualmente baja (sonido < 50Hz)',
        condicion: (l: any) => l.sonido_hz < 50,
        prioridad: 'media' as const,
        color: '#808080'
    },
    {
        codigo: 'PESO_ALTO',
        nombre: 'Peso Alto',
        descripcion: 'Aumento significativo de peso (más de 10kg)',
        condicion: (l: any) => l.peso_kg > 10,
        prioridad: 'baja' as const,
        color: '#00FF00'
    },
    {
        codigo: 'PESO_BAJO',
        nombre: 'Peso Bajo',
        descripcion: 'Disminución significativa de peso (menos de 2kg)',
        condicion: (l: any) => l.peso_kg < 2,
        prioridad: 'baja' as const,
        color: '#008000'
    },
    {
        codigo: 'PRESION_ALTA',
        nombre: 'Presión Alta',
        descripcion: 'Presión atmosférica elevada',
        condicion: (l: any) => l.presion_hpa > 1020,
        prioridad: 'baja' as const,
        color: '#00FFFF'
    },
    {
        codigo: 'PRESION_BAJA',
        nombre: 'Presión Baja',
        descripcion: 'Presión atmosférica baja',
        condicion: (l: any) => l.presion_hpa < 980,
        prioridad: 'baja' as const,
        color: '#FFC0CB'
    },
    {
        codigo: 'HUM_CRITICA',
        nombre: 'Humedad Crítica',
        descripcion: 'Humedad extremadamente baja',
        condicion: (l: any) => l.humedad_h < 10,
        prioridad: 'alta' as const,
        color: '#FF69B4'
    },
    {
        codigo: 'TEMP_EXTREMA',
        nombre: 'Temperatura Extrema',
        descripcion: 'Temperatura fuera de rango extremo',
        condicion: (l: any) => l.temperatura_c < 0 || l.temperatura_c > 40,
        prioridad: 'alta' as const,
        color: '#8B0000'
    },
    {
        codigo: 'SONIDO_EXTREMO',
        nombre: 'Nivel de Sonido Extremo',
        descripcion: 'Nivel de sonido extremadamente alto',
        condicion: (l: any) => l.sonido_hz > 1000,
        prioridad: 'alta' as const,
        color: '#4B0082'
    },
    {
        codigo: 'PESO_CRITICO',
        nombre: 'Peso Crítico',
        descripcion: 'Peso extremadamente bajo',
        condicion: (l: any) => l.peso_kg < 1,
        prioridad: 'alta' as const,
        color: '#2F4F4F'
    }
];

export async function checkAndCreateAlerts(
    lectura: typeof lectura_sensor.$inferSelect,
    colmenaId: string
) {
    try {
        for (const regla of REGLAS) {
            if (regla.condicion(lectura)) {
                console.log(`⚠️ ALERTA DETECTADA: ${regla.nombre} en colmena ${colmenaId}`);
                await createAlert(lectura, colmenaId, regla);
            }
        }
    } catch (error) {
        console.error('Error evaluando alertas:', error);
        // No lanzamos error para no interrumpir el flujo principal de guardar lectura
    }
}

async function createAlert(
    lectura: typeof lectura_sensor.$inferSelect,
    colmenaId: string,
    regla: typeof REGLAS[0]
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

    // 2. Crear la alerta
    await db.insert(alerta).values({
        id_colmena: colmenaId,
        id_tipo_alerta: tipo.id,
        descripcion: `${regla.nombre} detectada: ${getTriggerParam(lectura, regla.codigo)}`,
        temperatura_c: lectura.temperatura_c,
        humedad_h: lectura.humedad_h,
        peso_kg: lectura.peso_kg,
        presion_hpa: lectura.presion_hpa,
        sonido_hz: lectura.sonido_hz,
        prioridad: regla.prioridad,
        origen_alerta: 'automatico',
        estado: 'pendiente'
    });
}

function getTriggerParam(lectura: any, codigo: string): string {
    switch (codigo) {
        case 'TEMP_ALTA':
        case 'TEMP_BAJA': return `${lectura.temperatura_c}°C`;
        case 'HUM_BAJA': return `${lectura.humedad_h}%`;
        case 'SONIDO_ALTO': return `${lectura.sonido_hz}Hz`;
        default: return 'N/A';
    }
}
