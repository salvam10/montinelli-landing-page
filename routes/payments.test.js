jest.mock("../db/postgres", () => ({
  query: jest.fn(),
}));

jest.mock("../services/r2Storage", () => ({
  uploadReceipt: jest.fn(),
  getReceiptUrl: jest.fn(),
}));

jest.mock("../services/receiptOcr", () => ({
  extractReceiptData: jest.fn(),
}));

const express = require("express");
const http = require("http");
const postgresDB = require("../db/postgres");
const receiptOcr = require("../services/receiptOcr");
const paymentsRouter = require("./payments");

const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use((req, _res, next) => {
    const testUserHeader = req.get("x-test-user");

    if (testUserHeader) {
      req.user = JSON.parse(testUserHeader);
    }

    next();
  });
  app.use("/api/payments", paymentsRouter);
  app.use((err, _req, res, _next) => {
    res.status(500).json({ message: err.message });
  });

  return app;
};

const requestJson = async (server, path, { body, method = "GET", user } = {}) => {
  const payload = body ? JSON.stringify(body) : null;

  return new Promise((resolve, reject) => {
    const request = http.request({
      host: "127.0.0.1",
      port: server.address().port,
      path,
      method,
      headers: {
        ...(payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : {}),
        ...(user ? { "x-test-user": JSON.stringify(user) } : {}),
      },
    }, (response) => {
      let rawData = "";

      response.on("data", (chunk) => {
        rawData += chunk;
      });

      response.on("end", () => {
        resolve({
          status: response.statusCode,
          body: JSON.parse(rawData),
        });
      });
    });

    request.on("error", reject);

    if (payload) {
      request.write(payload);
    }

    request.end();
  });
};

const requestMultipart = async (
  server,
  path,
  { fieldName = "receipt", fileContent = "archivo", filename = "receipt.png", contentType = "image/png", method = "POST", user } = {}
) => {
  const boundary = `----gsm-boundary-${Date.now()}`;
  const body = Buffer.from(
    [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`,
      `Content-Type: ${contentType}\r\n\r\n`,
      fileContent,
      `\r\n--${boundary}--\r\n`,
    ].join("")
  );

  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        host: "127.0.0.1",
        port: server.address().port,
        path,
        method,
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length,
          ...(user ? { "x-test-user": JSON.stringify(user) } : {}),
        },
      },
      (response) => {
        let rawData = "";

        response.on("data", (chunk) => {
          rawData += chunk;
        });

        response.on("end", () => {
          resolve({
            status: response.statusCode,
            body: JSON.parse(rawData),
          });
        });
      }
    );

    request.on("error", reject);
    request.write(body);
    request.end();
  });
};

describe("routes/payments", () => {
  let app;
  let server;

  beforeAll((done) => {
    app = createApp();
    server = app.listen(0, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    postgresDB.query.mockReset();
    receiptOcr.extractReceiptData.mockReset();
  });

  test("POST /api/payments responde 201 y persiste payment_type válido", async () => {
    postgresDB.query.mockResolvedValueOnce({
      rows: [{ id: 1, client_id: 10, payment_type: "retencion" }],
    });

    const response = await requestJson(server, "/api/payments", {
      method: "POST",
      body: {
        client_id: 10,
        amount: 150,
        method: "transferencia",
        payment_type: "retencion",
      },
    });

    expect(response.status).toBe(201);
    expect(response.body.payment_type).toBe("retencion");
    expect(postgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining("payment_type"),
      expect.arrayContaining(["retencion"])
    );
  });

  test("POST /api/payments rechaza payment_type inválido", async () => {
    const response = await requestJson(server, "/api/payments", {
      method: "POST",
      body: {
        client_id: 10,
        amount: 150,
        method: "transferencia",
        payment_type: "otro",
      },
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Tipo de pago inválido" });
    expect(postgresDB.query).not.toHaveBeenCalled();
  });

  test("POST /api/payments rechaza cuando falta payment_type", async () => {
    const response = await requestJson(server, "/api/payments", {
      method: "POST",
      body: {
        client_id: 10,
        amount: 150,
        method: "transferencia",
      },
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Tipo de pago inválido" });
    expect(postgresDB.query).not.toHaveBeenCalled();
  });

  test("GET /api/payments/seller/:userId incluye payment_type", async () => {
    postgresDB.query.mockResolvedValueOnce({
      rows: [{ id: 1, payment_type: "ambos" }],
    });

    const response = await requestJson(server, "/api/payments/seller/7", {
      user: { id: 7, role: "seller" },
    });

    expect(response.status).toBe(200);
    expect(response.body[0].payment_type).toBe("ambos");
    expect(postgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining("p.payment_type"),
      [7]
    );
  });

  test("GET /api/payments/pending-receipts incluye payment_type", async () => {
    postgresDB.query.mockResolvedValueOnce({
      rows: [{ id: 1, payment_type: "pago_factura" }],
    });

    const response = await requestJson(server, "/api/payments/pending-receipts", {
      user: { id: 1, role: "admin" },
    });

    expect(response.status).toBe(200);
    expect(response.body[0].payment_type).toBe("pago_factura");
    expect(postgresDB.query).toHaveBeenCalledWith(
      expect.stringContaining("p.payment_type")
    );
  });

  test("POST /api/payments/extract-receipt responde 401 sin auth", async () => {
    const response = await requestMultipart(server, "/api/payments/extract-receipt");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "No autenticado" });
    expect(receiptOcr.extractReceiptData).not.toHaveBeenCalled();
  });

  test("POST /api/payments/extract-receipt responde 400 sin archivo", async () => {
    const response = await requestJson(server, "/api/payments/extract-receipt", {
      method: "POST",
      user: { id: 7, role: "seller" },
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "No se envió ningún archivo" });
    expect(receiptOcr.extractReceiptData).not.toHaveBeenCalled();
  });

  test("POST /api/payments/extract-receipt responde 200 con datos normalizados cuando OCR funciona", async () => {
    receiptOcr.extractReceiptData.mockResolvedValueOnce({
      amount: "155.75",
      date: "2026-05-11",
      reference: "ABC123",
      bank: "banesco banco universal",
      method: "transferencia bancaria",
    });

    const response = await requestMultipart(server, "/api/payments/extract-receipt", {
      user: { id: 7, role: "seller" },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      amount: 155.75,
      date: "2026-05-11",
      reference: "ABC123",
      bank: "Banesco",
      method: "transferencia",
      raw: {
        amount: "155.75",
        date: "2026-05-11",
        reference: "ABC123",
        bank: "banesco banco universal",
        method: "transferencia bancaria",
      },
    });
  });

  test("POST /api/payments/extract-receipt responde 200 con nulls cuando OCR falla", async () => {
    receiptOcr.extractReceiptData.mockResolvedValueOnce({});

    const response = await requestMultipart(server, "/api/payments/extract-receipt", {
      user: { id: 7, role: "seller" },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      amount: null,
      date: null,
      reference: null,
      bank: null,
      method: null,
      raw: {},
    });
  });

  test("POST /api/payments/extract-receipt normaliza pago movil y banco por coincidencia parcial", async () => {
    receiptOcr.extractReceiptData.mockResolvedValueOnce({
      amount: 50,
      date: null,
      reference: "PM-1",
      bank: "mercantil banco",
      method: "pago movil",
    });

    const response = await requestMultipart(server, "/api/payments/extract-receipt", {
      user: { id: 7, role: "seller" },
      filename: "receipt.jpg",
      contentType: "image/jpeg",
    });

    expect(response.status).toBe(200);
    expect(response.body.bank).toBe("Mercantil");
    expect(response.body.method).toBe("pago_movil");
  });
});
