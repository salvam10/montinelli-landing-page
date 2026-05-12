jest.mock("../db/postgres", () => ({
  query: jest.fn(),
}));

jest.mock("../services/r2Storage", () => ({
  uploadReceipt: jest.fn(),
  getReceiptUrl: jest.fn(),
}));

const express = require("express");
const http = require("http");
const postgresDB = require("../db/postgres");
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
});
