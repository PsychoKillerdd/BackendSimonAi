import { lectura_sensor } from '../config/db/schema';

export interface VigorStatus {
    indice_vitalidad: number; // 0 - 100
    estado_acustico: 'Tranquila' | 'Activa' | 'Estresada' | 'Posible Orfandad/Enjambrazón';
    homeostasis: 'Alta' | 'Media' | 'Nula';
    confort_higrotermico: 'Zona Confort' | 'Zona Estrés' | 'Zona Peligro';
    etiquetas_riesgo: string[];
}

export function calcularIndiceVitalidad(sonido_hz: number, temp_int: number): { score: number, estado: VigorStatus['estado_acustico'], color: string, label: string } {
    const hz = Number(sonido_hz);
    const temp = Number(temp_int);

    // Si no hay datos válidos (frecuencia muy baja)
    if (hz < 100) {
        return { score: 0, estado: 'Tranquila', color: 'bg-gray-100 text-gray-600', label: 'Sin datos' };
    }

    let score = 70; // Baseline
    let estado: VigorStatus['estado_acustico'] = 'Tranquila';
    let color = 'bg-blue-100 text-blue-600';
    let label = 'Normal';

    // 1. Lógica Acústica (Prioridad)
    if (hz >= 200 && hz <= 350 && temp >= 34 && temp <= 35) {
        // Estado Óptimo
        const porcentaje = 100 - ((Math.abs(275 - hz) / 75) * 10);
        score = Math.max(90, Math.min(100, porcentaje));
        estado = hz > 300 ? 'Activa' : 'Tranquila';
        color = 'bg-green-500 text-white';
        label = 'Óptimo';
    } else if ((hz >= 351 && hz <= 400) || (hz >= 181 && hz <= 199)) {
        // Estado Alerta
        const baselineTemp = 34.5;
        const desviacionTemp = Math.abs(temp - baselineTemp);
        const porcentaje = 75 - (desviacionTemp * 10);
        score = Math.max(60, Math.min(89, porcentaje));
        estado = 'Estresada';
        color = 'bg-yellow-500 text-white';
        label = 'Alerta';
    } else if (hz > 400 || hz < 180) {
        // Estado Crítico
        score = Math.min(60, 50 + (hz / 10));
        estado = 'Posible Orfandad/Enjambrazón';
        color = 'bg-red-500 text-white';
        label = 'Crítico';
    }

    return { score: Math.round(score), estado, color, label };
}

export function determinarZonaConfort(temp: number, hum: number): { zona: VigorStatus['confort_higrotermico'], riesgo: string | null } {
    const t = Number(temp);
    const h = Number(hum);
    let riesgo: string | null = null;

    // Lógica de Riesgo de Cría Yesificada
    if (h > 75 && t < 33) {
        riesgo = 'Riesgo de Cría Yesificada';
    }

    // Zona Confort
    if (t >= 34 && t <= 35 && h >= 50 && h <= 70) {
        return { zona: 'Zona Confort', riesgo };
    }

    // Zona Peligro
    if (t < 32 || t > 37 || h < 40 || h > 75) {
        return { zona: 'Zona Peligro', riesgo };
    }

    // Por defecto Zona Estrés
    return { zona: 'Zona Estrés', riesgo };
}

export function calcularNivelHomeostasis(varianzaInt: number, varianzaExt: number): VigorStatus['homeostasis'] {
    // Si la varianza interna es muy baja comparado a la externa moviéndose mucho
    if (varianzaInt < 0.5 && varianzaExt > 5) return 'Alta';
    if (varianzaInt > 1) return 'Media';
    return 'Nula';
}
