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
  const totalItems = Number(countResult[0].count);

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
  
  if (existingRoles.length > 0) {
    return existingRoles[0].id;
  }

  // Crear rol si no existe
  const newRoles = await db.insert(rol).values({
    nombre: roleName,
    descripcion: null,
  }).returning();

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
    id_usuario: userData[0].id,
    id_rol: roleId,
  };

  const usuarioRolData = await db.insert(usuario_rol).values(rolPayload).returning();

  return { usuario: userData[0], usuario_rol: usuarioRolData[0] };
}

// Nota: Las siguientes funciones requieren tablas que no están en el schema actual
// Se dejan comentadas hasta que se agreguen al schema

/*
export type SuscripcionInput = {
  fecha_inicio?: string; // ISO date
  fecha_fin: string; // ISO date
  estado?: string;
  renovacion_automatica?: boolean;
  max_colmenas?: number;
  max_apiarios?: number;
  max_usuarios?: number;
  precio_mensual: number;
  notas?: string;
};

export async function createSuscripcion(empresaId: string, payload: SuscripcionInput) {
  // Requiere agregar la tabla suscripcion_empresa al schema
  const insertPayload: any = {
    id_empresa: empresaId,
    fecha_fin: payload.fecha_fin,
    precio_mensual: Number(payload.precio_mensual),
  };

  if (payload.fecha_inicio) insertPayload.fecha_inicio = payload.fecha_inicio;
  if (payload.estado) insertPayload.estado = payload.estado;
  if (typeof payload.renovacion_automatica !== 'undefined') insertPayload.renovacion_automatica = payload.renovacion_automatica;
  if (typeof payload.max_colmenas !== 'undefined') insertPayload.max_colmenas = payload.max_colmenas;
  if (typeof payload.max_apiarios !== 'undefined') insertPayload.max_apiarios = payload.max_apiarios;
  if (typeof payload.max_usuarios !== 'undefined') insertPayload.max_usuarios = payload.max_usuarios;
  if (payload.notas) insertPayload.notas = payload.notas;

  const result = await db.insert(suscripcion_empresa).values(insertPayload).returning();
  return result[0];
}

export async function initUsoEmpresa(empresaId: string) {
  // Requiere agregar la tabla uso_empresa al schema
  const payload = {
    id_empresa: empresaId,
    total_apiarios: 0,
    total_colmenas: 0,
  };

  const result = await db.insert(uso_empresa).values(payload).returning();
  return result[0];
}

export async function initConfiguracionReporte(empresaId: string) {
  // Requiere agregar la tabla configuracion_reporte al schema
  const payload = {
    id_empresa: empresaId,
    tipo_reporte: 'predeterminado',
    descripcion: 'Configuración inicial',
    incluir_estado_colmenas: true,
    incluir_produccion: true,
    incluir_alertas: true,
    incluir_tendencias: false,
    incluir_comparativas: false,
    activo: true,
  };

  const result = await db.insert(configuracion_reporte).values(payload).returning();
  return result[0];
}

export async function onboardEmpresa(empresaId: string, opts: { suscripcion?: SuscripcionInput; admin?: UsuarioInput } = {}) {
  // Nota: esta operación NO es atómica. Para atomicidad, usar transacciones de Drizzle
  const results: any = {};

  if (opts.suscripcion) {
    results.suscripcion = await createSuscripcion(empresaId, opts.suscripcion);
  }

  if (opts.admin) {
    results.admin = await createUsuarioWithRole(empresaId, opts.admin);
  }

  results.uso_empresa = await initUsoEmpresa(empresaId);
  results.configuracion_reporte = await initConfiguracionReporte(empresaId);

  return results;
}
*/
