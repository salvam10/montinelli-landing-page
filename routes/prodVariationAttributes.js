const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todas las variaciones de productos
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await postgresDB.query("SELECT * FROM product_variations");
    const variations = rows;
    res.status(201).send(variations);
  } catch (error) {
    console.log(error);
  }
});

//Obtener una variación de producto por su id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM product_variations WHERE id = $1",
      [id]
    );
    const variation = rows;
    res.status(201).send(variation);
  } catch (error) {
    console.log(error);
  }
});

/* agregar nueva variación de producto */
router.post("/", async (req, res, next) => {
  const { product_id, sku, price } = req.body;
  try {
    const { rows } = await postgresDB.query(
      `INSERT INTO product_variations(product_id, sku, price) VALUES($1, $2, $3) RETURNING *`,
      [product_id, sku, price]
    );
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Eliminar a una variación de producto
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM product_variations WHERE id = $1 RETURNING *";
  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Variación de producto no encontrada" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//actualizar la variación de un producto
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { product_id, sku, price } = req.body;

  let updateQuery = "UPDATE products SET ";
  let updateValues = [];
  let count = 1;

  // Construir la consulta de actualización dinámica
  if (product_id !== undefined) {
    updateQuery += `product_id = $${count}, `;
    updateValues.push(product_id);
    count++;
  }
  if (sku !== undefined) {
    updateQuery += `sku = $${count}, `;
    updateValues.push(sku);
    count++;
  }
  if (price !== undefined) {
    updateQuery += `price = $${count}, `;
    updateValues.push(price);
    count++;
  }

  // Eliminar la coma adicional al final y agregar la condición WHERE
  updateQuery = updateQuery.slice(0, -2); // Eliminar la coma y el espacio al final
  updateQuery += ` WHERE id = $${count} RETURNING *`;
  updateValues.push(id);

  try {
    // Ejecutar la consulta de actualización
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Variación no encontrada" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      error:
        "Hubo un error al actualizar la variación de producto en el backend",
    });
  }
});

module.exports = router;
