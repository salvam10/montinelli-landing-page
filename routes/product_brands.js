const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

// Obtener todas las categorías
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await postgresDB.query("SELECT * FROM product_brands");
    const categories = rows;
    res.status(200).send(categories);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener las marcas" });
  }
});

// Obtener una categoría por su id
router.get("/:brandId", async (req, res) => {
  const { brandId } = req.params
  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM product_brands WHERE id = $1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }
    const category = rows[0];
    res.status(200).send(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener la marca" });
  }
});

// Agregar una nueva categoría
router.post("/", async (req, res, next) => {
  const { name } = req.body;
  try {
    const { rows } = await postgresDB.query(
      `INSERT INTO product_brands(name) VALUES($1) RETURNING *`,
      [name]
    );
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar una categoría
router.delete("/:brandId", async (req, res) => {
  const { brandId } = req.params;
  const query = "DELETE FROM product_brands WHERE id = $1 RETURNING *";
  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar una categoría
router.put("/:brandId", async (req, res, next) => {
  const { brandId } = req.params;
  const { name } = req.body;

  let updateQuery = "UPDATE product_brands SET ";
  let updateValues = [];
  let count = 1;

  // Construir la consulta de actualización dinámica
  if (name !== undefined) {
    updateQuery += `name = $${count}, `;
    updateValues.push(name);
    count++;
  }

  // Eliminar la coma adicional al final y agregar la condición WHERE
  updateQuery = updateQuery.slice(0, -2); // Eliminar la coma y el espacio al final
  updateQuery += ` WHERE id = $${count} RETURNING *`;
  updateValues.push(brandId);

  try {
    // Ejecutar la consulta de actualización
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar la categoría en el backend",
    });
  }
});

module.exports = router;
