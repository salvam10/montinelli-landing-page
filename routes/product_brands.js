const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

// Obtener todas las marcas
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

// Obtener una marca por su id
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

// Agregar una nueva marca
router.post("/", async (req, res, next) => {
  try {
    const body = req.body;

    // Caso 1: si viene un solo objeto { name: "Bubba" }
    if (!Array.isArray(body)) {
      const { name } = body;
      const { rows } = await postgresDB.query(
        `INSERT INTO product_brands (name) VALUES ($1) 
         ON CONFLICT (name) DO NOTHING
         RETURNING *`,
        [name]
      );
      return res.status(201).send(rows[0]);
    }

    // Caso 2: si viene un array de objetos [{ name: "Bubba" }, { name: "Arel" }]
    const values = [];
    const params = [];

    body.forEach((brand, idx) => {
      params.push(`($${idx + 1})`);
      values.push(brand.name);
    });

    const query = `
      INSERT INTO product_brands (name)
      VALUES ${params.join(", ")}
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `;

    const { rows } = await postgresDB.query(query, values);
    res.status(201).json(rows);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Eliminar una marca
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

// Actualizar una marca
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
