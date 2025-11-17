import supabase from '../config/db/supbase';
import {
  validatePaginationParams,
  buildPaginatedResponse,
  applySupabasePagination,
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
    telefono: payload.telefono ?? null,
    correo_contacto: payload.correo_contacto ?? null,
    estado_empresa: payload.estado_empresa ?? 'activa',
  };

  const { data, error } = await supabase.from('empresa').insert([insertPayload]).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAllEmpresas() {
  const { data, error } = await supabase
    .from('empresa')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function getEmpresaById(empresaId: string) {
  const { data, error } = await supabase
    .from('empresa')
    .select('*')
    .eq('id', empresaId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type PaginationOptions = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getEmpresasPaginated(options: PaginationOptions) {
  const page = parseInt(options.page || '1');
  const limit = parseInt(options.limit || '10');
  const sortBy = options.sortBy || 'id';
  const sortOrder = options.sortOrder || 'asc';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('empresa')
    .select('*', { count: 'exact' })
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) throw error;

  return {
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    }
  };
}

/**
 * Obtiene empresas con paginación
 * @param params - Parámetros de paginación (page, limit, sortBy, sortOrder)
 * @returns Respuesta paginada con empresas y metadata
 */
export async function getEmpresasPaginated(params: PaginationParams): Promise<PaginatedResponse<any>> {
  const validated = validatePaginationParams(params);

  // Obtener el total de empresas (para metadata)
  const { count, error: countError } = await supabase
    .from('empresa')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw countError;
  }

  const totalItems = count || 0;

  // Obtener empresas paginadas
  let query = supabase.from('empresa').select('*');
  query = applySupabasePagination(query, validated);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return buildPaginatedResponse(data || [], validated.page, validated.limit, totalItems);
}

/**
 * Obtiene una empresa por su ID
 * @param empresaId - ID de la empresa (UUID)
 * @returns Empresa encontrada o null
 */
export async function getEmpresaById(empresaId: string) {
  const { data, error } = await supabase
    .from('empresa')
    .select('*')
    .eq('id', empresaId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

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

export async function createSuscripcion(empresaId: number, payload: SuscripcionInput) {
  // Build payload without setting explicit nulls so DB defaults (e.g. CURRENT_DATE) apply
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

  const { data, error } = await supabase.from('suscripcion_empresa').insert([insertPayload]).select().single();

  if (error) throw error;
  return data;
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
  roleId?: number; // optional role id to assign
  roleName?: string; // optional role name to assign (eg 'admin'|'apicultor')
  password?: string; // optional plain password for initial creation
};

export async function getOrCreateRoleId(roleName: string) {
  // try to find role by nombre
  const { data: existing, error: findErr } = await supabase.from('rol').select('id').ilike('nombre', roleName).maybeSingle();
  if (findErr) throw findErr;
  if (existing && (existing as any).id) return (existing as any).id;

  // create role if not exists
  const { data: created, error: createErr } = await supabase.from('rol').insert([{ nombre: roleName, descripcion: null }]).select().single();
  if (createErr) throw createErr;
  return (created as any).id;
}

export async function createUsuarioWithRole(empresaId: any, payload: UsuarioInput) {
  // normalize tipo_usuario to avoid DB check failures (trim + lowercase)
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
    telefono: payload.telefono ?? null,
    // password handling: if provided, hash it and save into password_hash column
    // Note: the DB must have a password_hash column in `usuario` for this to persist
    password_hash: payload.password ? await (await import('./authService')).hashPassword(payload.password) : null,
  };

  const { data: userData, error: userError } = await supabase.from('usuario').insert([userPayload]).select().single();
  if (userError) throw userError;
  let roleId: number;
  if (payload.roleId) {
    roleId = payload.roleId;
  } else if (payload.roleName) {
    roleId = await getOrCreateRoleId(payload.roleName);
  } else {
    // default to role named 'admin' if exists or create it
    roleId = await getOrCreateRoleId('admin');
  }
  const rolPayload = {
    id_usuario: userData.id,
    id_rol: roleId,
  };

  const { data: usuarioRolData, error: rolError } = await supabase.from('usuario_rol').insert([rolPayload]).select().single();
  if (rolError) throw rolError;

  return { usuario: userData, usuario_rol: usuarioRolData };
}

export async function initUsoEmpresa(empresaId: number) {
  const payload = {
    id_empresa: empresaId,
    total_apiarios: 0,
    total_colmenas: 0,
  };

  const { data, error } = await supabase.from('uso_empresa').insert([payload]).select().single();
  if (error) throw error;
  return data;
}

export async function initConfiguracionReporte(empresaId: number) {
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

  const { data, error } = await supabase.from('configuracion_reporte').insert([payload]).select().single();
  if (error) throw error;
  return data;
}

export async function onboardEmpresa(empresaId: number, opts: { suscripcion?: SuscripcionInput; admin?: UsuarioInput } = {}) {
  // Nota: esta operación NO es atómica. Para atomicidad, usar RPC o transacción Postgres.
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
