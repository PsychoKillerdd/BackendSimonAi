import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware';
import {
  getAlertasByColmena,
  getAlertasByEmpresa,
  getAlertasPendientesByColmena,
  getAlertasPendientesByEmpresa,
  getAlertasAtendidasByColmena,
  marcarAlertaAtendida,
  getResumenAlertasByEmpresa,
  getAlertasByFecha,
} from '../services/alertaQueryService';

// 🎯 SOLO MOSTRAR ESTAS 3 ALERTAS (las demás están desactivadas)
const CODIGOS_ALERTAS_PERMITIDAS = [
  'ORFANDAD_ACUSTICA',      // Posible Orfandad Detectada
  'PRE_ENJAMBRAZON_ACUSTICA', // Alta Probabilidad de Enjambrazón
  'ATAQUE_O_ESTRES',        // Estrés Defensivo o Ataque Externo
];

// Función helper para filtrar alertas
const filtrarAlertasPermitidas = (alertas: any[]) => {
  return alertas.filter(alerta =>
    alerta.tipo_alerta?.codigo &&
    CODIGOS_ALERTAS_PERMITIDAS.includes(alerta.tipo_alerta.codigo)
  );
};

// 📊 Obtener todas las alertas de una colmena
export async function getAlertasColmenaHandler(req: AuthRequest, res: Response) {
  try {
    const { colmenaId } = req.params;
    const { limit } = req.query;

    if (!colmenaId) {
      return res.status(400).json({ success: false, error: 'colmenaId requerido' });
    }

    const alertasRaw = await getAlertasByColmena(colmenaId, Number(limit) || 50);
    const alertas = filtrarAlertasPermitidas(alertasRaw);

    res.status(200).json({
      success: true,
      data: alertas,
      total: alertas.length,
    });
  } catch (error: any) {
    console.error('Error obteniendo alertas de colmena:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener alertas',
    });
  }
}

// 📊 Obtener todas las alertas de la empresa (del usuario autenticado)
export async function getAlertasEmpresaHandler(req: AuthRequest, res: Response) {
  try {
    const { limit } = req.query;
    const empresaId = req.user!.id_empresa;

    const alertasRaw = await getAlertasByEmpresa(empresaId, Number(limit) || 100);
    const alertas = filtrarAlertasPermitidas(alertasRaw);

    res.status(200).json({
      success: true,
      data: alertas,
      total: alertas.length,
    });
  } catch (error: any) {
    console.error('Error obteniendo alertas de empresa:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener alertas',
    });
  }
}

// 🚨 Obtener solo alertas PENDIENTES de una colmena
export async function getAlertasPendientesColmenaHandler(req: AuthRequest, res: Response) {
  try {
    const { colmenaId } = req.params;

    if (!colmenaId) {
      return res.status(400).json({ success: false, error: 'colmenaId requerido' });
    }

    const alertasRaw = await getAlertasPendientesByColmena(colmenaId);
    const alertas = filtrarAlertasPermitidas(alertasRaw);

    res.status(200).json({
      success: true,
      data: alertas,
      total: alertas.length,
    });
  } catch (error: any) {
    console.error('Error obteniendo alertas pendientes de colmena:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener alertas',
    });
  }
}

// 🚨 Obtener solo alertas ATENDIDAS de una colmena
export async function getAlertasAtendidasColmenaHandler(req: AuthRequest, res: Response) {
  try {
    const { colmenaId } = req.params;

    if (!colmenaId) {
      return res.status(400).json({ success: false, error: 'colmenaId requerido' });
    }

    const alertasRaw = await getAlertasAtendidasByColmena(colmenaId);
    const alertas = filtrarAlertasPermitidas(alertasRaw);

    res.status(200).json({
      success: true,
      data: alertas,
      total: alertas.length,
    });
  } catch (error: any) {
    console.error('Error obteniendo alertas atendidas de colmena:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener alertas',
    });
  }
}

// 🚨 Obtener solo alertas PENDIENTES de la empresa
export async function getAlertasPendientesEmpresaHandler(req: AuthRequest, res: Response) {
  try {
    const empresaId = req.user!.id_empresa;

    const alertasRaw = await getAlertasPendientesByEmpresa(empresaId);
    const alertas = filtrarAlertasPermitidas(alertasRaw);

    res.status(200).json({
      success: true,
      data: alertas,
      total: alertas.length,
    });
  } catch (error: any) {
    console.error('Error obteniendo alertas pendientes de empresa:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener alertas',
    });
  }
}

// ✅ Marcar alerta como atendida
export async function marcarAlertaAtendidaHandler(req: AuthRequest, res: Response) {
  try {
    const { alertaId } = req.params;
    const { comentario } = req.body;
    const usuarioId = req.user!.id;

    if (!alertaId) {
      return res.status(400).json({ success: false, error: 'alertaId requerido' });
    }

    const alertaActualizada = await marcarAlertaAtendida(alertaId, usuarioId, comentario);

    if (!alertaActualizada) {
      return res.status(404).json({ success: false, error: 'Alerta no encontrada' });
    }

    res.status(200).json({
      success: true,
      data: alertaActualizada,
      message: 'Alerta marcada como atendida',
    });
  } catch (error: any) {
    console.error('Error marcando alerta como atendida:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar alerta',
    });
  }
}

// 📈 Obtener resumen de alertas por prioridad y estado
export async function getResumenAlertasHandler(req: AuthRequest, res: Response) {
  try {
    const empresaId = req.user!.id_empresa;

    const resumen = await getResumenAlertasByEmpresa(empresaId);

    // Transformar para mejor legibilidad
    const resumenFormateado = {
      pendientes: {
        alta: 0,
        media: 0,
        baja: 0,
        total: 0,
      },
      atendidas: {
        alta: 0,
        media: 0,
        baja: 0,
        total: 0,
      },
      total_general: 0,
    };

    resumen.forEach((item) => {
      const prioridad = item.prioridad || 'media';
      const estado = item.estado || 'pendiente';
      const total = Number(item.total);

      if (estado === 'pendiente') {
        resumenFormateado.pendientes[prioridad as keyof typeof resumenFormateado.pendientes] = total;
        resumenFormateado.pendientes.total += total;
      } else if (estado === 'atendida' || estado === 'resuelta') {
        // Contar tanto 'atendida' como 'resuelta' como atendidas
        const prioridadActual = resumenFormateado.atendidas[prioridad as keyof typeof resumenFormateado.atendidas] || 0;
        resumenFormateado.atendidas[prioridad as keyof typeof resumenFormateado.atendidas] = prioridadActual + total;
        resumenFormateado.atendidas.total += total;
      }

      resumenFormateado.total_general += total;
    });

    res.status(200).json({
      success: true,
      data: resumenFormateado,
      detalle: resumen,
    });
  } catch (error: any) {
    console.error('Error obteniendo resumen de alertas:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener resumen',
    });
  }
}

// 📅 Obtener alertas por rango de fechas
export async function getAlertasByFechaHandler(req: AuthRequest, res: Response) {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const empresaId = req.user!.id_empresa;

    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren fecha_inicio y fecha_fin (formato ISO: 2025-12-01)',
      });
    }

    const fechaInicio = new Date(fecha_inicio as string);
    const fechaFin = new Date(fecha_fin as string);

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Formato de fecha inválido. Use formato ISO: 2025-12-01',
      });
    }

    const alertasRaw = await getAlertasByFecha(empresaId, fechaInicio, fechaFin);
    const alertas = filtrarAlertasPermitidas(alertasRaw);

    res.status(200).json({
      success: true,
      data: alertas,
      total: alertas.length,
      periodo: {
        desde: fecha_inicio,
        hasta: fecha_fin,
      },
    });
  } catch (error: any) {
    console.error('Error obteniendo alertas por fecha:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al obtener alertas',
    });
  }
}
