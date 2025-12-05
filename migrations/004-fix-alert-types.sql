-- Migracion: Corregir tipo de datos en tipo_alerta
-- El esquema original usaba CHAR(1) lo cual es muy restrictivo para codigos como "TEMP_ALTA" o colores Hex.

ALTER TABLE tipo_alerta 
ALTER COLUMN codigo TYPE VARCHAR,
ALTER COLUMN color_hex TYPE VARCHAR;
