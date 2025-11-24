import type { Request, Response } from 'express';
import {
  createLecturaSensorByCodigo,
  getLecturasByColmena,
  getLecturasByCodigoDispositivo,
  getUltimaLecturaByColmena,
  getHistorialParaGraficos,
  getEstadisticasColmena,
  type LecturaInput,
} from '../services/lecturaService';
import type { AuthRequest } from '../middlewares/authMiddleware';

// Ingesta desde dispositivo (no requiere auth humano, usa codigo_unico)
export async function createLecturaSensorHandler(req: Request, res: Response) {
  try {
    const {
      codigo_dispositivo,
      temperatura_c,
      humedad_h,
      peso_kg,
      sonido_hz,
      presion_hpa,
    } = req.body;

    if (!codigo_dispositivo) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: codigo_dispositivo',
      });
    }

    const payload: LecturaInput = {
      codigo_dispositivo,
      temperatura_c,
      humedad_h,
      peso_kg,
      sonido_hz,
      presion_hpa,
    };

    const resultado = await createLecturaSensorByCodigo(payload);

    // Log para consola/Render
    const fechaRegistro = resultado.lectura?.fecha_registro;
    const fechaChile = fechaRegistro 
      ? new Date(fechaRegistro).toLocaleString('es-CL', {
          timeZone: 'America/Santiago',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      : 'N/A';

    console.log(`📊 LECTURA REGISTRADA | Dispositivo: ${resultado.dispositivo.codigo_unico} | Colmena: ${resultado.colmena.nombre_colmena} | Hora Chile: ${fechaChile}`);

    res.status(201).json({ success: true, data: resultado });
  } catch (error: any) {
    console.error('Error creando lectura sensor:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al crear lectura' });
  }
}

export async function getLecturasByColmenaHandler(req: AuthRequest, res: Response) {
  try {
    const { colmenaId } = req.params;
    const { limit } = req.query;

    if (!colmenaId) {
      return res.status(400).json({ success: false, error: 'colmenaId requerido' });
    }

    const lecturas = await getLecturasByColmena(colmenaId, Number(limit) || 50);
    res.status(200).json({ success: true, data: lecturas });
  } catch (error: any) {
    console.error('Error obteniendo lecturas por colmena:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al obtener lecturas' });
  }
}

export async function getLecturasByDispositivoHandler(req: AuthRequest, res: Response) {
  try {
    const { codigo } = req.params;
    const { limit } = req.query;

    if (!codigo) {
      return res.status(400).json({ success: false, error: 'codigo requerido' });
    }

    const lecturas = await getLecturasByCodigoDispositivo(codigo, Number(limit) || 50);
    res.status(200).json({ success: true, data: lecturas });
  } catch (error: any) {
    console.error('Error obteniendo lecturas por dispositivo:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al obtener lecturas' });
  }
}

export async function getUltimaLecturaColmenaHandler(req: AuthRequest, res: Response) {
  try {
    const { colmenaId } = req.params;
    if (!colmenaId) {
      return res.status(400).json({ success: false, error: 'colmenaId requerido' });
    }
    const lectura = await getUltimaLecturaByColmena(colmenaId);
    res.status(200).json({ success: true, data: lectura });
  } catch (error: any) {
    console.error('Error obteniendo última lectura:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al obtener lectura' });
  }
}

// 📊 CONTROLADORES PARA GRÁFICOS

export async function getHistorialGraficosHandler(req: AuthRequest, res: Response) {
  try {
    const { colmenaId } = req.params;
    const { dias } = req.query;

    if (!colmenaId) {
      return res.status(400).json({ success: false, error: 'colmenaId requerido' });
    }

    const historial = await getHistorialParaGraficos(colmenaId, Number(dias) || 7);
    
    res.status(200).json({ 
      success: true, 
      data: historial,
      periodo_dias: Number(dias) || 7,
      total_registros: historial.length
    });
  } catch (error: any) {
    console.error('Error obteniendo historial para gráficos:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al obtener historial' });
  }
}

export async function getEstadisticasColmenaHandler(req: AuthRequest, res: Response) {
  try {
    const { colmenaId } = req.params;
    const { dias } = req.query;

    if (!colmenaId) {
      return res.status(400).json({ success: false, error: 'colmenaId requerido' });
    }

    const estadisticas = await getEstadisticasColmena(colmenaId, Number(dias) || 7);
    
    res.status(200).json({ 
      success: true, 
      data: estadisticas,
      periodo_dias: Number(dias) || 7
    });
  } catch (error: any) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ success: false, error: error.message || 'Error al obtener estadísticas' });
  }
}
