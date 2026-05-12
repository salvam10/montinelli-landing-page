-- Agregar tipo de pago a la tabla payments
-- Ejecutar manualmente contra la BD de producción/staging antes de deployar

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20);

DO $$
BEGIN
  ALTER TABLE payments
    ADD CONSTRAINT chk_payment_type
    CHECK (payment_type IN ('pago_factura', 'retencion', 'ambos'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
