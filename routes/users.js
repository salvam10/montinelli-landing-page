const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

/*La función bcrypt es utilizada para crear un hash único a partir de una contraseña o cualquier otro 
tipo de información sensible, para guardar la información de manera segura en una base de datos o almacenamiento externo. */
const bcrypt = require("bcrypt");

// Obtener todos los usuarios o filtrarlos por uno o varios roles (case-insensitive)
router.get("/", async (req, res, next) => {
  try {
    let { roles } = req.query;

    let query = "SELECT * FROM users";
    let values = [];

    if (roles) {
      // Asegurar que roles sea un array
      if (typeof roles === "string") {
        roles = roles.split(",");
      }

      const placeholders = roles.map((_, idx) => `$${idx + 1}`).join(", ");
      query += ` WHERE role ILIKE ANY (ARRAY[${placeholders}])`;
      values = roles;
    }

    const { rows } = await postgresDB.query(query, values);
    res.send(rows);
  } catch (error) {
    next(error);
  }
});


/* Revisar si un usuario ya existe en la base de datos */
router.get("/exists", async (req, res) => {
  try {
    const { email } = req.query;
    console.log("email", email);
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await postgresDB.query(query, [email]);
    const user = result.rows[0];
    if (user) {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Crear un nuevo cliente
router.post("/signup", async (req, res, next) => {
  try {
    const { id, username, firstname, lastname, phone, role, secret_password } =
      req.body;
    const hashedPassword = await bcrypt.hash(secret_password, 10);
    const { rows } = await postgresDB.query(
      `INSERT INTO users(id,username, firstname, lastname, phone, role, secret_password) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, username, firstname, lastname, phone, role, hashedPassword]
    );
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//obtener un usuario por id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
 
  const query = "SELECT * FROM users WHERE id = $1";
  try {
    const result = await postgresDB.query(query, [id]);  
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//actualizar a un usuario
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { firstname, lastname, phone, email, role } = req.body;
  console.log("firstname", firstname);

  const query = `UPDATE users SET firstname = $1, lastname = $2, phone = $3, email = $4, role = $5 WHERE id = $6 RETURNING *`;
  try {
    const result = await postgresDB.query(query, [
      firstname,
      lastname,
      phone,
      email,
      role,
      id,
    ]);
    console.log("result", result);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Eliminar a un usuario
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM users WHERE id = $1 RETURNING *";
  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
