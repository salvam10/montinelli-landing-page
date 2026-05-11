-- Agregar columna banco a la tabla payments
-- Ejecutar manualmente contra la BD de producción/staging antes de deployar

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS bank VARCHAR(100);
