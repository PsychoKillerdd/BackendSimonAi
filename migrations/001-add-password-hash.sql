-- Migration: add password_hash to usuario table
-- Run this on your Supabase/Postgres instance if the column doesn't exist.

ALTER TABLE IF EXISTS usuario
  ADD COLUMN IF NOT EXISTS password_hash text;

-- Optional: create unique index on correo if not present
-- CREATE UNIQUE INDEX IF NOT EXISTS usuario_correo_unique ON usuario(lower(correo));
