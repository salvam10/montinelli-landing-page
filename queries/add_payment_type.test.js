const fs = require("fs");
const path = require("path");

describe("queries/add_payment_type.sql", () => {
  const migrationPath = path.join(__dirname, "add_payment_type.sql");

  const readMigration = () => fs.readFileSync(migrationPath, "utf8");

  test("agrega la columna payment_type de forma idempotente", () => {
    const sql = readMigration();

    expect(sql).toContain("ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20)");
  });

  test("protege el constraint para poder ejecutar la migración dos veces", () => {
    const sql = readMigration();

    expect(sql).toContain("CHECK (payment_type IN ('pago_factura', 'retencion', 'ambos'))");
    expect(sql).toContain("EXCEPTION WHEN duplicate_object THEN NULL");
  });
});
