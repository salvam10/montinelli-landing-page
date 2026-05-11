-- Agregar columnas de reporte de pago del vendedor a la tabla payments
-- Ejecutar manualmente contra la BD de producción/staging antes de deployar

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS notes        TEXT,
  ADD COLUMN IF NOT EXISTS receipt_url   VARCHAR(500),
  ADD COLUMN IF NOT EXISTS payment_date  DATE,
  ADD COLUMN IF NOT EXISTS reported_by   BIGINT REFERENCES users(id);

-- Índice para buscar pagos por vendedor (reported_by)
CREATE INDEX IF NOT EXISTS idx_payments_reported_by ON payments(reported_by);
