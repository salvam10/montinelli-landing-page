const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

router.get("/", async (req, res, next) => {
  try {
    const sellerId = req.query.seller_id ? Number(req.query.seller_id) : null;
    const clientId = req.query.client_id ? Number(req.query.client_id) : null;
    const q = req.query.q || null;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize || "20", 10))
    );
    const offset = (page - 1) * pageSize;

    const where = [];
    const params = [];

    if (sellerId) {
      params.push(sellerId);
      where.push(`seller_id = $${params.length}`);
    }
    if (clientId) {
      params.push(clientId);
      where.push(`client_id = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      where.push(`notes ILIKE $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const dataSql = `
      SELECT *
      FROM market_checks
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSize, offset];

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM market_checks
      ${whereSql}
    `;

    const [{ rows }, countRes] = await Promise.all([
      postgresDB.query(dataSql, dataParams),
      postgresDB.query(countSql, params),
    ]);

    const total = countRes.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      ok: true,
      data: rows,
      page,
      pageSize,
      total,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { seller_id, client_id, notes, created_at, updated_at } = req.body;

    if (!seller_id || !client_id) {
      return res.status(400).json({
        ok: false,
        error: "Los campos 'seller_id' y 'client_id' son obligatorios",
      });
    }

    const now = new Date();

    const sql = `
      INSERT INTO market_checks (seller_id, client_id, notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      seller_id,
      client_id,
      notes || null,
      created_at || now,
      updated_at || now,
    ];
    const { rows } = await postgresDB.query(sql, values);

    res.status(201).json({ ok: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { seller_id, client_id, notes, created_at, updated_at } = req.body;

  let updateQuery = "UPDATE market_checks SET ";
  const updateValues = [];
  let count = 1;

  const pushIfDefined = (col, val) => {
    if (val !== undefined) {
      updateQuery += `${col} = $${count}, `;
      updateValues.push(val);
      count++;
    }
  };

  pushIfDefined("seller_id", seller_id);
  pushIfDefined("client_id", client_id);
  pushIfDefined("notes", notes);
  pushIfDefined("created_at", created_at);

  updateQuery += `updated_at = $${count}, `;
  updateValues.push(updated_at || new Date());
  count++;

  updateQuery = updateQuery.slice(0, -2);
  updateQuery += ` WHERE id = $${count} RETURNING *`;
  updateValues.push(id);

  try {
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Market check no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar market check:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM market_checks WHERE id = $1 RETURNING *";

  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Market check no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error al eliminar market check:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
