const postgresDB = require("../db/postgres");

const updateClientsDebt = async () => {
  const sql = `
    UPDATE clients c
    SET has_debt = EXISTS (
      SELECT 1
      FROM orders o
      WHERE o.client_id = c.id
        AND o.payment_status_id NOT IN (2, 4) -- 2 = Pagado, 4 = En reclamo
    )
    WHERE TRUE;

    -- estadísticas
    SELECT
      COUNT(*)::int AS total_clients,
      COUNT(*) FILTER (WHERE has_debt = TRUE)::int AS with_debt,
      COUNT(*) FILTER (WHERE has_debt = FALSE)::int AS without_debt
    FROM clients;
  `;

  try {
    const res = await postgresDB.query(sql);
    // res[0] = UPDATE, res[1] = SELECT (dependiendo del driver)
    const stats = res[1]?.rows[0] || res.rows[0];
    return stats;
  } catch (err) {
    console.error("[updateClientsDebt] error:", err.message);
    throw err;
  }
};

module.exports = { updateClientsDebt };
