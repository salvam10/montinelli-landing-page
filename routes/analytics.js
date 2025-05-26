const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres"); // Ajusta si usas otro path

const AUTH_TOKEN = process.env.LOOKER_API_TOKEN || "mi-token-secreto";

router.get("/orders-summary", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const query = `
      SELECT 
        o.id AS order_id,
        o.created_at::date AS order_date,
        c.name AS client_name,
        o.total,
        o.payment_method,
        ps.name AS payment_status,
        o.invoice_number,
        o.invoice_date
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      LEFT JOIN payment_statuses ps ON o.payment_status_id = ps.id
      ORDER BY o.created_at DESC
      LIMIT 500
    `;

    const { rows } = await postgresDB.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error en /analytics/orders-summary:", error);
    res.status(500).json({ error: "Error al obtener resumen de órdenes" });
  }
});

module.exports = router;
