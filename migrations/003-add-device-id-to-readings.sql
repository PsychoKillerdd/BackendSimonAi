-- Migracion: Agregar trazabilidad (id_dispositivo) a lecturas

-- 1. Agregar columna id_dispositivo
-- Permitimos NULL inicialmente para no fallar con datos viejos
ALTER TABLE lectura_sensor 
ADD COLUMN id_dispositivo UUID REFERENCES dispositivo_simonia(id);

-- 2. Crear indice para realizar busquedas por dispositivo rapidamente
CREATE INDEX IF NOT EXISTS idx_lectura_dispositivo 
ON lectura_sensor (id_dispositivo, fecha_registro DESC);
