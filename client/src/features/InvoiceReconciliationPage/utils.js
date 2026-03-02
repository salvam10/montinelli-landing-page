export const REQUIRED_COLUMNS = [
  "codigo_cliente",
  "cliente",
  "tipo_de_documento",
  "numero",
  "neto",
  "saldo",
];

export const EXCEL_HEADER_ROW_INDEX = 10;

export const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

export const normalizeHeader = (value) =>
  normalizeText(value).replace(/\s+/g, "_");

export const normalizeClientName = (value) => normalizeText(value);

export const normalizeProfitCode = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

export const normalizeInvoiceNumber = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/^#/, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ");

export const getDisplayDocumentNumber = (value) =>
  String(value || "").trim().replace(/^#/, "");

export const isBlankCell = (value) =>
  value === null || value === undefined || String(value).trim() === "";

export const parseMoneyValue = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/\./g, "").replace(",", ".").trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const shouldDropByTotals = (normalizedRow) => {
  const codigo = normalizeText(normalizedRow.codigo_cliente);
  const cliente = normalizeText(normalizedRow.cliente);
  const tipo = normalizeText(normalizedRow.tipo_de_documento);

  return (
    codigo.includes("subtotales") ||
    codigo.includes("totales") ||
    cliente.includes("subtotales") ||
    cliente.includes("totales") ||
    tipo.includes("subtotales") ||
    tipo.includes("totales")
  );
};

export const isRowEmpty = (rowArray) =>
  !Array.isArray(rowArray) || rowArray.every((cell) => isBlankCell(cell));

export const isCreditDocumentType = (normalizedType) =>
  ["adelantos", "notas de credito"].includes(normalizedType);

export const isInvoiceDocumentType = (normalizedType) =>
  normalizedType === "facturas";

export const isExcludedDocumentType = (normalizedType) =>
  ["ajustes negativos", "ajustes positivos"].includes(normalizedType);

export const mapProfitStatusToPaymentStatusId = (status) => {
  const normalized = normalizeText(status);
  if (normalized === "pagada" || normalized === "pagado") return 2;
  if (
    ["pago parcial", "parcial", "pendiente", "pendiente de pago"].includes(
      normalized,
    )
  ) {
    return 1;
  }
  return null;
};

export const getPaymentStatusLabel = (paymentStatusId) => {
  const id = Number(paymentStatusId);
  if (id === 1) return "pendiente";
  if (id === 2) return "pagada";
  if (id === 3) return "vencida";
  if (id === 4) return "reclamo";
  return "-";
};

export const getCreditProfitAmount = ({ saldo, neto }) => {
  const saldoNumber = parseMoneyValue(saldo);
  const netoNumber = parseMoneyValue(neto);
  const baseAmount = saldoNumber !== 0 ? saldoNumber : netoNumber;
  return Math.abs(baseAmount);
};

export const fmtMoney = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) return "$0.00";
  return `$${number.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
};

const padDate = (value) => String(value).padStart(2, "0");

const formatDate = ({ day, month, year }) =>
  `${padDate(day)}/${padDate(month)}/${year}`;

export const formatExcelDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate({
      day: value.getDate(),
      month: value.getMonth() + 1,
      year: value.getFullYear(),
    });
  }

  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    const excelBaseDate = Date.UTC(1899, 11, 30);
    const milliseconds = Math.round(value * 24 * 60 * 60 * 1000);
    const excelDate = new Date(excelBaseDate + milliseconds);
    return formatDate({
      day: excelDate.getUTCDate(),
      month: excelDate.getUTCMonth() + 1,
      year: excelDate.getUTCFullYear(),
    });
  }

  const raw = String(value || "").trim();
  if (!raw) return "-";
  return raw;
};
