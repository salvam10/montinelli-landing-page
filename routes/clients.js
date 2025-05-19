const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todos los clientes
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await postgresDB.query("SELECT * FROM clients");
    const clients = rows;
    res.status(201).send(clients);
  } catch (error) {
    console.log(error);
  }
});

//Obtener un cliente por su rif
router.get("/:rif", async (req, res) => {
  const rif = req.params.rif;
  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM clients WHERE rif = $1",
      [rif]
    );
    const client = rows[0];
    res.status(201).send(client);
  } catch (error) {
    console.log(error);
  }
});

/* agregar un nuevo cliente */
router.post("/", async (req, res, next) => {
  const {
    rif,
    name,
    phone,
    legal_representative,
    street_address,
    city,
    municipality,
    state,
    profit_code,
    sunagro_code,
  } = req.body;

  let insertQuery = "INSERT INTO clients(";
  let valueQuery = "VALUES(";
  let insertValues = [];
  let count = 1;

  // Construir la consulta de inserción dinámica
  if (sunagro_code !== undefined) {
    insertQuery += "sunagro_code, ";
    valueQuery += `$${count}, `;
    insertValues.push(sunagro_code);
    count++;
  }
  if (rif !== undefined) {
    insertQuery += "rif, ";
    valueQuery += `$${count}, `;
    insertValues.push(rif);
    count++;
  }
  if (name !== undefined) {
    insertQuery += "name, ";
    valueQuery += `$${count}, `;
    insertValues.push(name);
    count++;
  }
  if (phone !== undefined) {
    insertQuery += "phone, ";
    valueQuery += `$${count}, `;
    insertValues.push(phone);
    count++;
  }
  if (legal_representative !== undefined) {
    insertQuery += "legal_representative, ";
    valueQuery += `$${count}, `;
    insertValues.push(legal_representative);
    count++;
  }
  if (street_address !== undefined) {
    insertQuery += "street_address, ";
    valueQuery += `$${count}, `;
    insertValues.push(street_address);
    count++;
  }
  if (city !== undefined) {
    insertQuery += "city, ";
    valueQuery += `$${count}, `;
    insertValues.push(city);
    count++;
  }
  if (municipality !== undefined) {
    insertQuery += "municipality, ";
    valueQuery += `$${count}, `;
    insertValues.push(municipality);
    count++;
  }
  if (state !== undefined) {
    insertQuery += "state, ";
    valueQuery += `$${count}, `;
    insertValues.push(state);
    count++;
  }
  if (profit_code !== undefined) {
    insertQuery += "profit_code, ";
    valueQuery += `$${count}, `;
    insertValues.push(profit_code);
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

//Eliminar a un cliente
router.delete("/:rif", async (req, res) => {
  const rif = req.params.rif;
  const query = "DELETE FROM clients WHERE rif = $1 RETURNING *";
  try {
    const result = await postgresDB.query(query, [rif]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//actualizar a un cliente
router.put("/:rif", async (req, res, next) => {
  const { rif } = req.params;
  const {
    name,
    mobile_phone,
    local_phone,
    legal_representative,
    street_address,
    city,
    municipality,
    state,
    profit_code,
    has_debt,
  } = req.body;

  let updateQuery = "UPDATE clients SET ";
  let updateValues = [];
  let count = 1;

  // Construir la consulta de actualización dinámica
  if (has_debt !== undefined) {
    updateQuery += `has_debt = $${count}, `;
    updateValues.push(has_debt);
    count++;
  }
  if (name !== undefined) {
    updateQuery += `name = $${count}, `;
    updateValues.push(name);
    count++;
  }
  if (mobile_phone !== undefined) {
    updateQuery += `mobile_phone = $${count}, `;
    updateValues.push(mobile_phone);
    count++;
  }
  if (local_phone !== undefined) {
    updateQuery += `local_phone = $${count}, `;
    updateValues.push(local_phone);
    count++;
  }
  if (legal_representative !== undefined) {
    updateQuery += `legal_representative = $${count}, `;
    updateValues.push(legal_representative);
    count++;
  }
  if (street_address !== undefined) {
    updateQuery += `street_address = $${count}, `;
    updateValues.push(street_address);
    count++;
  }
  if (city !== undefined) {
    updateQuery += `city = $${count}, `;
    updateValues.push(city);
    count++;
  }
  if (municipality !== undefined) {
    updateQuery += `municipality = $${count}, `;
    updateValues.push(municipality);
    count++;
  }
  if (state !== undefined) {
    updateQuery += `state = $${count}, `;
    updateValues.push(state);
    count++;
  }
  if (profit_code !== undefined) {
    updateQuery += `profit_code = $${count}, `;
    updateValues.push(profit_code);
    count++;
  }

  // Eliminar la coma adicional al final y agregar la condición WHERE
  updateQuery = updateQuery.slice(0, -2); // Eliminar la coma y el espacio al final
  updateQuery += ` WHERE rif = $${count} RETURNING *`;
  updateValues.push(rif);

  try {
    // Ejecutar la consulta de actualización
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar al cliente en el backend",
    });
  }
});
module.exports = router;
