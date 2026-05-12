let mockOpenaiCreate;
let mockConvert;

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

jest.mock("convertapi", () => {
  mockConvert = jest.fn();
  return jest.fn(() => ({ convert: mockConvert }));
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
    expect(mockConvert).not.toHaveBeenCalled();
    expect(mockOpenaiCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
      })
    );
  });

  test("extractReceiptData con PDF convierte la primera página y luego llama a OpenAI", async () => {
    const pngBuffer = Buffer.from("png-file");

    mockConvert.mockResolvedValueOnce({
      response: { Files: [{ Url: "https://example.com/receipt.png" }] },
    });
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
    expect(mockConvert).toHaveBeenCalledWith(
      "png",
      expect.objectContaining({
        File: expect.objectContaining({ name: "receipt.pdf" }),
        PageRange: "1",
        ImageResolution: "150",
      }),
      "pdf"
    );
    expect(global.fetch).toHaveBeenCalledWith("https://example.com/receipt.png");
    expect(mockOpenaiCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          expect.objectContaining({
            content: expect.arrayContaining([
              expect.objectContaining({
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${pngBuffer.toString("base64")}`,
                },
              }),
            ]),
          }),
        ],
      })
    );
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
    mockConvert.mockRejectedValueOnce(new Error("convert failed"));
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await extractReceiptData(Buffer.from("pdf-file"), "application/pdf");

    expect(result).toEqual({});
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockOpenaiCreate).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("OCR extraction failed:", "convert failed");
    errorSpy.mockRestore();
  });
});
