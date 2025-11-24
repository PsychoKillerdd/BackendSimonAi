import { db } from '../config/db';
import { dispositivo_simonia } from '../config/db/schema';
import { eq, desc } from 'drizzle-orm';

export type DispositivoInput = {
  codigo_unico: string;
  id_propietario: string | null; // null = inventario SimonIA, string = asignado a empresa
  modelo?: string;
  firmware_version?: string;
  estado?: string;
};

export async function createDispositivo(payload: DispositivoInput) {
  const dispositivoPayload: any = {
    codigo_unico: payload.codigo_unico,
    id_propietario: payload.id_propietario,
  };

  if (payload.modelo) {
    dispositivoPayload.modelo = payload.modelo;
  }

  if (payload.firmware_version) {
    dispositivoPayload.firmware_version = payload.firmware_version;
  }

  if (payload.estado) {
    dispositivoPayload.estado = payload.estado;
  }

  const result = await db.insert(dispositivo_simonia).values(dispositivoPayload).returning();
  return result[0];
}

export async function getDispositivoById(dispositivoId: string) {
  const result = await db.select().from(dispositivo_simonia).where(eq(dispositivo_simonia.id, dispositivoId));
  return result[0] || null;
}

export async function getDispositivoByCodigo(codigoUnico: string) {
  const result = await db.select().from(dispositivo_simonia).where(eq(dispositivo_simonia.codigo_unico, codigoUnico));
  return result[0] || null;
}

export async function getAllDispositivos() {
  return await db.select().from(dispositivo_simonia).orderBy(desc(dispositivo_simonia.fecha_registro));
}

export async function getDispositivosByEmpresa(empresaId: string) {
  return await db
    .select()
    .from(dispositivo_simonia)
    .where(eq(dispositivo_simonia.id_propietario, empresaId))
    .orderBy(desc(dispositivo_simonia.fecha_registro));
}

export async function updateDispositivoEstado(dispositivoId: string, estado: string) {
  const result = await db
    .update(dispositivo_simonia)
    .set({ estado })
    .where(eq(dispositivo_simonia.id, dispositivoId))
    .returning();
  return result[0];
}

export async function asignarDispositivoAEmpresa(dispositivoId: string, empresaId: string) {
  const result = await db
    .update(dispositivo_simonia)
    .set({ id_propietario: empresaId })
    .where(eq(dispositivo_simonia.id, dispositivoId))
    .returning();
  return result[0];
}

export async function getDispositivosSinAsignar() {
  const result = await db
    .select()
    .from(dispositivo_simonia)
    .where(eq(dispositivo_simonia.id_propietario, null))
    .orderBy(desc(dispositivo_simonia.fecha_registro));
  return result;
}
