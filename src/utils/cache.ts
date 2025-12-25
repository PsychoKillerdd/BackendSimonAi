import NodeCache from 'node-cache';

// Crear una instancia de caché global
// stdTTL: Tiempo de vida por defecto en segundos (5 minutos)
// checkperiod: Cada cuánto se revisan las llaves expiradas
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Utilidad simple para manejar el cacheo de funciones asíncronas
 * @param key Llave del cache
 * @param ttl Tiempo de vida en segundos (opcional)
 * @param fetcher Función que obtiene los datos si no están en cache
 */
export async function getCachedData<T>(
    key: string,
    ttl: number | undefined,
    fetcher: () => Promise<T>
): Promise<T> {
    const cachedRecord = cache.get<T>(key);
    if (cachedRecord !== undefined) {
        console.log(`[Cache] HIT - Key: ${key}`);
        return cachedRecord;
    }

    console.log(`[Cache] MISS - Key: ${key}`);
    const data = await fetcher();

    if (ttl !== undefined) {
        cache.set(key, data, ttl);
    } else {
        cache.set(key, data);
    }

    return data;
}

/**
 * Borra una llave específica del cache
 */
export function invalidateCache(key: string) {
    cache.del(key);
}

/**
 * Borra todas las llaves que empiecen con un prefijo
 */
export function invalidateCacheByPrefix(prefix: string) {
    const keys = cache.keys();
    const keysToDelete = keys.filter(k => k.startsWith(prefix));
    if (keysToDelete.length > 0) {
        cache.del(keysToDelete);
    }
}

export default cache;
