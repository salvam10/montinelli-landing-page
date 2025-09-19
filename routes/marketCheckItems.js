// routes/marketCheckItems.js
const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");


router.get("/", async (req, res, next) => {
  try {
    const market_check_id = req.query.market_check_id
      ? Number(req.query.market_check_id)
      : null;
    const market_product_id = req.query.market_product_id
      ? Number(req.query.market_product_id)
      : null;
    const currency_code = req.query.currency_code || null;
    const from = req.query.from || null; // ISO date (inclusive) sobre created_at
    const to = req.query.to || null; // ISO date (exclusive) sobre created_at
    const q = req.query.q || null;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize || "20", 10))
    );
    const offset = (page - 1) * pageSize;

    const where = [];
    const params = [];
    if (market_check_id) {
      params.push(market_check_id);
      where.push(`market_check_id = $${params.length}`);
    }
    if (market_product_id) {
      params.push(market_product_id);
      where.push(`market_product_id = $${params.length}`);
    }
    if (currency_code) {
      params.push(currency_code);
      where.push(`currency_code = $${params.length}`);
    }
    if (from) {
      params.push(from);
      where.push(`created_at >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      where.push(`created_at <  $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      where.push(`shelf_info ILIKE $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const dataSql = `
      SELECT
        id, market_check_id, market_product_id,
        currency_code, fx_rate_used, price_amount, price_usd,
        photo_url, shelf_info, created_at, updated_at
      FROM market_check_items
      ${whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSize, offset];

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM market_check_items
      ${whereSql}
    `;

    const [{ rows }, countRes] = await Promise.all([
      postgresDB.query(dataSql, dataParams),
      postgresDB.query(countSql, params),
    ]);

    const total = countRes.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    res
      .status(200)
      .json({ ok: true, data: rows, page, pageSize, total, totalPages });
  } catch (error) {
    next(error);
  }
});



router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const sql = `
      SELECT
        id, market_check_id, market_product_id,
        currency_code, fx_rate_used, price_amount, price_usd,
        photo_url, shelf_info, created_at, updated_at
      FROM market_check_items
      WHERE id = $1
    `;
    const { rows } = await postgresDB.query(sql, [id]);
    if (!rows.length)
      return res.status(404).json({ message: "Item no encontrado" });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const {
      market_check_id,
      market_product_id,
      price_amount,
      currency_code = "USD",
      fx_rate_used = null,
      photo_url = null,
      shelf_info = null,
    } = req.body;

    if (!market_check_id || !market_product_id || price_amount === undefined) {
      return res
        .status(400)
        .json({
          message:
            "market_check_id, market_product_id y price_amount son requeridos",
        });
    }

    let price_usd;
    if (currency_code === "USD") {
      price_usd = Number(price_amount);
    } else {
      if (!fx_rate_used || Number(fx_rate_used) <= 0) {
        return res
          .status(400)
          .json({
            message:
              "fx_rate_used > 0 es requerido cuando currency_code != 'USD'",
          });
      }
      price_usd = Number(price_amount) / Number(fx_rate_used);
    }
    price_usd = Math.round(price_usd * 100) / 100;

    const sql = `
      INSERT INTO market_check_items
      (market_check_id, market_product_id, currency_code, fx_rate_used, price_amount, price_usd, photo_url, shelf_info)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `;
    const params = [
      Number(market_check_id),
      Number(market_product_id),
      currency_code,
      fx_rate_used ? Number(fx_rate_used) : null,
      Number(price_amount),
      price_usd,
      photo_url,
      shelf_info,
    ];

    const { rows } = await postgresDB.query(sql, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // 1) Traer actual
    const { rows: curRows } = await postgresDB.query(
      `SELECT * FROM market_check_items WHERE id = $1`,
      [id]
    );
    if (!curRows.length)
      return res.status(404).json({ message: "Item no encontrado" });
    const cur = curRows[0];

    // 2) Determinar nuevos valores
    const market_product_id =
      req.body.market_product_id !== undefined
        ? req.body.market_product_id
        : cur.market_product_id;
    const currency_code = req.body.currency_code ?? cur.currency_code;
    const fx_rate_used =
      req.body.fx_rate_used !== undefined
        ? req.body.fx_rate_used
        : cur.fx_rate_used;
    const price_amount =
      req.body.price_amount !== undefined
        ? req.body.price_amount
        : cur.price_amount;
    const photo_url =
      req.body.photo_url !== undefined ? req.body.photo_url : cur.photo_url;
    const shelf_info =
      req.body.shelf_info !== undefined ? req.body.shelf_info : cur.shelf_info;

    // 3) Recalcular price_usd si hubo cambios relevantes
    let price_usd = cur.price_usd;
    const changed =
      req.body.currency_code !== undefined ||
      req.body.fx_rate_used !== undefined ||
      req.body.price_amount !== undefined;
    if (changed) {
      if (currency_code === "USD") {
        price_usd = Number(price_amount);
      } else {
        if (!fx_rate_used || Number(fx_rate_used) <= 0) {
          return res
            .status(400)
            .json({
              message:
                "fx_rate_used > 0 es requerido cuando currency_code != 'USD'",
            });
        }
        price_usd = Number(price_amount) / Number(fx_rate_used);
      }
      price_usd = Math.round(price_usd * 100) / 100;
    }

    // 4) Update
    const sql = `
      UPDATE market_check_items
      SET market_product_id = $1,
          currency_code = $2,
          fx_rate_used = $3,
          price_amount = $4,
          price_usd = $5,
          photo_url = $6,
          shelf_info = $7,
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    const params = [
      Number(market_product_id),
      currency_code,
      fx_rate_used !== null && fx_rate_used !== undefined
        ? Number(fx_rate_used)
        : null,
      Number(price_amount),
      Number(price_usd),
      photo_url,
      shelf_info,
      id,
    ];

    const { rows } = await postgresDB.query(sql, params);
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await postgresDB.query(
      `DELETE FROM market_check_items WHERE id = $1`,
      [id]
    );
    if (!rowCount)
      return res.status(404).json({ message: "Item no encontrado" });
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
