-- Migracion: Optimizacion Estandar (Sin TimescaleDB)

-- 1. Indices compostios para consultas frecuentes
-- Estos indices aceleran dramaticamente las consultas de graficos (filtrar por colmena y ordenar por fecha)

-- Para lectura_sensor
CREATE INDEX IF NOT EXISTS idx_lectura_colmena_fecha 
ON lectura_sensor (id_colmena, fecha_registro DESC);

-- Para historial_lectura_sensor
CREATE INDEX IF NOT EXISTS idx_historial_lectura_fecha 
ON historial_lectura_sensor (id_lectura, fecha_registro DESC);

-- 2. Indices adicionales utiles
-- Si se consulta mucho por fecha global (ej: "alertas de hoy en todo el sistema")
CREATE INDEX IF NOT EXISTS idx_lectura_fecha_global 
ON lectura_sensor (fecha_registro DESC);

-- NOTA: Como no usamos TimescaleDB, no creamos hypertables.
-- Postgres tiene "Partitioning" nativo si en el futuro la tabla crece a millones de filas.
-- Por ahora, estos indices son suficientes para el MVP y miles de registro