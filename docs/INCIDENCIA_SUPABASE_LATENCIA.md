# 🔴 Incidencia: Timeouts intermitentes en conexión a Supabase

## Resumen
Errores de `CONNECT_TIMEOUT` intermitentes al conectar desde Render (US) a Supabase (São Paulo). La aplicación funcionaba por segundos y luego fallaba con timeouts de conexión a la base de datos.

## Problema Detectado

### Síntomas
- Errores `CONNECT_TIMEOUT aws-1-sa-east-1.pooler.supabase.com:6543`
- La app funcionaba bien por ~30 segundos, luego fallaba
- Después de unos segundos, volvía a funcionar
- El patrón se repetía constantemente

### Causa Raíz
**Latencia geográfica excesiva** entre los servicios:
- **Render**: Ubicado en Oregon, US (us-west-2)
- **Supabase (original)**: Ubicado en São Paulo, Brasil (sa-east-1)
- Distancia: ~8,000 km
- Latencia: 100-300ms con picos que causaban timeouts

### Logs de Error
```
error: write CONNECT_TIMEOUT aws-1-sa-east-1.pooler.supabase.com:6543
   errno: "CONNECT_TIMEOUT",
 address: "aws-1-sa-east-1.pooler.supabase.com",
    port: 6543,
    code: "CONNECT_TIMEOUT"
```

## Solución Aplicada

### Migración de Base de Datos a Región Oregon (US West)

1. **Crear nuevo proyecto Supabase** en región `us-west-2` (Oregon)
2. **Exportar schema** del proyecto original (São Paulo)
3. **Crear tablas en orden correcto** (respetando foreign keys):
   - empresa, rol, tipo_alerta
   - usuario, dispositivo_simonia, apiario
   - colmena, lectura_sensor
   - alerta, inspecciones_colmenas
   - (y demás tablas dependientes)
4. **Migrar datos** tabla por tabla en orden de dependencias
5. **Crear índices** de optimización
6. **Actualizar Connection String** en Render

### Nueva Configuración
```
Render: Oregon, US (us-west-2)
Supabase: Oregon, US (us-west-2)
Latencia: ~5-15ms ✅
```

## Resultado

| Métrica | Antes (São Paulo) | Después (Oregon) |
|---------|-------------------|------------------|
| Latencia promedio | 100-300ms | 5-15ms |
| Timeouts | Frecuentes (~1 cada 2 min) | Ninguno |
| Estabilidad | Intermitente | Estable |

## Lecciones Aprendidas

1. **Siempre ubicar DB y servidor en la misma región** para aplicaciones en producción
2. El pooler de Supabase (`puerto 6543`) es sensible a la latencia
3. La opción `prepare: false` es obligatoria para Supabase Pooler
4. Los errores de `CONNECT_TIMEOUT` suelen ser problemas de red, no de código

## Configuración Final (db/index.ts)
```typescript
const connectionString = process.env.SUPABASE_DB_URL || "";
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
```

## Referencias
- [Supabase Connection Pooling Docs](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pool)
- [Drizzle + Supabase Setup](https://orm.drizzle.team/docs/get-started-postgresql#supabase)

---
**Estado**: ✅ Resuelto
**Fecha**: 31 Diciembre 2025
**Responsable**: Christian Villalobos
