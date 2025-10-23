const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");


router.get("/client/:clientId", async (req, res, next) => { 
  const { clientId } = req.params;

  try {
    const { rows } = await postgresDB.query(
      "SELECT * FROM payments WHERE client_id = $1 ORDER BY created_at DESC;",
      [clientId]
    );
    res.status(200).send(rows);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.post("/", async (req, res, next) => {
  const {
    client_id,
    amount,
    method,
    reference,
    currency_code,
    fx_rate_to_usd,
    status,
  } = req.body;
  console.log('Received payment data:', req.body);
  
    
  let insertQuery = "INSERT INTO payments(";
  let valueQuery = "VALUES(";
  let insertValues = [];
  let count = 1;

  // Construir la consulta de inserción dinámica
  if (client_id !== undefined) {
    insertQuery += "client_id, ";
    valueQuery += `$${count}, `;
    insertValues.push(client_id);
    count++;
  }

  if (amount !== undefined) {
    insertQuery += "amount, ";
    valueQuery += `$${count}, `;
    insertValues.push(amount);
    count++;
  }

  if (method !== undefined) {
    insertQuery += "method, ";
    valueQuery += `$${count}, `;
    insertValues.push(method);
    count++;
  }

  if (reference !== undefined) {
    insertQuery += "reference, ";
    valueQuery += `$${count}, `;
    insertValues.push(reference);
    count++;
  }

  if (currency_code !== undefined) {
    insertQuery += "currency_code, ";
    valueQuery += `$${count}, `;
    insertValues.push(currency_code);
    count++;
  }

  if (fx_rate_to_usd !== undefined) {
    insertQuery += "fx_rate_to_usd, ";
    valueQuery += `$${count}, `;
    insertValues.push(fx_rate_to_usd);
    count++;
  }

  if (status !== undefined) {
    insertQuery += "status, ";
    valueQuery += `$${count}, `;
    insertValues.push(status);
    count++;
  }

  // Eliminar la última coma y espacio
  insertQuery = insertQuery.slice(0, -2) + ") ";
  valueQuery = valueQuery.slice(0, -2) + ") RETURNING *;";

  const finalQuery = insertQuery + valueQuery;
  console.log('Final Insert Query:', finalQuery);
  
  try {
    console.log('entre');
    const { rows } = await postgresDB.query(finalQuery, insertValues);
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
