const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todas las ordenes
router.get("/", async (req, res) => {
  let { manager_approval_status, product_category_id } = req.query;

  let query = `
    SELECT 
      orders.id, 
      orders.payment_status_id,
      orders.invoice_number,
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
  `;

  const conditions = [];
  const values = [];

  // Condición por manager_approval_status
  if (manager_approval_status) {
    conditions.push(
      `LOWER(orders.manager_approval_status) = $${values.length + 1}`
    );
    values.push(manager_approval_status.toLowerCase());
  }

  // Condición por product_category_id
  if (product_category_id) {
    conditions.push(`orders.product_category_id = $${values.length + 1}`);
    values.push(product_category_id);
  }

  // Agregar condiciones dinámicas si existen
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  // Orden final
  query += ` ORDER BY orders.id DESC`;

  try {
    const result = await postgresDB.query(query, values);
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
        orders.shipping_cost,
        orders.shipping_status,
        orders.shipping_company,
        orders.scheduled_dispatch_date,
        orders.actual_dispatch_date,
        orders.subtotal, 
        orders.total, 
        orders.payment_method, 
        orders.user_id, 
        orders.client_id, 
        orders.created_at, 
        orders.updated_at,
        clients.name AS client_name,
        orders.status,
        orders.invoice_number,
        orders.payment_term_id,
        orders.due_date,
        orders.manager_approval_status,
        orders.product_category_id,
        payment_terms.days AS payment_term_days,
        payment_terms.description AS payment_term_description,
        payment_terms.name AS payment_term_name,
        payment_statuses.status AS payment_status,
        users.firstname || ' ' || users.lastname AS user_fullname
      FROM orders
      JOIN clients ON orders.client_id = clients.id
      JOIN users ON orders.user_id = users.id
      JOIN payment_statuses ON orders.payment_status_id = payment_statuses.id
      JOIN payment_terms ON orders.payment_term_id = payment_terms.id
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

// Obtener todas las órdenes de un vendedor o usuario
router.get("/seller/:userId", async (req, res) => {
  const { userId } = req.params;
  let { product_category_id } = req.query;

  let query = `
    SELECT 
      orders.id, 
      orders.payment_status_id,
      orders.invoice_number,
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
  `;

  const conditions = [];
  const values = [];

  // Condición por product_category_id
  if (product_category_id) {
    conditions.push(`orders.product_category_id = $${values.length + 1}`);
    values.push(product_category_id);
  }

  // Condición por user_id
  if (userId) {
    conditions.push(`orders.user_id = $${values.length + 1}`);
    values.push(userId);
  }

  // Agregar condiciones dinámicas si existen
  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  // Orden final
  query += ` ORDER BY orders.id DESC`;

  try {
    const result = await postgresDB.query(query, values);
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
      "SELECT p.*, oi.quantity, oi.price AS order_price FROM products p JOIN order_items oi ON p.id = oi.product_id JOIN orders o ON oi.order_id = o.id WHERE o.id = $1",
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
      JOIN Orders o ON c.id = o.client_id
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
    payment_status_id,
    subtotal,
    shipping_cost,
    shipping_status,
    total,
    payment_method,
    client_id,
  } = req.body;

  const insertQuery = `
    INSERT INTO orders (payment_status_id, subtotal, shipping_cost, shipping_status, total, payment_method, user_id, client_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  try {
    const { rows } = await postgresDB.query(insertQuery, [
      payment_status_id,
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
      tax_percentage,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al agregar el producto a la orden:", error);
    res.status(500).json({
      error: "Hubo un error al agregar el producto a la orden",
    });
  }
});

//Crear ordenes para cada categoria de producto y además agregar los productos a la orden.
router.post("/split-by-category", async (req, res) => {
  const {
    user_id,
    client_id,
    payment_method,
    payment_status_id,
    manager_approval_status,
    shipping_status,
    shipping_cost,
    invoice_date,
    invoice_number,
    products = [],
  } = req.body;

  try {
    const uniqueCategoryIds = [...new Set(products.map((p) => p.category_id))];

    const categoryQuery = `
      SELECT id, name
      FROM product_categories
      WHERE id = ANY($1)
    `;
    const { rows: categoryRows } = await postgresDB.query(categoryQuery, [
      uniqueCategoryIds,
    ]);

    const categoryMap = {};
    categoryRows.forEach((cat) => {
      categoryMap[cat.id] = cat.name;
    });

    const productsByCategory = products.reduce((acc, product) => {
      const categoryName = categoryMap[product.category_id] || "otros";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(product);
      return acc;
    }, {});

    const ordersCreated = [];

    for (const [category, categoryProducts] of Object.entries(
      productsByCategory
    )) {
      const subtotal = categoryProducts.reduce(
        (sum, product) => sum + product.base_price * product.quantity,
        0
      );
      const total = subtotal + shipping_cost;

      const product_category_id = categoryProducts[0].category_id;

      const createOrderQuery = `
        INSERT INTO orders (
          payment_status_id,
          subtotal,
          shipping_cost,
          shipping_status,
          total,
          payment_method,
          user_id,
          product_category_id,
          client_id,
          manager_approval_status,
          invoice_date,
          invoice_number
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const {
        rows: [order],
      } = await postgresDB.query(createOrderQuery, [
        payment_status_id,
        subtotal,
        shipping_cost,
        shipping_status,
        total,
        payment_method,
        user_id,
        product_category_id,
        client_id,
        manager_approval_status,
        invoice_date,
        invoice_number,
      ]);

      for (const product of categoryProducts) {
        const createOrderItemQuery = `
          INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            price,
            tax_percentage
          )
          VALUES ($1, $2, $3, $4, $5)
        `;

        await postgresDB.query(createOrderItemQuery, [
          order.id,
          product.id,
          product.quantity,
          product.base_price,
          product.tax_percentage,
        ]);
      }

      ordersCreated.push(order);
    }

    res.status(201).json(ordersCreated);
  } catch (error) {
    console.error("Error al crear órdenes por categoría:", error);
    res.status(500).json({
      error: "Hubo un error al crear las órdenes por categoría",
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
    payment_status_id,
    payment_method,
    subtotal,
    shipping_cost,
    shipping_status,
    shipping_company,
    scheduled_dispatch_date,
    actual_dispatch_date,
    total,
    client_id,
    payment_term_id,
    manager_approval_status,
    due_date,
    invoice_number,
  } = req.body;

  let updateQuery = "UPDATE orders SET ";
  let updateValues = [];
  let count = 1;

  // Construir la consulta de actualización dinámica
  if (invoice_number !== undefined) {
    updateQuery += `invoice_number = $${count}, `;
    updateValues.push(invoice_number);
    count++;
  }
  if (shipping_company !== undefined) {
    updateQuery += `shipping_company = $${count}, `;
    updateValues.push(shipping_company);
    count++;
  }
  if (scheduled_dispatch_date !== undefined) {
    updateQuery += `scheduled_dispatch_date = $${count}, `;
    updateValues.push(scheduled_dispatch_date);
    count++;
  }
  if (actual_dispatch_date !== undefined) {
    updateQuery += `actual_dispatch_date = $${count}, `;
    updateValues.push(actual_dispatch_date);
    count++;
  }
  if (manager_approval_status !== undefined) {
    updateQuery += `manager_approval_status = $${count}, `;
    updateValues.push(manager_approval_status);
    count++;
  }
  if (due_date !== undefined) {
    updateQuery += `due_date = $${count}, `;
    updateValues.push(due_date);
    count++;
  }
  if (payment_term_id !== undefined) {
    updateQuery += `payment_term_id = $${count}, `;
    updateValues.push(payment_term_id);
    count++;
  }
  if (payment_status_id !== undefined) {
    updateQuery += `payment_status_id = $${count}, `;
    updateValues.push(payment_status_id);
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
