import type { Request, Response } from 'express';
import { getUltimaLecturaByColmena, getLecturasByColmena } from '../services/lecturaService';
import { calcularIndiceVitalidad, determinarZonaConfort, calcularNivelHomeostasis } from '../services/analiticaService';

export async function getDashboardOperativoHandler(req: Request, res: Response) {
    try {
        const { colmenaId } = req.params;

        if (!colmenaId) {
            return res.status(400).json({ success: false, error: 'colmenaId requerido' });
        }

        // 1. Obtener datos necesarios en paralelo para mejorar el rendimiento
        const [ultimaLectura, resultRecientes] = await Promise.all([
            getUltimaLecturaByColmena(colmenaId as string),
            getLecturasByColmena(colmenaId as string, 12)
        ]);

        const { lecturas: lecturasRecientes } = resultRecientes;

        if (!ultimaLectura) {
            return res.status(404).json({
                success: false,
                message: 'No hay lecturas disponibles para esta colmena'
            });
        }

        // --- CÁLCULOS ---

        // Vitalidad
        const vitalidad = calcularIndiceVitalidad(
            Number(ultimaLectura.sonido_hz || 0),
            Number(ultimaLectura.temperatura_c || 0)
        );

        // Confort
        const confort = determinarZonaConfort(
            Number(ultimaLectura.temperatura_c || 0),
            Number(ultimaLectura.humedad_h || 0)
        );

        // Homeostasis (Simulada por ahora con varianza interna)
        // Calculamos la varianza de la temperatura interna en las últimas 12 lecturas
        const temps = lecturasRecientes.map(l => Number(l.temperatura_c)).filter(t => !isNaN(t));
        const media = temps.reduce((a, b) => a + b, 0) / temps.length;
        const varianzaInt = temps.reduce((a, b) => a + Math.pow(b - media, 2), 0) / temps.length;

        // Simulamos varianza externa (en una implementación real vendría de API Clima)
        const varianzaExtSimulada = 6.0;
        const homeostasisNivel = calcularNivelHomeostasis(varianzaInt, varianzaExtSimulada);

        // --- RESPUESTA ESTRUCTURADA ---
        res.status(200).json({
            success: true,
            data: {
                vitalidad: {
                    score: vitalidad.score,
                    estado: vitalidad.estado,
                    label: vitalidad.score >= 90 ? 'Óptimo' : (vitalidad.score >= 60 ? 'Alerta' : 'Crítico')
                },
                confort: {
                    zona: confort.zona,
                    status: confort.zona === 'Zona Confort' ? 'Normal' : (confort.zona === 'Zona Estrés' ? 'Advertencia' : 'Peligro'),
                    riesgo_especifico: confort.riesgo
                },
                homeostasis: {
                    nivel: homeostasisNivel,
                    interpretacion: homeostasisNivel === 'Alta' ? 'Colonia fuerte, gran masa de abejas' :
                        (homeostasisNivel === 'Media' ? 'Población insuficiente' : 'Emergencia: Colmena colapsada'),
                    varianza_interna: varianzaInt.toFixed(4)
                },
                ultima_actualizacion: ultimaLectura.fecha_registro
            }
        });

    } catch (error: any) {
        console.error('Error en Dashboard Operativo:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
