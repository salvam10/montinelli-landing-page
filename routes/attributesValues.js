const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todos los valores de atributos
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await postgresDB.query("SELECT * FROM attributes_values");
    const attributes_values = rows;
    res.status(201).send(attributes_values);
  } catch (error) {
    console.log(error);
  }
});

//Obtener un valor de atributo por su id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM attributes_values WHERE id = $1",
      [id]
    );
    const attribute_value = rows;
    res.status(201).send(attribute_value);
  } catch (error) {
    console.log(error);
  }
});

//agregar un nuevo valor de atributo
router.post("/", async (req, res, next) => {
  const { attribute_id, value } = req.body;
  try {
    const { rows } = await postgresDB.query(
      `INSERT INTO attribute_values(attribute_id, value) VALUES($1, $2) RETURNING *`,
      [attribute_id, value]
    );
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Eliminar un valor atributo
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM attribute_values WHERE id = $1 RETURNING *";
  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Valor de atributo no encontrado" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//actualizar un valor de atributo
router.put("/:id", async (req, res, next) => {
  const { attribute_id } = req.params;
  const { value } = req.body;

  let updateQuery = "UPDATE products SET ";
  let updateValues = [];
  let count = 1;

  // Construir la consulta de actualización dinámica
  if (attribute_id !== undefined) {
    updateQuery += `attribute_id = $${count}, `;
    updateValues.push(attribute_id);
    count++;
  }
  if (value !== undefined) {
    updateQuery += `value = $${count}, `;
    updateValues.push(value);
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
