const express = require("express");
const router = express.Router();
const postgresDB = require("../db/postgres");

//Obtener todos los clientes
// Obtener clientes + métricas de cobranzas (incluye payment_terms)
// Clientes + métricas de facturación/cobranzas (solo órdenes facturadas)
router.get("/", async (req, res, next) => {
  try {
    const sql = `
      WITH client_metrics AS (
        SELECT
          c.id AS client_id,
          c.name AS client_name,
          c.rif,
          c.city,
          c.municipality,
          c.state,
          c.user_id,
          c.profit_code,
          COALESCE(c.client_credits, 0)::numeric AS client_credits,
          COALESCE(u.firstname || ' ' || u.lastname, u.username) AS seller_name,
          pt.days AS credit_days,

          COUNT(*) FILTER (
            WHERE o.invoice_number IS NOT NULL
              AND BTRIM(o.invoice_number) <> ''
          ) AS invoices_total,
          COUNT(*) FILTER (
            WHERE o.invoice_number IS NOT NULL
              AND BTRIM(o.invoice_number) <> ''
              AND o.paid_at IS NOT NULL
          ) AS invoices_paid,

          COALESCE(
            SUM(COALESCE(o.total, 0)) FILTER (
              WHERE o.invoice_number IS NOT NULL
                AND BTRIM(o.invoice_number) <> ''
                AND o.paid_at IS NULL
            ),
            0
          )::numeric AS gross_debt,

          COALESCE(
            SUM(COALESCE(o.total, 0)) FILTER (
              WHERE o.paid_at IS NULL
                AND o.invoice_number IS NOT NULL
                AND BTRIM(o.invoice_number) <> ''
                AND o.due_date < CURRENT_DATE
            ),
            0
          )::numeric AS overdue_amount,

          COUNT(*) FILTER (
            WHERE o.paid_at IS NULL
              AND o.invoice_number IS NOT NULL
              AND BTRIM(o.invoice_number) <> ''
              AND o.due_date < CURRENT_DATE
          ) AS overdue_invoices_count,

          COALESCE(
            SUM(COALESCE(o.total, 0)) FILTER (
              WHERE o.paid_at IS NULL
                AND o.invoice_number IS NOT NULL
                AND BTRIM(o.invoice_number) <> ''
                AND o.due_date >= CURRENT_DATE
            ),
            0
          )::numeric AS pending_amount,

          COUNT(*) FILTER (
            WHERE o.paid_at IS NULL
              AND o.invoice_number IS NOT NULL
              AND BTRIM(o.invoice_number) <> ''
              AND o.due_date >= CURRENT_DATE
          ) AS pending_invoices_count,

          COALESCE(
            MAX(
              GREATEST(0, CURRENT_DATE - o.due_date::date)
            ) FILTER (
              WHERE o.paid_at IS NULL
                AND o.invoice_number IS NOT NULL
                AND BTRIM(o.invoice_number) <> ''
                AND o.due_date IS NOT NULL
                AND o.due_date::date < CURRENT_DATE
            ),
            0
          )::int AS max_morosidad_days,

          MAX(o.last_debt_check) AS last_debt_check

        FROM clients c
        LEFT JOIN orders o ON o.client_id = c.id
        LEFT JOIN payment_terms pt ON pt.id = c.payment_term_id
        LEFT JOIN users u ON u.id = c.user_id
        GROUP BY
          c.id,
          c.name,
          c.rif,
          c.city,
          c.municipality,
          c.state,
          c.user_id,
          c.profit_code,
          c.client_credits,
          pt.days,
          COALESCE(u.firstname || ' ' || u.lastname, u.username)
      )
      SELECT
        client_id,
        client_name,
        rif,
        city,
        municipality,
        state,
        user_id,
        profit_code,
        seller_name,
        credit_days,
        invoices_paid,
        invoices_total,
        last_debt_check,

        gross_debt,
        client_credits,
        GREATEST(gross_debt - client_credits, 0)::numeric AS net_debt,
        overdue_amount,
        overdue_invoices_count,
        pending_amount,
        pending_invoices_count,
        max_morosidad_days,

        client_id AS id,
        client_name AS name,
        GREATEST(gross_debt - client_credits, 0)::numeric AS debt_total,
        overdue_invoices_count AS invoices_overdue,
        pending_invoices_count AS invoices_pending,
        max_morosidad_days AS max_days_overdue
      FROM client_metrics
      ORDER BY
        max_morosidad_days DESC,
        client_name;
    `;

    const { rows } = await postgresDB.query(sql);
    res.status(200).send(rows);
  } catch (error) {
    next(error);
  }
});

// Filtros de clientes por ubicación
// GET /api/clients/locations?state=Distrito%20Capital&city=Caracas&municipality=El%20Hatillo
router.get("/locations", async (req, res) => {
  try {
    const { state, city, municipality } = req.query;

    // 1) Estados (siempre todos los distintos)
    const statesSql = `
      SELECT DISTINCT state
      FROM clients
      WHERE state IS NOT NULL AND state <> ''
      ORDER BY state ASC;
    `;
    const statesRes = await postgresDB.query(statesSql);
    const states = statesRes.rows.map((r) => r.state);

    // 2) Ciudades, filtradas opcionalmente por estado
    const cityWhere = ["city IS NOT NULL", "city <> ''"];
    const cityParams = [];

    if (state) {
      cityParams.push(state);
      cityWhere.push(`state = $${cityParams.length}`);
    }

    const citiesSql = `
      SELECT DISTINCT city
      FROM clients
      WHERE ${cityWhere.join(" AND ")}
      ORDER BY city ASC;
    `;
    const citiesRes = await postgresDB.query(citiesSql, cityParams);
    const cities = citiesRes.rows.map((r) => r.city);

    // 3) Municipios, filtrados opcionalmente por estado y ciudad
    const muniWhere = ["municipality IS NOT NULL", "municipality <> ''"];
    const muniParams = [];

    if (state) {
      muniParams.push(state);
      muniWhere.push(`state = $${muniParams.length}`);
    }

    if (city) {
      muniParams.push(city);
      muniWhere.push(`city = $${muniParams.length}`);
    }

    const muniSql = `
      SELECT DISTINCT municipality
      FROM clients
      WHERE ${muniWhere.join(" AND ")}
      ORDER BY municipality ASC;
    `;
    const muniRes = await postgresDB.query(muniSql, muniParams);
    const municipalities = muniRes.rows.map((r) => r.municipality);

    // 4) Clientes filtrados por combinación de estado / ciudad / municipio
    const clientWhere = ["1 = 1"];
    const clientParams = [];

    if (state) {
      clientParams.push(state);
      clientWhere.push(`state = $${clientParams.length}`);
    }

    if (city) {
      clientParams.push(city);
      clientWhere.push(`city = $${clientParams.length}`);
    }

    if (municipality) {
      clientParams.push(municipality);
      clientWhere.push(`municipality = $${clientParams.length}`);
    }

    const clientsSql = `
      SELECT id, name, state, city, municipality
      FROM clients
      WHERE ${clientWhere.join(" AND ")}
      ORDER BY name ASC;
    `;

    const clientsRes = await postgresDB.query(clientsSql, clientParams);
    const clients = clientsRes.rows;

    res.json({
      states,
      cities,
      municipalities,
      clients,
    });
  } catch (err) {
    console.error("Error en /clients/locations:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Obtener un cliente por su ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT
        c.id,
        c.name,
        c.phone,
        c.rif_url,
        c.legal_representative,
        c.street_address,
        c.profit_code,
        c.sunagro_code,
        c.has_debt,
        c.created_at,
        c.phone,
        c.rif,
        c.city,
        c.municipality,
        c.state,
        c.client_credits,

        /* --- FACTURAS (solo si invoice_number & invoice_date existen) --- */
        COUNT(*) FILTER (
          WHERE o.invoice_number IS NOT NULL AND o.invoice_date IS NOT NULL
        ) AS invoices_total,

        COUNT(*) FILTER (
          WHERE o.invoice_number IS NOT NULL AND o.invoice_date IS NOT NULL
            AND o.payment_status_id = 2
        ) AS invoices_paid,

        COUNT(*) FILTER (
          WHERE o.invoice_number IS NOT NULL AND o.invoice_date IS NOT NULL
            AND o.payment_status_id = 1
            AND CURRENT_DATE <= o.due_date
        ) AS invoices_pending,   -- pendientes dentro de plazo

        COUNT(*) FILTER (
          WHERE o.invoice_number IS NOT NULL AND o.invoice_date IS NOT NULL
            AND (o.payment_status_id <> 2)
            AND CURRENT_DATE > o.due_date
        ) AS invoices_overdue,

        /* --- MONTOS --- */
        COALESCE(SUM(o.total) FILTER (
          WHERE o.invoice_number IS NOT NULL AND o.invoice_date IS NOT NULL
            AND (o.payment_status_id <> 2)
            AND CURRENT_DATE > o.due_date
        ), 0) AS overdue_amount,

        COALESCE(SUM(o.total) FILTER (
          WHERE o.invoice_number IS NOT NULL AND o.invoice_date IS NOT NULL
            AND o.payment_status_id = 1
            AND CURRENT_DATE <= o.due_date
        ), 0) AS pending_amount,

        COALESCE(SUM(o.total) FILTER (
          WHERE o.invoice_number IS NOT NULL AND o.invoice_date IS NOT NULL
            AND (
              (o.payment_status_id = 1 AND CURRENT_DATE <= o.due_date) OR
              ((o.payment_status_id <> 2) AND CURRENT_DATE > o.due_date)
            )
        ), 0) AS debt_total,

        /* --- DÍAS DE CRÉDITO (desde clients.payment_term_id) --- */
        pt.id AS credit_id,
        pt.days AS credit_days,
        pt.description AS credit_description,
        pt.name AS credit_name,

        /* --- ATRASOS --- */
        COALESCE(
          MAX(
            GREATEST(0, CURRENT_DATE - o.due_date::date)
          ) FILTER (
            WHERE o.paid_at IS NULL
              AND o.due_date IS NOT NULL
              AND o.due_date::date < CURRENT_DATE
          ),
          0
        )::int AS max_days_overdue

      FROM clients c
      LEFT JOIN orders o         ON o.client_id = c.id
      LEFT JOIN payment_terms pt ON pt.id = c.payment_term_id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.rif, c.city, c.municipality, c.state, pt.id, pt.days,   pt.description, pt.name
    `;

    const { rows } = await postgresDB.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener cliente por ID:", error);
    res.status(500).json({ message: "Error interno del servidor" });
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
    created_at,
    user_id,
    is_prospect,
  } = req.body;

  let insertQuery = "INSERT INTO clients(";
  let valueQuery = "VALUES(";
  let insertValues = [];
  let count = 1;

  // Construir la consulta de inserción dinámica
  if (user_id !== undefined) {
    insertQuery += "user_id, ";
    valueQuery += `$${count}, `;
    insertValues.push(user_id);
    count++;
  }
  if (created_at !== undefined) {
    insertQuery += "created_at, ";
    valueQuery += `$${count}, `;
    insertValues.push(created_at);
    count++;
  }
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
  if (is_prospect !== undefined) {
    insertQuery += "is_prospect, ";
    valueQuery += `$${count}, `;
    insertValues.push(is_prospect);
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

// Eliminar un cliente por su ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM clients WHERE id = $1 RETURNING *";

  try {
    const result = await postgresDB.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).send(result.rows[0]);
  } catch (err) {
    console.error("Error al eliminar cliente por ID:", err);
    res.status(400).json({ message: err.message });
  }
});

// Actualizar un cliente por su id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
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
    sunagro_code,
    has_debt,
    client_credits,
    created_at,
    user_id,
    payment_term_id,
  } = req.body;

  let updateQuery = "UPDATE clients SET ";
  const updateValues = [];
  let count = 1;

  // Construir el query dinámico
  if (payment_term_id !== undefined) {
    updateQuery += `payment_term_id = $${count}, `;
    updateValues.push(payment_term_id);
    count++;
  }
  if (sunagro_code !== undefined) {
    updateQuery += `sunagro_code = $${count}, `;
    updateValues.push(sunagro_code);
    count++;
  }
  if (user_id !== undefined) {
    updateQuery += `user_id = $${count}, `;
    updateValues.push(user_id);
    count++;
  }
  if (created_at !== undefined) {
    updateQuery += `created_at = $${count}, `;
    updateValues.push(created_at);
    count++;
  }
  if (has_debt !== undefined) {
    updateQuery += `has_debt = $${count}, `;
    updateValues.push(has_debt);
    count++;
  }
  if (client_credits !== undefined) {
    updateQuery += `client_credits = $${count}, `;
    updateValues.push(client_credits);
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

  // Finalizar consulta
  updateQuery = updateQuery.slice(0, -2); // Eliminar coma final
  updateQuery += ` WHERE id = $${count} RETURNING *`;
  updateValues.push(id);

  try {
    const result = await postgresDB.query(updateQuery, updateValues);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar cliente por ID:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

module.exports = router;
