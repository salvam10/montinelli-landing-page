const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todos los paymentTerms
router.get("/", async (req, res) => {
  try {
    const result = await postgresDB.query("SELECT * FROM payment_terms");
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Condiciones de pago no encontradas en BD" });
    }
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los payment terms" });
  }
});

module.exports = router;
