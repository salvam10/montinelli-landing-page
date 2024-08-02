const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todas las ordenes
router.get("/", async (req, res) => {
  try {
    const result = await postgresDB.query(`
        SELECT 
      orders.id, 
      orders.payment_status,
      orders.shipping_cost,
      orders.shipping_status,
      orders.subtotal, 
      orders.total, 
      orders.payment_method, 
      orders.user_id, 
      orders.client_id, 
      orders.created_at, 
      orders.updated_at,
      clients.name AS client_name,
      users.firstname || ' ' || users.lastname AS user_fullname
    FROM orders
    JOIN clients ON orders.client_id = clients.rif
    JOIN users ON orders.user_id = users.id
    `);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Órdenes no encontradas" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
    res.status(500).json({
      error: "Hubo un error al obtener las órdenes",
    });
  }
});


// Obtener una orden por su id
router.get("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await postgresDB.query(
      `
      SELECT 
        orders.id, 
        orders.payment_status,
        orders.shipping_cost,
        orders.shipping_status,
        orders.subtotal, 
        orders.total, 
        orders.payment_method, 
        orders.user_id, 
        orders.client_id, 
        orders.created_at, 
        orders.updated_at,
        clients.name AS client_name,
        users.firstname || ' ' || users.lastname AS user_fullname
      FROM orders
      JOIN clients ON orders.client_id = clients.rif
      JOIN users ON orders.user_id = users.id
      WHERE orders.id = $1
    `,
      [orderId]
    ); // Aquí pasamos el orderId como parámetro de consulta
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Órdenes no encontradas" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});


// Obtener todas las órdenes de un usuario
router.get("/:userId/orders", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await postgresDB.query(
      "SELECT * FROM orders WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Órdenes no encontradas" });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener las órdenes:", error);
    res.status(500).json({
      error: "Hubo un error al obtener las órdenes",
    });
  }
});

// Obtener productos de una orden
router.get("/:orderId/items", async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const { rows } = await postgresDB.query(
      "SELECT p.*, oi.quantity, oi.price FROM products p JOIN order_items oi ON p.id = oi.product_id JOIN orders o ON oi.order_id = o.id WHERE o.id = $1",
      [orderId]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Productos no encontrados en la orden" });
    }
    res.status(200).send(rows);
  } catch (error) {
    console.error("Error al obtener los productos de la orden:", error);
    res
      .status(500)
      .json({ message: "Hubo un error al obtener los productos de la orden" });
  }
});

// Obtener cliente por id de orden
router.get("/:orderId/client", async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const query = `
      SELECT c.*
      FROM Clients c
      JOIN Orders o ON c.rif = o.client_id
      WHERE o.id = $1
    `;
    const { rows } = await postgresDB.query(query, [orderId]);
    const client = rows[0]; // Asumimos que cada orden tiene un solo cliente
    res.status(200).send(client);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los datos del cliente");
  }
});

// Crear una nueva orden para el usuario
router.post("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const {
    payment_status,
    subtotal,
    shipping_cost,
    shipping_status,
    total,
    payment_method,
    client_id,
  } = req.body;
  console.log("payment_method", payment_method);
  const insertQuery = `
    INSERT INTO orders (payment_status, subtotal, shipping_cost, shipping_status, total, payment_method, user_id, client_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  try {
    const { rows } = await postgresDB.query(insertQuery, [
      payment_status,
      subtotal,
      shipping_cost,
      shipping_status,
      total,
      payment_method,
      userId,
      client_id,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear la orden:", error);
    res.status(500).json({
      error: "Hubo un error al crear la orden",
    });
  }
});

// Agregar un producto a una orden
router.post("/:orderId/items", async (req, res) => {
  const { orderId } = req.params;
  const { product_id, quantity, price, tax_percentage } = req.body;

  const insertQuery = `
    INSERT INTO order_items (order_id, product_id, quantity, price, tax_percentage)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  try {
    const { rows } = await postgresDB.query(insertQuery, [
      orderId,
      product_id,
      quantity,
      price,
      tax_percentage
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al agregar el producto a la orden:", error);
    res.status(500).json({
      error: "Hubo un error al agregar el producto a la orden",
    });
  }
});

// Eliminar una orden
router.delete("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const query = `DELETE FROM orders 
             WHERE id = $1
             RETURNING *`;
  try {
    const result = await postgresDB.query(query, [orderId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    res.send(result.rows[0]);
  } catch (error) {
    console.error("Error al eliminar una orden:", error);
    res.status(500).json({
      error: "Hubo un error al eliminar una orden",
    });
  }
});

//actualizar una orden
router.put("/:orderId", async (req, res, next) => {
  const { orderId } = req.params;
  const {
    payment_status,
    payment_method,
    subtotal,
    shipping_cost,
    shipping_status,
    total,
    client_id,
  } = req.body;

  let updateQuery = "UPDATE orders SET ";
  let updateValues = [];
  let count = 1;

  // Construir la consulta de actualización dinámica
  if (payment_status !== undefined) {
    updateQuery += `payment_status = $${count}, `;
    updateValues.push(payment_status);
    count++;
  }
  if (payment_method !== undefined) {
    updateQuery += `payment_method = $${count}, `;
    updateValues.push(payment_method);
    count++;
  }
  if (subtotal !== undefined) {
    updateQuery += `subtotal = $${count}, `;
    updateValues.push(subtotal);
    count++;
  }
  if (shipping_cost !== undefined) {
    updateQuery += `shipping_cost = $${count}, `;
    updateValues.push(shipping_cost);
    count++;
  }
  if (shipping_status !== undefined) {
    updateQuery += `shipping_status = $${count}, `;
    updateValues.push(shipping_status);
    count++;
  }
  if (total !== undefined) {
    updateQuery += `total = $${count}, `;
    updateValues.push(total);
    count++;
  }
  if (client_id !== undefined) {
    updateQuery += `client_id = $${count}, `;
    updateValues.push(client_id);
    count++;
  }

  // Eliminar la coma adicional al final y agregar la condición WHERE
  updateQuery = updateQuery.slice(0, -2); // Eliminar la coma y el espacio al final

  updateQuery += ` WHERE id = $${count} RETURNING *`;
  updateValues.push(orderId);

  try {
    // Ejecutar la consulta de actualización
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar la orden  en el backend",
    });
  }
});

module.exports = router;
