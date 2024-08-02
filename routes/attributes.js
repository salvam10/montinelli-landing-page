const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todos los atributos
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await postgresDB.query("SELECT * FROM attributes");
    const attributes = rows;
    res.status(201).send(attributes);
  } catch (error) {
    console.log(error);
  }
});

//Obtener un atributo por su id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM attributes WHERE id = $1",
      [id]
    );
    const attribute = rows;
    res.status(201).send(attribute);
  } catch (error) {
    console.log(error);
  }
});

//agregar un nuevo atributo
router.post("/", async (req, res, next) => {
  const { name } = req.body;
  try {
    const { rows } = await postgresDB.query(
      `INSERT INTO attributes(name) VALUES($1) RETURNING *`,
      [name]
    );
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Eliminar un atributo
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM attributes WHERE id = $1 RETURNING *";
  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Atributo no encontrado" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//actualizar a un producto
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { name} = req.body;

  let updateQuery = "UPDATE products SET ";
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
      return res.status(404).json({ message: "Atributo no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar el atributo en el backend",
    });
  }
});

module.exports = router;
