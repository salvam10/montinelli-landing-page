const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function pdfToImage(pdfBuffer) {
  const secret = process.env.CONVERTAPI_SECRET;
  const url = `https://v2.convertapi.com/convert/pdf/to/png?Secret=${secret}&StoreFile=true&PageRange=1&ImageResolution=150`;

  const boundary = "----ConvertApiBoundary" + Date.now();
  const fileName = "receipt.pdf";

  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="File"; filename="${fileName}"\r\n`,
    `Content-Type: application/pdf\r\n\r\n`,
  ];

  const header = Buffer.from(bodyParts.join(""));
  const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
  const body = Buffer.concat([header, pdfBuffer, footer]);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": body.length.toString(),
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ConvertAPI error ${res.status}: ${text}`);
  }

  const result = await res.json();
  const fileUrl = result.Files[0].Url;
  const imageRes = await fetch(fileUrl);
  return Buffer.from(await imageRes.arrayBuffer());
}

async function extractReceiptData(fileBuffer, mimeType) {
  try {
    let imageBuffer = fileBuffer;
    let imageMime = mimeType;

    if (mimeType === "application/pdf") {
      imageBuffer = await pdfToImage(fileBuffer);
      imageMime = "image/png";
    }

    const base64 = imageBuffer.toString("base64");
    const dataUrl = `data:${imageMime};base64,${base64}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extraé datos del comprobante de pago o retención. Respondé SOLO JSON con keys: amount (número sin símbolo de moneda — si es retención usá el monto de IVA Retenido), date (YYYY-MM-DD o null), reference (string: número de comprobante, referencia u operación, o null), bank (string o null), method (string: transferencia, pago movil, zelle, efectivo, o null), payment_type (string: 'retencion' si es un comprobante de retención de IVA/SENIAT, 'pago_factura' si es un comprobante de pago/transferencia bancaria, o null si no podés determinarlo). Si no podés leer un campo, devolvé null. No inventes valores.",
            },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 300,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("OCR extraction failed:", err.message);
    console.error("OCR error stack:", err.stack);
    return {};
  }
}

module.exports = { extractReceiptData, pdfToImage };
