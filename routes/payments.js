const express = require("express");
const multer = require("multer");
const router = express.Router();
const postgresDB = require("../db/postgres");
const { uploadReceipt, getReceiptUrl } = require("../services/r2Storage");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes o PDF"), false);
    }
  },
});


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

// GET /api/payments/seller/:userId — pagos reportados por un vendedor
router.get("/seller/:userId", async (req, res, next) => {
  const userId = parseInt(req.params.userId, 10);

  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const sessionUserId = Number(req.user.id);
  const isPrivileged = ["admin", "superadmin"].includes(req.user.role);

  if (sessionUserId !== userId && !isPrivileged) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const sql = `
      SELECT
        p.id,
        p.client_id,
        c.name AS client_name,
        p.amount,
        p.method,
        p.reference,
        p.status,
        p.notes,
        p.receipt_url,
        p.payment_date,
        p.reported_by,
        p.bank,
        p.created_at
      FROM payments p
      JOIN clients c ON c.id = p.client_id
      WHERE p.reported_by = $1
      ORDER BY p.created_at DESC;
    `;

    const { rows } = await postgresDB.query(sql, [userId]);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
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
    notes,
    receipt_url,
    payment_date,
    reported_by,
    bank,
  } = req.body;
  
  let insertQuery = "INSERT INTO payments(";
  let valueQuery = "VALUES(";
  let insertValues = [];
  let count = 1;

  // Construir la consulta de inserción dinámica
  const fields = [
    ["client_id", client_id],
    ["amount", amount],
    ["method", method],
    ["reference", reference],
    ["currency_code", currency_code],
    ["fx_rate_to_usd", fx_rate_to_usd],
    ["status", status],
    ["notes", notes],
    ["receipt_url", receipt_url],
    ["payment_date", payment_date],
    ["reported_by", reported_by],
    ["bank", bank],
  ];

  for (const [col, val] of fields) {
    if (val !== undefined) {
      insertQuery += `${col}, `;
      valueQuery += `$${count}, `;
      insertValues.push(val);
      count++;
    }
  }

  // Eliminar la última coma y espacio
  insertQuery = insertQuery.slice(0, -2) + ") ";
  valueQuery = valueQuery.slice(0, -2) + ") RETURNING *;";

  const finalQuery = insertQuery + valueQuery;
  
  try {
    const { rows } = await postgresDB.query(finalQuery, insertValues);
    res.status(201).send(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/payments/pending-receipts — listar pagos con comprobante para validación (admin)
// IMPORTANTE: esta ruta estática va ANTES de /:paymentId para evitar colisión
router.get("/pending-receipts", async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const sql = `
      SELECT
        p.id,
        p.client_id,
        c.name AS client_name,
        p.amount,
        p.method,
        p.reference,
        p.status,
        p.notes,
        p.receipt_url,
        p.payment_date,
        p.reported_by,
        u.firstname || ' ' || u.lastname AS reported_by_name,
        p.bank,
        p.created_at
      FROM payments p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN users u ON u.id = p.reported_by
      WHERE p.receipt_url IS NOT NULL
        AND p.receipt_url <> ''
      ORDER BY p.created_at DESC;
    `;

    const { rows } = await postgresDB.query(sql);
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/payments/:paymentId/status — validar o rechazar un pago (admin)
router.patch("/:paymentId/status", async (req, res, next) => {
  const paymentId = parseInt(req.params.paymentId, 10);
  const { status } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!["validado", "rechazado"].includes(status)) {
    return res.status(400).json({ message: "Estado inválido" });
  }

  try {
    const { rows } = await postgresDB.query(
      "UPDATE payments SET status = $1 WHERE id = $2 RETURNING *",
      [status, paymentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/:paymentId/receipt — subir comprobante de pago a R2
router.post("/:paymentId/receipt", upload.single("receipt"), async (req, res, next) => {
  const paymentId = parseInt(req.params.paymentId, 10);

  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No se envió ningún archivo" });
  }

  try {
    // Verificar que el pago existe y pertenece al usuario (o es admin)
    const { rows } = await postgresDB.query(
      "SELECT id, reported_by FROM payments WHERE id = $1",
      [paymentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    const payment = rows[0];
    const isOwner = Number(payment.reported_by) === Number(req.user.id);
    const isPrivileged = ["admin", "superadmin"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Subir a R2 con prefijo receipts/
    const key = await uploadReceipt(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      paymentId
    );

    // Guardar el key en la BD
    await postgresDB.query(
      "UPDATE payments SET receipt_url = $1 WHERE id = $2",
      [key, paymentId]
    );

    res.status(200).json({ key, message: "Comprobante subido" });
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/:paymentId/receipt — obtener URL firmada del comprobante (admin)
router.get("/:paymentId/receipt", async (req, res, next) => {
  const paymentId = parseInt(req.params.paymentId, 10);

  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const { rows } = await postgresDB.query(
      "SELECT receipt_url, reported_by FROM payments WHERE id = $1",
      [paymentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Pago no encontrado" });
    }

    const payment = rows[0];

    if (!payment.receipt_url) {
      return res.status(404).json({ message: "Sin comprobante adjunto" });
    }

    // Solo el dueño del pago o admin pueden ver el comprobante
    const isOwner = Number(payment.reported_by) === Number(req.user.id);
    const isPrivileged = ["admin", "superadmin"].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const url = await getReceiptUrl(payment.receipt_url);
    res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
