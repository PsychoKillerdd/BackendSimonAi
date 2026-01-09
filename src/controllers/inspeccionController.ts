import type { Request, Response } from 'express';
import * as inspeccionService from '../services/inspeccionService';

export async function createInspeccionHandler(req: Request, res: Response) {
    try {
        const data = req.body;

        if (!data.colmena_id || !data.fecha_inspeccion || !data.nombre_inspeccion || !data.observaciones) {
            return res.status(400).json({
                success: false,
                error: 'Campos requeridos faltantes: colmena_id, fecha_inspeccion, nombre_inspeccion, observaciones'
            });
        }

        const inspeccion = await inspeccionService.createInspeccion(data);

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
        if (!colmenaId) {
            return res.status(400).json({ success: false, error: 'colmenaId requerido' });
        }

        const bitacora = await inspeccionService.getBitacoraByColmena(colmenaId as string);
        res.status(200).json({
            success: true,
            data: bitacora
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
        if (!id) {
            return res.status(400).json({ success: false, error: 'id requerido' });
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
