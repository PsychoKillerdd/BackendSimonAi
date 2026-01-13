import type { Request, Response } from 'express';
import * as inspeccionService from '../services/inspeccionService';
import { isValidUUID, sanitizeString } from '../utils/validation';

export async function createInspeccionHandler(req: Request, res: Response) {
    try {
        const data = req.body;

        if (!data.colmena_id || !data.fecha_inspeccion || !data.nombre_inspeccion) {
            return res.status(400).json({
                success: false,
                error: 'Campos requeridos faltantes: colmena_id, fecha_inspeccion, nombre_inspeccion'
            });
        }

        // Validación de UUID
        if (!isValidUUID(data.colmena_id)) {
            return res.status(400).json({ success: false, error: 'colmena_id debe ser un UUID válido' });
        }

        // Sanitizar campos de texto
        const sanitizedData = {
            ...data,
            nombre_inspeccion: sanitizeString(data.nombre_inspeccion, 200),
            ubicacion_apiario: data.ubicacion_apiario ? sanitizeString(data.ubicacion_apiario, 200) : undefined,
            signos_enfermedad: data.signos_enfermedad ? sanitizeString(data.signos_enfermedad, 500) : undefined,
            observaciones: data.observaciones ? sanitizeString(data.observaciones, 1000) : undefined,
            recomendaciones: data.recomendaciones ? sanitizeString(data.recomendaciones, 1000) : undefined,
            acciones_correctivas: data.acciones_correctivas ? sanitizeString(data.acciones_correctivas, 1000) : undefined,
        };

        const inspeccion = await inspeccionService.createInspeccion(sanitizedData);

        res.status(201).json({
            success: true,
            data: inspeccion
        });
    } catch (error: any) {
        console.error('Error al crear inspección:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al crear la inspección'
        });
    }
}

export async function getInspeccionesByColmenaHandler(req: Request, res: Response) {
    try {
        const { colmenaId } = req.params;
        if (!colmenaId || !isValidUUID(colmenaId)) {
            return res.status(400).json({ success: false, error: 'colmenaId requerido y debe ser un UUID válido' });
        }

        const inspecciones = await inspeccionService.getInspeccionesByColmena(colmenaId as string);
        res.status(200).json({
            success: true,
            data: inspecciones
        });
    } catch (error: any) {
        console.error('Error al obtener inspecciones:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener las inspecciones'
        });
    }
}

export async function getInspeccionByIdHandler(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || !isValidUUID(id)) {
            return res.status(400).json({ success: false, error: 'id requerido y debe ser un UUID válido' });
        }
        const inspeccion = await inspeccionService.getInspeccionById(id as string);

        if (!inspeccion) {
            return res.status(404).json({ success: false, error: 'Inspección no encontrada' });
        }

        res.status(200).json({
            success: true,
            data: inspeccion
        });
    } catch (error: any) {
        console.error('Error al obtener inspección:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener la inspección'
        });
    }
}
export async function getBitacoraByColmenaHandler(req: Request, res: Response) {
    try {
        const { colmenaId } = req.params;
        if (!colmenaId || !isValidUUID(colmenaId)) {
            return res.status(400).json({ success: false, error: 'colmenaId requerido y debe ser un UUID válido' });
        }

        const bitacora = await inspeccionService.getBitacoraByColmena(colmenaId as string);
        res.status(200).json({
            success: true,
            data: bitacora
        });
    } catch (error: any) {
        console.error('Error al obtener bitácora:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener la bitácora'
        });
    }
}
