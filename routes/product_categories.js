const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

// Obtener todas las categorías
// Obtener categorías (todas o filtradas)
// Obtener categorías (todas o filtradas)
router.get("/", async (req, res, next) => {
  try {
    let { q, active, level, parent_id } = req.query;

    const where = [];
    const params = [];
    let i = 1;

    // --- Filtro por nombre (q)
    if (q) {
      if (!Array.isArray(q)) q = [q];
      const placeholders = q.map(() => `$${i++}`).join(", ");
      where.push(`name IN (${placeholders})`);
      params.push(...q);
    }

    // --- Filtro por estado
    if (active === "true" || active === "false") {
      where.push(`active = $${i++}`);
      params.push(active === "true");
    }

    // --- Filtro por nivel
    if (level) {
      where.push(`level = $${i++}`);
      params.push(Number(level));
    }

    // --- Filtro por parent_id (uno o varios)
    if (parent_id) {
      if (!Array.isArray(parent_id)) parent_id = [parent_id];
      const placeholders = parent_id.map(() => `$${i++}`).join(", ");
      where.push(`parent_id IN (${placeholders})`);
      params.push(...parent_id.map(Number));
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const sql = `
      SELECT *
      FROM product_categories
      ${whereSQL}
      ORDER BY COALESCE(parent_id, 0), name;
    `;

    const { rows } = await postgresDB.query(sql, params);
    res.status(200).send(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las categorías" });
  }
});



// Obtener una categoría por su id
router.get("/:catId", async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM product_categories WHERE id = $1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    const category = rows[0];
    res.status(200).send(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener la categoría" });
  }
});

// Agregar una nueva categoría
router.post("/", async (req, res, next) => {
  const { name } = req.body;
  try {
    const { rows } = await postgresDB.query(
      `INSERT INTO product_categories(name) VALUES($1) RETURNING *`,
      [name]
    );
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Eliminar una categoría
router.delete("/:catId", async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM product_categories WHERE id = $1 RETURNING *";
  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Actualizar una categoría
router.put("/:catId", async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  let updateQuery = "UPDATE product_categories SET ";
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
  updateValues.push(id);

  try {
    // Ejecutar la consulta de actualización
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
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
