import { db } from '../config/db';
import { empresa, usuario, rol, usuario_rol } from '../config/db/schema';
import { eq, ilike, asc, desc, sql } from 'drizzle-orm';
import {
  validatePaginationParams,
  buildPaginatedResponse,
  type PaginationParams,
  type PaginatedResponse,
} from '../utils/pagination';

export type EmpresaInput = {
  nombre: string;
  pais?: string;
  direccion?: string;
  telefono?: number | string;
  correo_contacto?: string;
  estado_empresa?: string;
};

export async function createEmpresa(payload: EmpresaInput) {
  const insertPayload = {
    nombre: payload.nombre,
    pais: payload.pais ?? null,
    direccion: payload.direccion ?? null,
    telefono: payload.telefono?.toString() ?? null,
    correo_contacto: payload.correo_contacto ?? null,
    estado_empresa: payload.estado_empresa ?? 'activa',
  };

  const result = await db.insert(empresa).values(insertPayload).returning();
  return result[0];
}

export async function getAllEmpresas() {
  return await db.select().from(empresa).orderBy(asc(empresa.id));
}

export async function getEmpresaById(empresaId: string) {
  const result = await db.select().from(empresa).where(eq(empresa.id, empresaId));
  return result[0] || null;
}

/**
 * Obtiene empresas con paginación
 * @param params - Parámetros de paginación (page, limit, sortBy, sortOrder)
 * @returns Respuesta paginada con empresas y metadata
 */
export async function getEmpresasPaginated(params: PaginationParams): Promise<PaginatedResponse<any>> {
  const validated = validatePaginationParams(params);

  // Obtener el total de empresas (para metadata)
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(empresa);
  const totalItems = countResult[0]?.count !== undefined ? Number(countResult[0].count) : 0;

  // Construir orden dinámico
  const sortColumn = validated.sortBy === 'nombre' ? empresa.nombre : empresa.id;
  const orderFn = validated.sortOrder === 'asc' ? asc : desc;

  // Obtener empresas paginadas
  const offset = (validated.page - 1) * validated.limit;
  const data = await db
    .select()
    .from(empresa)
    .orderBy(orderFn(sortColumn))
    .limit(validated.limit)
    .offset(offset);

  return buildPaginatedResponse(data, validated.page, validated.limit, totalItems);
}

export type UsuarioInput = {
  nombre: string;
  correo: string;
  tipo_usuario: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  region?: string;
  pais?: string;
  rut?: string;
  telefono?: number | string;
  roleId?: string; // UUID en lugar de number
  roleName?: string; // optional role name to assign (eg 'admin'|'apicultor')
  password?: string; // optional plain password for initial creation
};



export async function getOrCreateRoleId(roleName: string): Promise<string> {
  // Buscar rol por nombre (case-insensitive)
  const existingRoles = await db.select().from(rol).where(ilike(rol.nombre, roleName));

  if (existingRoles.length > 0 && existingRoles[0]!.id) {
    return existingRoles[0]!.id;
  }

  // Crear rol si no existe
  const newRoles = await db.insert(rol).values({
    nombre: roleName,
    descripcion: null,
  }).returning();

  if (!newRoles[0] || !newRoles[0].id) {
    throw new Error('Error al crear el rol');
  }

  return newRoles[0].id;
}

export async function createUsuarioWithRole(empresaId: string, payload: UsuarioInput) {
  // Normalize tipo_usuario to avoid DB check failures (trim + lowercase)
  const tipoUsuarioNormalized = payload.tipo_usuario ? String(payload.tipo_usuario).trim().toLowerCase() : null;

  const userPayload = {
    nombre: payload.nombre,
    correo: payload.correo,
    tipo_usuario: tipoUsuarioNormalized,
    id_empresa: empresaId ?? null,
    fecha_nacimiento: payload.fecha_nacimiento ?? null,
    direccion: payload.direccion ?? null,
    ciudad: payload.ciudad ?? null,
    region: payload.region ?? null,
    pais: payload.pais ?? null,
    rut: payload.rut ?? null,
    telefono: payload.telefono?.toString() ?? null,
    password: payload.password ? await (await import('./authService')).hashPassword(payload.password) : '',
  };

  const userData = await db.insert(usuario).values(userPayload).returning();

  let roleId: string;
  if (payload.roleId) {
    roleId = payload.roleId;
  } else if (payload.roleName) {
    roleId = await getOrCreateRoleId(payload.roleName);
  } else {
    // Default to role named 'admin' if exists or create it
    roleId = await getOrCreateRoleId('admin');
  }

  const rolPayload = {
    id_usuario: userData[0]?.id,
    id_rol: roleId,
  };

  const usuarioRolData = await db.insert(usuario_rol).values(rolPayload).returning();

  return { usuario: userData[0]!, usuario_rol: usuarioRolData[0]! };
}

/**
 * Elimina una empresa por su ID
 * @param empresaId - UUID de la empresa a eliminar
 * @returns La empresa eliminada o null si no existía
 */
export async function deleteEmpresa(empresaId: string) {
  const result = await db.delete(empresa).where(eq(empresa.id, empresaId)).returning();
  return result[0] || null;
}

/**
 * Obtiene todos los usuarios de una empresa
 * @param empresaId - ID de la empresa
 */
export async function getUsuariosByEmpresa(empresaId: string) {
  // Join con roles para obtener el rol actual
  return await db
    .select({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      tipo_usuario: usuario.tipo_usuario,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      fecha_creacion: usuario.fecha_creacion,
      rol: {
        id: rol.id,
        nombre: rol.nombre
      }
    })
    .from(usuario)
    .leftJoin(usuario_rol, eq(usuario.id, usuario_rol.id_usuario))
    .leftJoin(rol, eq(usuario_rol.id_rol, rol.id))
    .where(eq(usuario.id_empresa, empresaId));
}

/**
 * Elimina un usuario por su ID
 * @param usuarioId - ID del usuario
 */
export async function deleteUsuario(usuarioId: string) {
  // Primero eliminar relaciones de roles si existen
  await db.delete(usuario_rol).where(eq(usuario_rol.id_usuario, usuarioId));
  const result = await db.delete(usuario).where(eq(usuario.id, usuarioId)).returning();
  return result[0] || null;
}

/**
 * Actualiza la información de un usuario
 */
export async function updateUsuario(usuarioId: string, payload: Partial<UsuarioInput>) {
  const updatePayload: any = {};
  if (payload.nombre) updatePayload.nombre = payload.nombre;
  if (payload.correo) updatePayload.correo = payload.correo;
  if (payload.tipo_usuario) updatePayload.tipo_usuario = payload.tipo_usuario.trim().toLowerCase();
  if (payload.telefono) updatePayload.telefono = payload.telefono.toString();
  if (payload.direccion) updatePayload.direccion = payload.direccion;

  const userData = await db.update(usuario).set(updatePayload).where(eq(usuario.id, usuarioId)).returning();

  if (payload.roleName || payload.roleId) {
    let roleId: string;
    if (payload.roleId) {
      roleId = payload.roleId;
    } else {
      roleId = await getOrCreateRoleId(payload.roleName!);
    }

    // Actualizar o crear usuario_rol
    const existing = await db.select().from(usuario_rol).where(eq(usuario_rol.id_usuario, usuarioId));
    if (existing.length > 0) {
      await db.update(usuario_rol).set({ id_rol: roleId }).where(eq(usuario_rol.id_usuario, usuarioId));
    } else {
      await db.insert(usuario_rol).values({ id_usuario: usuarioId, id_rol: roleId });
    }
  }

  return userData[0];
}

/**
 * Obtiene un usuario por su ID con detalles de rol y empresa
 * @param usuarioId - ID del usuario
 */
export async function getUsuarioById(usuarioId: string) {
  const result = await db
    .select({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      tipo_usuario: usuario.tipo_usuario,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      ciudad: usuario.ciudad,
      region: usuario.region,
      pais: usuario.pais,
      rut: usuario.rut,
      fecha_nacimiento: usuario.fecha_nacimiento,
      fecha_creacion: usuario.fecha_creacion,
      id_empresa: usuario.id_empresa,
      rol: {
        id: rol.id,
        nombre: rol.nombre
      },
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre
      }
    })
    .from(usuario)
    .leftJoin(usuario_rol, eq(usuario.id, usuario_rol.id_usuario))
    .leftJoin(rol, eq(usuario_rol.id_rol, rol.id))
    .leftJoin(empresa, eq(usuario.id_empresa, empresa.id))
    .where(eq(usuario.id, usuarioId));

  return result[0] || null;
}
