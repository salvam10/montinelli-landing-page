let mockOpenaiCreate;

jest.mock("openai", () => {
  mockOpenaiCreate = jest.fn();

  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockOpenaiCreate,
      },
    },
  }));
});

describe("services/receiptOcr", () => {
  let extractReceiptData;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    global.fetch = jest.fn();

    ({ extractReceiptData } = require("./receiptOcr"));
  });

  afterEach(() => {
    delete global.fetch;
  });

  test("extractReceiptData con imagen devuelve el JSON parseado", async () => {
    mockOpenaiCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ amount: 125.5, bank: "Banesco" }) } }],
    });

    const result = await extractReceiptData(Buffer.from("imagen"), "image/png");

    expect(result).toEqual({ amount: 125.5, bank: "Banesco" });
    // fetch should NOT be called for images (no ConvertAPI needed)
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOpenaiCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
      })
    );
  });

  test("extractReceiptData con PDF convierte via ConvertAPI y luego llama a OpenAI", async () => {
    const pngBuffer = Buffer.from("png-file");

    // First fetch: ConvertAPI PDF→PNG
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({
        Files: [{ Url: "https://example.com/receipt.png" }],
      }),
    });
    // Second fetch: download converted PNG
    global.fetch.mockResolvedValueOnce({
      arrayBuffer: jest.fn().mockResolvedValueOnce(
        pngBuffer.buffer.slice(
          pngBuffer.byteOffset,
          pngBuffer.byteOffset + pngBuffer.byteLength
        )
      ),
    });
    mockOpenaiCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ amount: 88, method: "transferencia" }) } }],
    });

    const result = await extractReceiptData(Buffer.from("pdf-file"), "application/pdf");

    expect(result).toEqual({ amount: 88, method: "transferencia" });
    // First call is ConvertAPI
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("v2.convertapi.com/convert/pdf/to/png"),
      expect.objectContaining({ method: "POST" })
    );
    // Second call downloads the PNG
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/receipt.png");
    expect(mockOpenaiCreate).toHaveBeenCalled();
  });

  test("extractReceiptData devuelve {} cuando OpenAI falla", async () => {
    mockOpenaiCreate.mockRejectedValueOnce(new Error("openai failed"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await extractReceiptData(Buffer.from("imagen"), "image/jpeg");

    expect(result).toEqual({});
    expect(errorSpy).toHaveBeenCalledWith("OCR extraction failed:", "openai failed");
    errorSpy.mockRestore();
  });

  test("extractReceiptData devuelve {} cuando ConvertAPI falla con PDF", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValueOnce("Server error"),
    });
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await extractReceiptData(Buffer.from("pdf-file"), "application/pdf");

    expect(result).toEqual({});
    expect(mockOpenaiCreate).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
