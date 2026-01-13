import type { Request, Response } from 'express';
import { getUltimaLecturaByColmena, getLecturasByColmena, getUltimaLecturaValidaByColmena } from '../services/lecturaService';
import { calcularIndiceVitalidad, determinarZonaConfort, calcularNivelHomeostasis, generarRecomendacionesExpertas } from '../services/analiticaService';
import { isValidUUID } from '../utils/validation';

export async function getDashboardOperativoHandler(req: Request, res: Response) {
    try {
        const { colmenaId } = req.params;

        if (!colmenaId || !isValidUUID(colmenaId)) {
            return res.status(400).json({ success: false, error: 'colmenaId requerido y debe ser un UUID válido' });
        }

        // Obtener datos necesarios en paralelo para mejorar el rendimiento
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
        // Si la última lectura general es inválida (<100Hz), intentamos usar la última válida para la analítica
        let lecturaParaAnalitica = ultimaLectura;
        let esDatoReal = true;

        if (Number(ultimaLectura.sonido_hz || 0) < 100) {
            const ultimaValida = await getUltimaLecturaValidaByColmena(colmenaId as string);
            if (ultimaValida) {
                lecturaParaAnalitica = ultimaValida;
                esDatoReal = false; // Marcamos que estamos usando un dato histórico para la salud
            }
        }

        const vitalidad = calcularIndiceVitalidad(
            Number(lecturaParaAnalitica.sonido_hz || 0),
            Number(lecturaParaAnalitica.temperatura_c || 0)
        );

        const confort = determinarZonaConfort(
            Number(lecturaParaAnalitica.temperatura_c || 0),
            Number(lecturaParaAnalitica.humedad_h || 0)
        );

        const temps = lecturasRecientes.map(l => Number(l.temperatura_c)).filter(t => !isNaN(t));
        const media = temps.reduce((a, b) => a + b, 0) / temps.length;
        const varianzaInt = temps.reduce((a, b) => a + Math.pow(b - media, 2), 0) / temps.length;

        const varianzaExtSimulada = 6.0;
        const homeostasisNivel = calcularNivelHomeostasis(varianzaInt, varianzaExtSimulada);

        const recomendaciones = generarRecomendacionesExpertas(
            { score: vitalidad.score, estado: vitalidad.estado },
            { zona: confort.zona, riesgo: confort.riesgo },
            homeostasisNivel
        );

        res.status(200).json({
            success: true,
            data: {
                vitalidad: {
                    score: vitalidad.score,
                    estado: vitalidad.estado,
                    label: vitalidad.label,
                    color: vitalidad.color,
                    is_fallback: !esDatoReal,
                    fecha_dato: lecturaParaAnalitica.fecha_registro,
                    valor_sonido: Number(lecturaParaAnalitica.sonido_hz || 0),
                    valor_temp: Number(lecturaParaAnalitica.temperatura_c || 0),
                    valor_humedad: Number(lecturaParaAnalitica.humedad_h || 0)
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
                recomendaciones,
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
