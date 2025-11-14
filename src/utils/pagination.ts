/**
 * Utilidad de paginación reutilizable para grandes volúmenes de datos
 */

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Valida y normaliza los parámetros de paginación
 * @param params - Parámetros de paginación crudos
 * @returns Parámetros normalizados
 */
export function validatePaginationParams(params: PaginationParams) {
  const page = Math.max(1, parseInt(String(params.page || 1), 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(String(params.limit || 10), 10) || 10)); // max 100 items por página
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';
  
  return {
    page,
    limit,
    sortBy: params.sortBy || 'id',
    sortOrder,
    offset: (page - 1) * limit,
  };
}

/**
 * Construye la metadata de paginación
 * @param page - Página actual
 * @param limit - Items por página
 * @param totalItems - Total de items en la base de datos
 * @returns Metadata de paginación
 */
export function buildPaginationMeta(
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    pageSize: limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * Construye una respuesta paginada completa
 * @param data - Datos de la página actual
 * @param page - Página actual
 * @param limit - Items por página
 * @param totalItems - Total de items
 * @returns Respuesta paginada
 */
export function buildPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number
): PaginatedResponse<T> {
  return {
    data,
    meta: buildPaginationMeta(page, limit, totalItems),
  };
}

/**
 * Aplica paginación a una query de Supabase
 * @param query - Query de Supabase
 * @param params - Parámetros de paginación validados
 * @returns Query con paginación aplicada
 */
export function applySupabasePagination<T>(
  query: any,
  params: ReturnType<typeof validatePaginationParams>
) {
  return query
    .order(params.sortBy, { ascending: params.sortOrder === 'asc' })
    .range(params.offset, params.offset + params.limit - 1);
}
