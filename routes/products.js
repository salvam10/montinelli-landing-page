const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todos los productos
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await postgresDB.query("SELECT * FROM products");
    const products = rows;
    res.status(201).send(products);
  } catch (error) {
    console.log(error);
  }
});

//Obtener un producto por su id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    const product = rows;
    res.status(201).send(product);
  } catch (error) {
    console.log(error);
  }
});

// Obtener productos por categoría
router.get("/category/:categoryId", async (req, res) => {
  const categoryId = req.params.categoryId;
  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM products WHERE category_id = $1",
      [categoryId]
    );
    res.status(200).send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los productos por categoría");
  }
});



/* agregar un nuevo producto */
router.post("/", async (req, res, next) => {
  const {
    name,
    description,
    base_price,
    stock,
    media_url,
    brand_id,
    category_id,
  } = req.body;

  let insertQuery = "INSERT INTO products(";
  let valueQuery = "VALUES(";
  let insertValues = [];
  let count = 1;

  // Construir la consulta de inserción dinámica
  if (name !== undefined) {
    insertQuery += "name, ";
    valueQuery += `$${count}, `;
    insertValues.push(name);
    count++;
  }
  if (description !== undefined) {
    insertQuery += "description, ";
    valueQuery += `$${count}, `;
    insertValues.push(description);
    count++;
  }
  if (base_price !== undefined) {
    insertQuery += "base_price, ";
    valueQuery += `$${count}, `;
    insertValues.push(base_price);
    count++;
  }
  if (stock !== undefined) {
    insertQuery += "stock, ";
    valueQuery += `$${count}, `;
    insertValues.push(stock);
    count++;
  }
  if (media_url !== undefined) {
    insertQuery += "media_url, ";
    valueQuery += `$${count}, `;
    insertValues.push(media_url);
    count++;
  }
  if (brand_id !== undefined) {
    insertQuery += "brand_id, ";
    valueQuery += `$${count}, `;
    insertValues.push(brand_id);
    count++;
  }
  if (category_id !== undefined) {
    insertQuery += "category_id, ";
    valueQuery += `$${count}, `;
    insertValues.push(category_id);
    count++;
  }

  // Eliminar la coma adicional al final y cerrar las consultas
  insertQuery = insertQuery.slice(0, -2) + ") ";
  valueQuery = valueQuery.slice(0, -2) + ") RETURNING *";

  const finalQuery = insertQuery + valueQuery;

  try {
    const { rows } = await postgresDB.query(finalQuery, insertValues);
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Eliminar a un usuario
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM products WHERE id = $1 RETURNING *";
  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//actualizar a un producto
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name, description, base_price, stock, media_url, brand_id, category_id } = req.body;

  let updateQuery = "UPDATE products SET ";
  let updateValues = [];
  let count = 1;

  // Construir la consulta de actualización dinámica
  if (name !== undefined) {
    updateQuery += `name = $${count}, `;
    updateValues.push(name);
    count++;
  }
  if (description !== undefined) {
    updateQuery += `description = $${count}, `;
    updateValues.push(description);
    count++;
  }
  if (base_price !== undefined) {
    updateQuery += `base_price = $${count}, `;
    updateValues.push(base_price);
    count++;
  }
  if (stock !== undefined) {
    updateQuery += `stock = $${count}, `;
    updateValues.push(stock);
    count++;
  }
  if (media_url !== undefined) {
    updateQuery += `media_url = $${count}, `;
    updateValues.push(media_url);
    count++;
  }
   if (brand_id !== undefined) {
     updateQuery += `brand_id = $${count}, `;
     updateValues.push(brand_id);
     count++;
   }
   if (category_id !== undefined) {
     updateQuery += `category_id = $${count}, `;
     updateValues.push(category_id);
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
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar el producto en el backend",
    });
  }
});

module.exports = router;
