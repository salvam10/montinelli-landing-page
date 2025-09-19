const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

// GET /api/market-brands?q=tonino&active=true&page=1&pageSize=20
router.get("/", async (req, res, next) => {
  try {
    // 1) Lee y normaliza query params
    const q = req.query.q || null;
    const active = req.query.active; // 'true' | 'false' | undefined
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize || "20", 10))
    );
    const offset = (page - 1) * pageSize;

    // 2) Construye WHERE dinámico
    const where = [];
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      where.push(`name ILIKE $${params.length}`);
    }
    if (active !== undefined) {
      params.push(active === "true");
      where.push(`is_active = $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // 3) Query principal (paginada)
    const dataSql = `
      SELECT *
      FROM market_brands
      ${whereSql}
      ORDER BY name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSize, offset];

    // 4) Query de conteo total (mismos filtros, sin LIMIT/OFFSET)
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM market_brands
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


// Crear nueva marca (dinámico con is_active por defecto)
router.post("/", async (req, res, next) => {
  try {
    const { name, category, is_active, ...rest } = req.body;

    // Validar obligatorios
    if (!name || !category) {
      return res.status(400).json({
        ok: false,
        error: "Los campos 'name' y 'category' son obligatorios",
      });
    }

    // Armamos columnas y valores dinámicos
    const columns = ["name", "category", "is_active"];
    const values = [name, category, is_active !== undefined ? is_active : true];
    const placeholders = ["$1", "$2", "$3"];

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) {
        columns.push(key);
        values.push(value);
        placeholders.push(`$${values.length}`);
      }
    });

    const sql = `
      INSERT INTO market_brands (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *;
    `;

    const { rows } = await postgresDB.query(sql, values);

    res.status(201).json({
      ok: true,
      data: rows[0],
    });
  } catch (error) {
    next(error);
  }
});


// Actualizar una marca de mercado por su id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, is_active, logo_url } = req.body;

  let updateQuery = "UPDATE market_brands SET ";
  const updateValues = [];
  let count = 1;

  // Construir el query dinámico
  if (name !== undefined) {
    updateQuery += `name = $${count}, `;
    updateValues.push(name);
    count++;
  }
  if (category !== undefined) {
    updateQuery += `category = $${count}, `;
    updateValues.push(category);
    count++;
  }
  if (is_active !== undefined) {
    updateQuery += `is_active = $${count}, `;
    updateValues.push(is_active);
    count++;
  }
  if (logo_url !== undefined) {
    updateQuery += `logo_url = $${count}, `;
    updateValues.push(logo_url);
    count++;
  }

  // Finalizar consulta
  updateQuery = updateQuery.slice(0, -2); // Eliminar coma final
  updateQuery += ` WHERE id = $${count} RETURNING *`;
  updateValues.push(id);

  try {
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar marca por ID:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Eliminar una marca por su ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM market_brands WHERE id = $1 RETURNING *";

  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error al eliminar marca por ID:", err);
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;
