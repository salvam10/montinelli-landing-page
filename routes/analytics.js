const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres"); // Ajusta si usas otro path

// Token de seguridad (puedes usar .env o dejarlo hardcoded)
const AUTH_TOKEN = process.env.LOOKER_API_TOKEN || "1234miapitoken5678";

router.get("/orders-summary", async (req, res) => {
  const tokenFromQuery = req.query.token;
  const tokenFromHeader = req.headers.authorization?.split(" ")[1];
  const token = tokenFromQuery || tokenFromHeader;

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const query = `
      SELECT 
        orders.id, 
        orders.payment_status_id,
        orders.invoice_number,
        orders.invoice_date,
        orders.shipping_cost,
        orders.shipping_status,
        orders.subtotal, 
        orders.total, 
        orders.payment_method, 
        orders.user_id, 
        orders.client_id, 
        orders.created_at, 
        orders.updated_at,
        orders.payment_term_id,
        orders.billing_status,
        orders.due_date,
        orders.manager_approval_status,
        orders.actual_dispatch_date,
        orders.scheduled_dispatch_date,
        orders.shipping_company,
        orders.product_category_id,
        clients.name AS client_name,
        orders.status,
        users.firstname || ' ' || users.lastname AS user_fullname
      FROM orders
      JOIN clients ON orders.client_id = clients.id
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
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
