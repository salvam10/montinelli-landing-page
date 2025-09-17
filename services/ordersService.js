const postgresDB = require("../db/postgres");

const updateOrderPaymentStatus = async () => {
  const sql = `
    UPDATE orders o
    SET payment_status_id = CASE
      WHEN o.payment_status_id = 2 THEN o.payment_status_id -- Pagado
      WHEN o.payment_status_id = 4 THEN o.payment_status_id -- En reclamo
      WHEN CURRENT_DATE > o.due_date THEN 3                 -- Vencido
      ELSE 1                                                -- Pendiente de pago
    END
    WHERE TRUE;
  `;

  try {
    // 1. Cuántas filas existen antes de actualizar
    const before = await postgresDB.query(`SELECT COUNT(*) FROM orders`);
    console.log(
      `[updateOrderPaymentStatus] Total de órdenes antes de update: ${before.rows[0].count}`
    );

    // 2. Ejecuta el UPDATE
    const res = await postgresDB.query(sql);
    console.log(
      `[updateOrderPaymentStatus] Filas actualizadas en este ciclo: ${res.rowCount}`
    );

    // 3. Agrupa después de actualizar
    const counts = await postgresDB.query(`
      SELECT payment_status_id, COUNT(*) AS total
      FROM orders
      GROUP BY payment_status_id
      ORDER BY payment_status_id;
    `);

    // 4. Loguea cada categoría
    counts.rows.forEach((row) => {
      switch (Number(row.payment_status_id)) {
        case 1:
          console.log(
            `[updateOrderPaymentStatus] Pendiente de pago: ${row.total}`
          );
          break;
        case 2:
          console.log(`[updateOrderPaymentStatus] Pagadas: ${row.total}`);
          break;
        case 3:
          console.log(`[updateOrderPaymentStatus] Vencidas: ${row.total}`);
          break;
        case 4:
          console.log(`[updateOrderPaymentStatus] En reclamo: ${row.total}`);
          break;
        default:
          console.log(
            `[updateOrderPaymentStatus] Status ${row.payment_status_id}: ${row.total}`
          );
      }
    });

    return res.rowCount;
  } catch (err) {
    console.error("[updateOrderPaymentStatus] error:", err.message);
    throw err;
  }
};

module.exports = { updateOrderPaymentStatus };
