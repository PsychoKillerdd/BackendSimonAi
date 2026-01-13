/**
 * Utilidades de validación para el backend
 * Mejora la seguridad validando inputs antes de queries
 */

// Regex para validar UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Valida si una cadena es un UUID v4 válido
 */
export function isValidUUID(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false;
  return UUID_REGEX.test(value);
}

/**
 * Valida y sanitiza un email
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
}

/**
 * Sanitiza una cadena removiendo caracteres peligrosos
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y > para prevenir XSS
    .substring(0, 1000); // Limitar longitud
}

/**
 * Valida que un número esté en un rango válido
 */
export function isValidNumber(
  value: unknown,
  min: number = -Infinity,
  max: number = Infinity
): boolean {
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num >= min && num <= max;
}

/**
 * Valida datos de lectura de sensor IoT
 */
export function validateLecturaInput(data: {
  codigo_dispositivo?: string;
  temperatura_c?: number;
  humedad_h?: number;
  peso_kg?: number;
  sonido_hz?: number;
  presion_hpa?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Código de dispositivo es obligatorio
  if (!data.codigo_dispositivo || typeof data.codigo_dispositivo !== 'string') {
    errors.push('codigo_dispositivo es requerido');
  } else if (data.codigo_dispositivo.length > 50) {
    errors.push('codigo_dispositivo excede longitud máxima (50 caracteres)');
  }

  // Validar rangos de sensores si están presentes
  if (data.temperatura_c !== undefined) {
    if (!isValidNumber(data.temperatura_c, -50, 100)) {
      errors.push('temperatura_c debe estar entre -50 y 100°C');
    }
  }

  if (data.humedad_h !== undefined) {
    if (!isValidNumber(data.humedad_h, 0, 100)) {
      errors.push('humedad_h debe estar entre 0 y 100%');
    }
  }

  if (data.peso_kg !== undefined) {
    if (!isValidNumber(data.peso_kg, 0, 500)) {
      errors.push('peso_kg debe estar entre 0 y 500kg');
    }
  }

  if (data.sonido_hz !== undefined) {
    if (!isValidNumber(data.sonido_hz, 0, 20000)) {
      errors.push('sonido_hz debe estar entre 0 y 20000Hz');
    }
  }

  if (data.presion_hpa !== undefined) {
    if (!isValidNumber(data.presion_hpa, 800, 1200)) {
      errors.push('presion_hpa debe estar entre 800 y 1200hPa');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Limpia y valida parámetros de paginación
 */
export function sanitizePaginationParams(params: {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
}): {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
} {
  const page = Math.max(1, parseInt(String(params.page)) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(params.limit)) || 20));
  const sortBy = ['id', 'nombre', 'fecha_registro', 'fecha_creacion'].includes(params.sortBy || '')
    ? params.sortBy!
    : 'id';
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

  return { page, limit, sortBy, sortOrder };
}

export default {
  isValidUUID,
  isValidEmail,
  sanitizeString,
  isValidNumber,
  validateLecturaInput,
  sanitizePaginationParams,
};
