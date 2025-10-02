const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

// GET /api/market-products
router.get("/", async (req, res, next) => {
  try {
    let { q, active, category, category_id, brand_id, page, pageSize, all } =
      req.query;

    // Normaliza arrays
    if (q && !Array.isArray(q)) q = [q];
    if (category && !Array.isArray(category)) category = [category]; // si filtras por nombre
    if (category_id && !Array.isArray(category_id)) category_id = [category_id]; // si filtras por ID
    if (brand_id && !Array.isArray(brand_id)) brand_id = [brand_id];

    const pageN = Math.max(1, parseInt(page || "1", 10));
    const pageSizeN = Math.min(
      100,
      Math.max(1, parseInt(pageSize || "20", 10))
    );
    const offset = (pageN - 1) * pageSizeN;
    const wantsAll = all === "true";

    const where = [];
    const params = [];
    let i = 1;

    // q (uno o varios términos) → OR ILIKE
    if (q?.length) {
      const likes = q.map(() => `name ILIKE $${i++}`);
      where.push(`(${likes.join(" OR ")})`);
      params.push(...q.map((s) => `%${s}%`));
    }

    // activo
    if (active === "true" || active === "false") {
      where.push(`is_active = $${i++}`);
      params.push(active === "true");
    }

    // brand_id múltiple (IDs)
    if (brand_id?.length) {
      where.push(`brand_id = ANY($${i++}::int[])`);
      params.push(brand_id.map((n) => Number(n)));
    }

    // category por nombre (opcional, si la usas)
    if (category?.length) {
      where.push(`category = ANY($${i++}::text[])`);
      params.push(category);
    }

    // category_id múltiple (IDs)  👈 ESTE ES TU CASO
    if (category_id?.length) {
      // OJO: usa el nombre real de la columna (category_id o product_category_id)
      where.push(`category_id = ANY($${i++}::int[])`);
      params.push(category_id.map((n) => Number(n)));
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const dataSql = `
      SELECT *
      FROM market_products
      ${whereSql}
      ORDER BY name ASC
      ${wantsAll ? "" : `LIMIT $${i++} OFFSET $${i++}`}
    `;

    const dataParams = wantsAll ? params : [...params, pageSizeN, offset];

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM market_products
      ${whereSql}
    `;

    const [{ rows }, countRes] = await Promise.all([
      postgresDB.query(dataSql, dataParams),
      postgresDB.query(countSql, params),
    ]);

    const total = countRes.rows[0]?.total ?? 0;
    const totalPages = wantsAll ? 1 : Math.ceil(total / pageSizeN);

    res.status(200).json({
      ok: true,
      data: rows,
      page: wantsAll ? 1 : pageN,
      pageSize: wantsAll ? rows.length : pageSizeN,
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
      return res
        .status(400)
        .json({ ok: false, message: "category id inválido" });
    }

    // 2) Otros filtros opcionales
    const q = req.query.q || null;
    const active = req.query.active; // 'true' | 'false' | undefined
    const brandId = req.query.brand_id ? Number(req.query.brand_id) : null;
    const categoryText = req.query.category || null; // si aún quieres filtrar por texto de categoría

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const pageSize = Math.min(
      100,
      Math.max(1, parseInt(req.query.pageSize || "20", 10))
    );
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

/**
 * Espera:
 *   - productIds: "79,81,82"   (requerido)
 *   - clientIds:  "10,12,15"   (opcional)
 *   - latest:     "true"|"false" (opcional, default false)
 *
 * Ejemplos:
 *   /api/competitor-prices?productIds=79
 *   /api/competitor-prices?productIds=79,81&clientIds=10,12
 *   /api/competitor-prices?productIds=79&latest=true
 */
router.get("/competitor-prices", async (req, res) => {
  const { productIds, clientIds, latest } = req.query;

  try {
    // --- Validación mínima ---
    if (!productIds) {
      return res.status(400).json({ error: "Falta productIds (ej. 79,81,82)" });
    }

    const productIdList = String(productIds)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number);

    if (!productIdList.length || productIdList.some(Number.isNaN)) {
      return res.status(400).json({ error: "productIds inválidos" });
    }

    const clientIdList = clientIds
      ? String(clientIds)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map(Number)
      : [];

    if (clientIdList.some(Number.isNaN)) {
      return res.status(400).json({ error: "clientIds inválidos" });
    }

    const onlyLatest = String(latest).toLowerCase() === "true";

    // --- Construcción dinámica de SQL ---
    // Usamos placeholders numerados para evitar inyecciones.
    // params irá acumulando los valores de los placeholders.
    const params = [];
    let whereClauses = [];

    // productIds (requeridos)
    params.push(productIdList);
    whereClauses.push(`mci.market_product_id = ANY($${params.length})`);

    // clientIds (opcionales)
    if (clientIdList.length) {
      params.push(clientIdList);
      whereClauses.push(`mc.client_id = ANY($${params.length})`);
    }

    // Base SELECT (todos los registros)
    const baseSelect = `
      SELECT
        mci.id AS market_check_item_id,
        mc.id  AS market_check_id,
        c.id   AS client_id,
        c.name AS client_name,
        mp.id  AS product_id,
        mp.name AS product_name,
        mci.price_usd,
        mci.currency_code,
        mci.fx_rate_used,
        mci.created_at,
        mci.updated_at
      FROM market_check_items mci
      JOIN market_checks mc     ON mc.id = mci.market_check_id
      JOIN clients c            ON c.id  = mc.client_id
      JOIN market_products mp   ON mp.id = mci.market_product_id
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY mci.created_at DESC, mci.id DESC
    `;

    // Variante "latest" (último precio por cliente y producto)
    const latestSelect = `
      WITH ranked AS (
        SELECT
          mci.id AS market_check_item_id,
          mc.id  AS market_check_id,
          c.id   AS client_id,
          c.name AS client_name,
          mp.id  AS product_id,
          mp.name AS product_name,
          mci.price_usd,
          mci.currency_code,
          mci.fx_rate_used,
          mci.created_at,
          mci.updated_at,
          ROW_NUMBER() OVER (
            PARTITION BY mc.client_id, mci.market_product_id
            ORDER BY COALESCE(mci.updated_at, mci.created_at) DESC, mci.id DESC
          ) AS rn
        FROM market_check_items mci
        JOIN market_checks mc     ON mc.id = mci.market_check_id
        JOIN clients c            ON c.id  = mc.client_id
        JOIN market_products mp   ON mp.id = mci.market_product_id
        WHERE ${whereClauses.join(" AND ")}
      )
      SELECT
        market_check_item_id,
        market_check_id,
        client_id,
        client_name,
        product_id,
        product_name,
        price_usd,
        currency_code,
        fx_rate_used,
        created_at,
        updated_at
      FROM ranked
      WHERE rn = 1
      ORDER BY client_name ASC, product_name ASC
    `;

    const sql = onlyLatest ? latestSelect : baseSelect;

    const { rows } = await postgresDB.query(sql, params);

    // Respuesta pensada para el gráfico de barras
    // (pero devolvemos todo por si quieres más datos)
    const chartData = rows.map((r) => ({
      client_id: r.client_id,
      client_name: r.client_name,
      product_id: r.product_id,
      product_name: r.product_name,
      price_usd: Number(r.price_usd),
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    res.json({
      count: chartData.length,
      latest: onlyLatest,
      data: chartData,
    });
  } catch (err) {
    console.error("[GET /competitor-prices] error:", err.message, err.stack);
    res.status(500).json({ error: err.message || "Error obteniendo precios" });
  }
});

// GET /competitor-products-summary
// Params:
// - categoryId: number (opcional, preferido)
// - productIds: string "1,2,3" (opcional; si no hay categoryId, usa esto)
// - sinceDays: number (opcional; ej 90 -> solo precios recientes)
// - agg: "mean" | "median" (opcional; default "mean")
// - highlightProductId: number (opcional; solo pasa a meta)
// - excludeClientIds: string "5,7,12" (opcional; excluye estos client_id del cálculo)
router.get("/competitor-products-summary", async (req, res) => {
  try {
    const {
      categoryId,
      productIds,
      sinceDays,
      agg = "mean",
      highlightProductId,
      excludeClientIds,
      excludeProductIds,
    } = req.query;

    if (!categoryId && !productIds) {
      return res.status(400).json({ error: "Falta categoryId o productIds" });
    }

    // Armado de filtros dinámicos
    const whereParts = [];
    const params = [];
    let p = 1;

    if (categoryId) {
      whereParts.push(`mp.category_id = $${p++}`);
      params.push(Number(categoryId));
    } else if (productIds) {
      const productIdList = String(productIds)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter(Boolean);
      if (productIdList.length === 0) {
        return res.status(400).json({ error: "productIds inválido" });
      }
      whereParts.push(`mci.market_product_id = ANY($${p++})`);
      params.push(productIdList);
    }

    if (sinceDays) {
      whereParts.push(
        `COALESCE(mci.updated_at, mci.created_at) >= NOW() - ($${p++}::interval)`
      );
      params.push(`${Number(sinceDays)} days`);
    }

    if (excludeClientIds) {
      const excludeList = String(excludeClientIds)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter(Boolean);

      if (!excludeList.length) {
        return res.status(400).json({ error: "excludeClientIds inválido" });
      }

      whereParts.push(`NOT (mc.client_id = ANY($${p++}))`);
      params.push(excludeList);
    }

    if (excludeProductIds) {
      const excludeProdList = String(excludeProductIds)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter(Boolean);

      if (!excludeProdList.length) {
        return res.status(400).json({ error: "excludeProductIds inválido" });
      }

      whereParts.push(`NOT (mci.market_product_id = ANY($${p++}))`);
      params.push(excludeProdList);
    }

    const whereSql = whereParts.length
      ? `WHERE ${whereParts.join(" AND ")}`
      : "";

    // Elegir métrica central para "value"
    // - mean: AVG(price_usd)
    // - median: percentile_cont(0.5) WITHIN GROUP (ORDER BY price_usd)
    const centralValueSql =
      agg === "median"
        ? `percentile_cont(0.5) WITHIN GROUP (ORDER BY price_usd)`
        : `AVG(price_usd)`;

    const rowsSql = `
      WITH ranked AS (
        SELECT
          mc.client_id,
          c.name AS client_name,
          mci.market_product_id AS product_id,
          mp.name AS product_name,
          mp.weight_g AS product_weight_g,
          mp.presentation AS product_presentation,
          mci.price_usd,
          ROW_NUMBER() OVER (
            PARTITION BY mc.client_id, mci.market_product_id
            ORDER BY COALESCE(mci.updated_at, mci.created_at) DESC, mci.id DESC
          ) AS rn
        FROM market_check_items mci
        JOIN market_checks   mc ON mc.id = mci.market_check_id
        JOIN clients          c ON c.id  = mc.client_id
        JOIN market_products mp ON mp.id = mci.market_product_id
        ${whereSql}
      ),
      last_per_client AS (
        SELECT * FROM ranked WHERE rn = 1
      ),
      per_product AS (
        SELECT
          product_id,
          MAX(product_name) AS product_name,
          MAX(product_weight_g) AS weight_g,
          MAX(product_presentation) AS presentation,
          COUNT(*)          AS clients_count,
          percentile_cont(0.25) WITHIN GROUP (ORDER BY price_usd) AS p25,
          ${centralValueSql} AS center_value,
          percentile_cont(0.75) WITHIN GROUP (ORDER BY price_usd) AS p75
        FROM last_per_client
        GROUP BY product_id
      ),
      category_stats AS (
        SELECT
          ${
            agg === "median"
              ? `percentile_cont(0.5) WITHIN GROUP (ORDER BY center_value)`
              : `AVG(center_value)`
          } AS category_center
        FROM per_product
      )
      SELECT
        pp.product_id,
        pp.product_name,
        pp.weight_g,
        pp.presentation,
        pp.clients_count,
        pp.p25,
        pp.center_value,
        pp.p75,
        CASE WHEN cs.category_center IS NULL OR cs.category_center = 0
          THEN NULL
          ELSE pp.center_value / cs.category_center
        END AS price_index,
        cs.category_center
      FROM per_product pp
      CROSS JOIN category_stats cs
      ORDER BY pp.product_name ASC;
    `;

    const { rows } = await postgresDB.query(rowsSql, params);
    console.log(rows);
    

    res.json({
      count: rows.length,
      data: rows.map((r) => ({
        product_id: Number(r.product_id),
        product_name: r.product_name,
        product_presentation: r.presentation,
        product_weight_g: r.weight_g != null ? Number(r.weight_g) : null,
        clients_count: Number(r.clients_count),
        p25: r.p25 != null ? Number(r.p25) : null,
        [agg === "median" ? "median_price" : "mean_price"]:
          r.center_value != null ? Number(r.center_value) : null,
        p75: r.p75 != null ? Number(r.p75) : null,
        price_index: r.price_index != null ? Number(r.price_index) : null,
      })),
      meta: {
        scope: categoryId ? "category" : "list",
        agg,
        since_days: sinceDays ? Number(sinceDays) : null,
        category_center:
          rows[0]?.category_center != null
            ? Number(rows[0].category_center)
            : null,
        highlight_product_id: highlightProductId
          ? Number(highlightProductId)
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Error interno", details: String(err?.message || err) });
  }
});

// Crear nuevo producto
router.post("/", async (req, res, next) => {
  try {
    const body = req.body;

    // 🟢 Caso 1: si es un solo objeto { brand_id, name, ... }
    if (!Array.isArray(body)) {
      const {
        brand_id,
        name,
        category_id,
        is_active,
        presentation,
        weight_g,
        package_qty,
        photo_url,
      } = body;

      if (!brand_id || !name || !category_id) {
        return res.status(400).json({
          ok: false,
          error:
            "Los campos 'brand_id', 'name' y 'category_id' son obligatorios",
        });
      }

      const sql = `
        INSERT INTO market_products 
        (brand_id, name, category_id, is_active, presentation, weight_g, package_qty, photo_url, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
        RETURNING *;
      `;
      const values = [
        brand_id,
        name,
        category_id,
        is_active !== undefined ? !!is_active : true,
        presentation || null,
        weight_g || null,
        package_qty || 1,
        photo_url || null,
      ];

      const { rows } = await postgresDB.query(sql, values);
      return res.status(201).json({ ok: true, data: rows[0] });
    }

    // 🟢 Caso 2: si es un array de objetos [{...}, {...}]
    const columns = [
      "brand_id",
      "name",
      "category_id",
      "is_active",
      "presentation",
      "weight_g",
      "package_qty",
      "photo_url",
      "created_at",
      "updated_at",
    ];

    const values = [];
    const placeholders = [];

    body.forEach((item, idx) => {
      if (!item.brand_id || !item.name || !item.category_id) {
        throw new Error(`Faltan campos obligatorios en item ${idx + 1}`);
      }

      const rowValues = [
        item.brand_id,
        item.name,
        item.category_id,
        item.is_active !== undefined ? !!item.is_active : true,
        item.presentation || null,
        item.weight_g || null,
        item.package_qty || 1,
        item.photo_url || null,
        new Date(),
        new Date(),
      ];

      // genera placeholders ($1,$2,...) para cada fila
      const rowPlaceholders = rowValues.map(
        (_, i) => `$${values.length + i + 1}`
      );

      placeholders.push(`(${rowPlaceholders.join(",")})`);
      values.push(...rowValues);
    });

    const sql = `
      INSERT INTO market_products (${columns.join(",")})
      VALUES ${placeholders.join(",")}
      RETURNING *;
    `;

    const { rows } = await postgresDB.query(sql, values);
    res.status(201).json({ ok: true, data: rows });
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
