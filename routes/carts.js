const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

// Obtener el carrito de un usuario
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await postgresDB.query(
      "SELECT * FROM carts WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Carrito no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({
      error: "Hubo un error al obtener el carrito",
    });
  }
});

// Obtener productos del carrito
router.get("/:userId/items", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await postgresDB.query(
      "SELECT c.id, p.*, ci.quantity FROM products p JOIN cart_items ci ON p.id = ci.product_id JOIN carts c ON ci.cart_id = c.id WHERE c.user_id = $1",
      [userId]
    );
    const products = rows;
    res.status(201).send(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Crear carrito para el usuario
router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // Verificar si el carrito ya existe
    const cartExists = await postgresDB.query(
      "SELECT * FROM carts WHERE user_id = $1",
      [userId]
    );
    if (cartExists.rows.length > 0) {
      return res.status(200).json(cartExists.rows[0]);
    }
    // Crear un nuevo carrito si no existe
    const newCart = await postgresDB.query(
      "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
      [userId]
    );
    res.status(201).json(newCart.rows[0]);
  } catch (error) {
    console.error("Error al crear el carrito:", error);
    res.status(500).json({
      error: "Hubo un error al crear el carrito en el backend",
    });
  }
});

/* agregar un producto al carrito */
router.post("/:userId/items", async (req, res, next) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  try {
    // Verificar si el carrito existe
    let checkCart = await postgresDB.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [userId]
    );

    let cartId;
    if (checkCart.rows.length === 0) {
      // Crear un nuevo carrito si no existe
      const newCart = await postgresDB.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = checkCart.rows[0].id;
    }

    // Verificar si el producto ya está en el carrito
    const checkItem = await postgresDB.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2",
      [cartId, productId]
    );

    if (checkItem.rows.length > 0) {
      // Actualizar la cantidad si el producto ya está en el carrito
      const updateItem = await postgresDB.query(
        "UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *",
        [quantity, cartId, productId]
      );
      res.status(200).json(updateItem.rows[0]);
    } else {
      // Agregar el nuevo producto al carrito
      const newItem = await postgresDB.query(
        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *",
        [cartId, productId, quantity]
      );
      res.status(201).json(newItem.rows[0]);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Eliminar un producto del carrito
router.delete("/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  const query = `DELETE FROM cart_items 
             WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1) 
             AND product_id = $2 
             RETURNING *`;
  try {
    const result = await postgresDB.query(query, [userId, productId]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en el carrito" });
    }
    res.send(result.rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Vaciar Carrito
router.delete("/:cartId", async (req, res) => {
  const { cartId } = req.params;
  const query = `DELETE FROM cart_items 
             WHERE cart_id = $1 
             RETURNING *`;
  try {
    const result = await postgresDB.query(query, [cartId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: err.message });
    }
    res.send(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: "Error al vaciar productos del carrito" });
  }
});

//actualizar a un producto del carrito
router.put("/:userId/:productId", async (req, res, next) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  let updateQuery = "UPDATE cart_items SET ";
  let updateValues = [];
  let count = 1;

  // Construir la consulta de actualización dinámica
  if (quantity !== undefined) {
    updateQuery += `quantity = $${count}, `;
    updateValues.push(quantity);
    count++;
  }

  // Eliminar la coma adicional al final y agregar la condición WHERE
  updateQuery = updateQuery.slice(0, -2); // Eliminar la coma y el espacio al final
  updateQuery += ` WHERE cart_id = (SELECT id FROM carts WHERE user_id = $${count}) AND product_id = $${
    count + 1
  } RETURNING *`;
  updateValues.push(userId, productId);

  try {
    // Ejecutar la consulta de actualización
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Producto no encontrado en el carrito" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({
      error:
        "Hubo un error al actualizar el producto del carrito  en el backend",
    });
  }
});

module.exports = router;
