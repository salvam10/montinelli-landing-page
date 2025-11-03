const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

/* ============================================================
   GET - Obtener todos los ítems de una orden
============================================================ */
router.get("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;

  const query = `
    SELECT 
      oi.product_id,
      oi.order_id,
      p.name AS product_name,
      p.description AS product_description,
      p.media_url,
      oi.quantity,
      oi.price,
      oi.discount_pct,
      oi.tax_percentage,
      (oi.price * oi.quantity * (1 - oi.discount_pct / 100)) AS subtotal
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
    ORDER BY oi.product_id ASC
  `;

  try {
    const { rows } = await postgresDB.query(query, [orderId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener los ítems de la orden:", error);
    res.status(500).json({
      error: "Hubo un error al obtener los ítems de la orden",
    });
  }
});

/* ============================================================
   POST - Crear un nuevo ítem en una orden
============================================================ */
router.post("/order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const {
    product_id,
    quantity,
    price,
    tax_percentage,
    discount_pct = 0,
  } = req.body;

  const insertQuery = `
    INSERT INTO order_items (
      order_id, product_id, quantity, price, tax_percentage, discount_pct
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  try {
    const { rows } = await postgresDB.query(insertQuery, [
      orderId,
      product_id,
      quantity,
      price,
      tax_percentage,
      discount_pct,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear el ítem:", error);
    res.status(500).json({
      error: "Hubo un error al crear el ítem en la orden",
    });
  }
});


/* ============================================================
   POST - Crear multiples ítems en una orden (bulk)
============================================================ */
router.post("/order/:orderId/items/bulk", async (req, res) => {
  const { orderId } = req.params;
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res
      .status(400)
      .json({ message: "Debe enviar un array de productos" });
  }

  // Campos explícitos, pero fáciles de extender
  const columns = [
    "order_id",
    "product_id",
    "quantity",
    "price",
    "tax_percentage",
    "discount_pct",
  ];

  const placeholders = [];
  const values = [];

  products.forEach((p, i) => {
    const offset = i * columns.length;
    placeholders.push(
      `(${columns.map((_, j) => `$${offset + j + 1}`).join(", ")})`
    );
    values.push(
      orderId,
      p.id,
      p.quantity ?? 1,
      p.base_price,
      p.tax_percentage ?? 0,
      p.discount_pct ?? 0
    );
  });

  const query = `
    INSERT INTO order_items (${columns.join(", ")})
    VALUES ${placeholders.join(", ")}
    RETURNING *;
  `;

  try {
    const { rows } = await postgresDB.query(query, values);
    res.status(201).json(rows);
  } catch (error) {
    console.error("Error al insertar productos:", error);
    res.status(500).json({ message: "Error interno al agregar productos" });
  }
});




/* ============================================================
   PUT - Actualizar un ítem individual (usa order_id + product_id)
============================================================ */
router.put("/order/:orderId/product/:productId", async (req, res) => {
  const { orderId, productId } = req.params;
  const { quantity, price, discount_pct, tax_percentage } = req.body;

  console.log('body', req.body);
  

  let updateQuery = "UPDATE order_items SET ";
  const updateValues = [];
  let count = 1;

  if (quantity !== undefined) {
    updateQuery += `quantity = $${count}, `;
    updateValues.push(quantity);
    count++;
  }

  if (price !== undefined) {
    updateQuery += `price = $${count}, `;
    updateValues.push(price);
    count++;
  }

  if (discount_pct !== undefined) {
    updateQuery += `discount_pct = $${count}, `;
    updateValues.push(discount_pct);
    count++;
  }

  if (tax_percentage !== undefined) {
    updateQuery += `tax_percentage = $${count}, `;
    updateValues.push(tax_percentage);
    count++;
  }

  if (updateValues.length === 0) {
    return res.status(400).json({ message: "No hay campos para actualizar" });
  }

  
  updateQuery = updateQuery.slice(0, -2);
  updateQuery += ` WHERE order_id = $${count} AND product_id = $${
    count + 1
  } RETURNING *`;
  updateValues.push(orderId, productId);

  console.log('updateQuery', updateQuery);
  

  try {
    const { rows } = await postgresDB.query(updateQuery, updateValues);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ítem no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar el ítem:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar el ítem",
    });
  }
});

/* ============================================================
   PUT - Actualizar múltiples ítems (bulk update)
============================================================ */
router.put("/order/:orderId/bulk", async (req, res) => {
  const { orderId } = req.params;
  const { items = [] } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: "No se enviaron ítems para actualizar." });
  }

  const client = await postgresDB.connect();
  try {
    await client.query("BEGIN");

    for (const item of items) {
      await client.query(
        `
        UPDATE order_items
        SET quantity = $1,
            price = $2,
            discount_pct = $3,
            tax_percentage = $4
        WHERE order_id = $5 AND product_id = $6
        `,
        [
          item.quantity,
          item.price,
          item.discount_pct ?? 0,
          item.tax_percentage ?? 0,
          orderId,
          item.product_id,
        ]
      );
    }

    await client.query("COMMIT");
    res.status(200).json(items);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar múltiples ítems:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar los ítems de la orden",
    });
  } finally {
    client.release();
  }
});

/* ============================================================
   DELETE - Eliminar un ítem (usa order_id + product_id)
============================================================ */
router.delete("/order/:orderId/product/:productId", async (req, res) => {
  const { orderId, productId } = req.params;

  const deleteQuery = `
    DELETE FROM order_items
    WHERE order_id = $1 AND product_id = $2
    RETURNING *
  `;

  try {
    const { rows } = await postgresDB.query(deleteQuery, [orderId, productId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Ítem no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al eliminar el ítem:", error);
    res.status(500).json({
      error: "Hubo un error al eliminar el ítem",
    });
  }
});

module.exports = router;
