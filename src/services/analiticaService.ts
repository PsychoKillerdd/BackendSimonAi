import { lectura_sensor } from '../config/db/schema';

export interface VigorStatus {
    indice_vitalidad: number; // 0 - 100
    estado_acustico: 'Tranquila' | 'Activa' | 'Estresada' | 'Posible Orfandad/Enjambrazón';
    homeostasis: 'Alta' | 'Media' | 'Nula';
    confort_higrotermico: 'Zona Confort' | 'Zona Estrés' | 'Zona Peligro';
    etiquetas_riesgo: string[];
}

export function calcularIndiceVitalidad(sonido_hz: number, temp_int: number): { score: number, estado: VigorStatus['estado_acustico'] } {
    let score = 100;
    let estado: VigorStatus['estado_acustico'] = 'Tranquila';

    const hz = Number(sonido_hz);
    const temp = Number(temp_int);

    // 1. Lógica Acústica
    if (hz >= 200 && hz <= 350) {
        estado = hz > 300 ? 'Activa' : 'Tranquila';
    } else if ((hz >= 351 && hz <= 400) || (hz >= 181 && hz <= 199)) {
        score -= 20;
        estado = 'Estresada';
    } else if (hz > 400 || hz < 180) {
        score -= 50;
        estado = 'Posible Orfandad/Enjambrazón';
    }

    // 2. Lógica Térmica (Estabilidad en 34°C - 35°C)
    const desviacionTemp = Math.abs(temp - 34.5);
    if (desviacionTemp > 0.5 && desviacionTemp <= 1) {
        score -= 15;
    } else if (desviacionTemp > 1) {
        score -= 40;
    }

    // Penalización exponencial si ambos están mal
    if (score < 50 && (hz > 400 || hz < 180)) {
        score = Math.max(0, score - 20);
    }

    return { score: Math.max(0, score), estado };
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
