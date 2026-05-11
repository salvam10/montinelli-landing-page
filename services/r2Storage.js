const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BUCKET = process.env.R2_BUCKET_NAME;
const RECEIPT_PREFIX = "receipts/";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Sube un comprobante de pago a R2.
 * @param {Buffer} buffer  — contenido del archivo
 * @param {string} originalName — nombre original (ej: "captura.png")
 * @param {string} mimeType — ej: "image/png"
 * @param {number} paymentId — ID del pago (para key único)
 * @returns {Promise<string>} — key del objeto en R2
 */
const uploadReceipt = async (buffer, originalName, mimeType, paymentId) => {
  const ext = originalName.split(".").pop() || "bin";
  const key = `${RECEIPT_PREFIX}${paymentId}-${Date.now()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return key;
};

/**
 * Genera una URL firmada para ver un comprobante (expira en 1h).
 * @param {string} key — key del objeto en R2 (ej: "receipts/42-1717000000.png")
 * @returns {Promise<string>} — URL firmada
 */
const getReceiptUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
};

module.exports = { uploadReceipt, getReceiptUrl };
