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
      WHERE orders.invoice_date IS NOT NULL 
        AND orders.invoice_number IS NOT NULL
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

router.get("/clients-summary", async (req, res) => {
  const tokenFromQuery = req.query.token;
  const tokenFromHeader = req.headers.authorization?.split(" ")[1];
  const token = tokenFromQuery || tokenFromHeader;

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const query = `
      SELECT
      clients.id AS client_id,
      clients.name AS client_name,
      clients.rif AS client_rif,
      clients.phone AS client_phone,
      clients.city AS client_city,
      clients.municipality AS client_municipality,
      clients.state AS client_state,
      clients.created_at AS client_created_at,
      COUNT(orders.id) AS total_orders,
      MIN(orders.invoice_date) AS first_purchase_date,
      MAX(orders.invoice_date) AS last_purchase_date,
      CASE 
        WHEN COUNT(orders.id) > 1 THEN true 
        ELSE false 
      END AS has_repeat_purchase
    FROM clients
    LEFT JOIN orders ON orders.client_id = clients.id
    GROUP BY clients.id, clients.name, clients.rif, clients.phone,    clients.city, clients.municipality, clients.state, clients.created_at
    ORDER BY last_purchase_date DESC NULLS LAST;
    `;
    const { rows } = await postgresDB.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error en /analytics/clients-summary:", error);
    res.status(500).json({ error: "Error al obtener resumen de clientes" });
  }
});

module.exports = router;
