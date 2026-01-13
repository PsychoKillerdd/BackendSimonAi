import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Almacenamiento en memoria para rate limiting
const requestCounts = new Map<string, RateLimitEntry>();

// Limpieza periódica cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCounts.entries()) {
    if (now > entry.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number;     // Ventana de tiempo en milisegundos
  maxRequests: number;  // Máximo de peticiones por ventana
  keyGenerator?: (req: Request) => string; // Función para generar la clave (por defecto IP)
}

/**
 * Middleware de Rate Limiting simple basado en memoria
 * Para producción con múltiples instancias, usar Redis
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Generar clave única (por defecto: IP)
    const key = keyGenerator 
      ? keyGenerator(req) 
      : req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    
    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry || now > entry.resetTime) {
      // Nueva ventana
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (entry.count >= maxRequests) {
      // Límite excedido
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', retryAfter.toString());
      return res.status(429).json({
        success: false,
        error: 'Demasiadas solicitudes. Intente más tarde.',
        retryAfter: retryAfter
      });
    }

    // Incrementar contador
    entry.count++;
    next();
  };
}

// Rate limiter específico para endpoint IoT (más permisivo)
export const iotRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,  // 1 minuto
  maxRequests: 120,     // 120 peticiones por minuto (2/seg)
  keyGenerator: (req) => {
    // Usar código de dispositivo si está disponible, sino IP
    const codigoDispositivo = req.body?.codigo_dispositivo;
    if (codigoDispositivo && typeof codigoDispositivo === 'string') {
      return `device:${codigoDispositivo}`;
    }
    return `ip:${req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown'}`;
  }
});

// Rate limiter para endpoints de autenticación (más estricto)
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  maxRequests: 10,            // 10 intentos de login
});

// Rate limiter general para API
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,   // 1 minuto
  maxRequests: 100,       // 100 peticiones por minuto
});
