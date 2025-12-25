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
import { checkAndCreateAlerts } from '../services/alertaService';
import type { AuthRequest } from '../middlewares/authMiddleware';

// Ingesta desde dispositivo (no requiere auth humano, usa codigo_unico)
export async function createLecturaSensorHandler(req: Request, res: Response) {
  const timestamp = new Date().toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    hour12: false
  });

  // 🔍 LOG 1: Registrar TODA petición que llega
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔵 [${timestamp}] PETICIÓN RECIBIDA: POST /api/lecturas/sensor`);
  console.log(`📦 Headers:`, JSON.stringify({
    'content-type': req.headers['content-type'],
    'user-agent': req.headers['user-agent'],
    'origin': req.headers['origin'],
  }, null, 2));
  console.log(`📦 Body recibido:`, JSON.stringify(req.body, null, 2));
  console.log(`📦 IP origen:`, req.ip || req.socket.remoteAddress);

  try {
    const {
      codigo_dispositivo,
      temperatura_c,
      humedad_h,
      peso_kg,
      sonido_hz,
      presion_hpa,
    } = req.body;

    // 🔍 LOG 2: Validación de campo requerido
    if (!codigo_dispositivo) {
      console.log(`❌ [${timestamp}] RECHAZADO: Falta campo codigo_dispositivo`);
      console.log(`   Body recibido completo:`, req.body);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: codigo_dispositivo',
        recibido: req.body
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

    // 🔍 LOG 3: Intentando procesar
    console.log(`⏳ [${timestamp}] PROCESANDO: Buscando dispositivo "${codigo_dispositivo}"...`);

    const resultado = await createLecturaSensorByCodigo(payload);

    // 🔍 LOG 4: Éxito
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

    console.log(`✅ [${timestamp}] LECTURA REGISTRADA EXITOSAMENTE`);
    console.log(`   📱 Dispositivo: ${resultado.dispositivo.codigo_unico}`);
    console.log(`   🐝 Colmena: ${resultado.colmena.nombre_colmena}`);
    console.log(`   📊 Datos: ${JSON.stringify(payload)}`);
    console.log(`   🕐 Hora registro: ${fechaChile}`);
    // ⚡ Disparar evaluación de alertas (Fire & Forget para no bloquear respuesta)
    if (resultado.lectura) {
      checkAndCreateAlerts(resultado.lectura, resultado.colmena.id).catch(err => {
        console.error('Error en proceso de alertas en segundo plano:', err);
      });
    }

    res.status(201).json({ success: true, data: resultado });
  } catch (error: any) {
    // 🔍 LOG 5: Errores detallados
    console.log(`❌ [${timestamp}] ERROR AL PROCESAR LECTURA`);
    console.log(`   Tipo error: ${error.name || 'Unknown'}`);
    console.log(`   Mensaje: ${error.message}`);
    console.log(`   Body enviado:`, req.body);

    // Detectar tipo específico de error
    if (error.message.includes('Dispositivo no encontrado')) {
      console.log(`   ⚠️  CAUSA: El código "${req.body.codigo_dispositivo}" no existe en BD`);
      console.log(`   💡 SOLUCIÓN: Verificar que el dispositivo esté creado en /api/dispositivos`);
    } else if (error.message.includes('no está asignado a ninguna colmena')) {
      console.log(`   ⚠️  CAUSA: El dispositivo existe pero no tiene colmena asignada`);
      console.log(`   💡 SOLUCIÓN: Asignar dispositivo a una colmena primero`);
    } else if (error.message.includes('al menos un valor de sensor')) {
      console.log(`   ⚠️  CAUSA: No se enviaron valores de sensores (temp, humedad, etc.)`);
      console.log(`   💡 SOLUCIÓN: Enviar al menos un campo de sensor con valor`);
    } else {
      console.log(`   Stack trace:`, error.stack);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear lectura',
      codigo_dispositivo: req.body.codigo_dispositivo,
      timestamp: timestamp
    });
  }
}

export async function getLecturasByColmenaHandler(req: AuthRequest, res: Response) {
  try {
    const { colmenaId } = req.params;
    const { limit } = req.query;

    if (!colmenaId) {
      return res.status(400).json({ success: false, error: 'colmenaId requerido' });
    }

    const { nombre_colmena, lecturas } = await getLecturasByColmena(colmenaId, Number(limit) || 50);
    res.status(200).json({ success: true, nombre_colmena, data: lecturas });
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
