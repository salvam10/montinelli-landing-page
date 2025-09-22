const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

// GET /api/market-products
router.get("/", async (req, res, next) => {
  try {
    const q = req.query.q || null;
    const active = req.query.active; // 'true' | 'false' | undefined
    const brandId = req.query.brand_id ? Number(req.query.brand_id) : null;
    const category = req.query.category || null;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize || "20", 10))
    );
    const offset = (page - 1) * pageSize;

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
    if (brandId) {
      params.push(brandId);
      where.push(`brand_id = $${params.length}`);
    }
    if (category) {
      params.push(category);
      where.push(`category = $${params.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const dataSql = `
      SELECT *
      FROM market_products
      ${whereSql}
      ORDER BY name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSize, offset];

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM market_products
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

// GET /api/market-products/category/:id?q=atun&active=true&brand_id=1&page=1&pageSize=20
router.get("/category/:id", async (req, res, next) => {
  try {
    // 1) Lee y valida el id de categoría
    const categoryId = Number(req.params.id);
    if (!Number.isInteger(categoryId)) {
      return res.status(400).json({ ok: false, message: "category id inválido" });
    }

    // 2) Otros filtros opcionales
    const q = req.query.q || null;
    const active = req.query.active; // 'true' | 'false' | undefined
    const brandId = req.query.brand_id ? Number(req.query.brand_id) : null;
    const categoryText = req.query.category || null; // si aún quieres filtrar por texto de categoría

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize || "20", 10)));
    const offset = (page - 1) * pageSize;

    // 3) Build WHERE dinámico (comienza con category_id = :id)
    const where = [];
    const params = [];

    // filtro obligatorio por id de categoría (de la ruta)
    params.push(categoryId);
    where.push(`category_id = $${params.length}`);

    if (q) {
      params.push(`%${q}%`);
      where.push(`name ILIKE $${params.length}`);
    }

    if (active !== undefined) {
      params.push(active === "true");
      where.push(`is_active = $${params.length}`);
    }

    if (brandId) {
      params.push(brandId);
      where.push(`brand_id = $${params.length}`);
    }

    // (opcional) si también quieres permitir filtrar por texto de categoría
    if (categoryText) {
      params.push(categoryText);
      where.push(`category = $${params.length}`);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    // 4) Queries
    const dataSql = `
      SELECT *
      FROM market_products
      ${whereSql}
      ORDER BY name ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, pageSize, offset];

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM market_products
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


// Crear nuevo producto
router.post("/", async (req, res, next) => {
  try {
    const {
      brand_id,
      name,
      category,
      is_active,
      presentation,
      weight_g,
      package_qty,
      created_at,
      updated_at,
      category_id,
      ...rest
    } = req.body;

    if (!brand_id || !name) {
      return res.status(400).json({
        ok: false,
        error: "Los campos 'brand_id', 'name' y 'category' son obligatorios",
      });
    }

    const columns = [
      "brand_id",
      "name",
      "category_id",
      "is_active",
      "created_at",
      "updated_at",
    ];
    const now = new Date();
    const values = [
      brand_id,
      name,
      category_id,
      is_active !== undefined ? !!is_active : true,
      created_at || now,
      updated_at || now,
    ];
    const placeholders = values.map((_, i) => `$${i + 1}`);

    // Agrega opcionales conocidos si vienen
    const optionals = {
      presentation,
      weight_g,
      package_qty,
    };

    Object.entries(optionals).forEach(([key, value]) => {
      if (value !== undefined) {
        columns.push(key);
        values.push(value);
        placeholders.push(`$${values.length}`);
      }
    });

    // Permite campos extra si decides extender tabla (igual que en brands)
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) {
        columns.push(key);
        values.push(value);
        placeholders.push(`$${values.length}`);
      }
    });

    const sql = `
      INSERT INTO market_products (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
      RETURNING *;
    `;

    const { rows } = await postgresDB.query(sql, values);

    res.status(201).json({ ok: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
});

// Actualizar producto por id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    brand_id,
    name,
    presentation,
    weight_g,
    package_qty,
    category,
    is_active,
    created_at, // normalmente no se actualiza, pero lo dejo abierto por consistencia con tu estilo
    updated_at,
    ...rest
  } = req.body;

  let updateQuery = "UPDATE market_products SET ";
  const updateValues = [];
  let count = 1;

  const pushIfDefined = (col, val) => {
    if (val !== undefined) {
      updateQuery += `${col} = $${count}, `;
      updateValues.push(val);
      count++;
    }
  };

  pushIfDefined("brand_id", brand_id);
  pushIfDefined("name", name);
  pushIfDefined("presentation", presentation);
  pushIfDefined("weight_g", weight_g);
  pushIfDefined("package_qty", package_qty);
  pushIfDefined("category", category);
  pushIfDefined("is_active", is_active);
  pushIfDefined("created_at", created_at);

  // Campos adicionales (si decides ampliar tabla)
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined) {
      updateQuery += `${key} = $${count}, `;
      updateValues.push(value);
      count++;
    }
  });

  // Siempre actualizar updated_at (si no lo mandan, server time)
  updateQuery += `updated_at = $${count}, `;
  updateValues.push(updated_at || new Date());
  count++;

  // Si no hubo campos para actualizar (solo updated_at), igual procede; pero si quisieras impedirlo:
  // if (count === 2) return res.status(400).json({ message: "No hay campos para actualizar" });

  // Finalizar consulta
  updateQuery = updateQuery.slice(0, -2); // quitar coma final
  updateQuery += ` WHERE id = $${count} RETURNING *`;
  updateValues.push(id);

  try {
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar producto por ID:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

/* Elminar producto por su id */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM market_products WHERE id = $1 RETURNING *";

  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error al eliminar producto por ID:", err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
