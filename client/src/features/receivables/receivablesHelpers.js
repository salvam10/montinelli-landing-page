// ─── Helpers para el módulo de cuentas por cobrar ─────────────────────────────

/** Formatea un número como moneda USD con separadores en es-VE */
export const fmtMoney = (v) => {
  const n = Number(v) || 0;
  return `$${n.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Versión corta para summary cards ($1.2k) */
export const fmtMoneyShort = (v) => {
  const n = Number(v) || 0;
  if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
};

/** Clasifica un cliente en un bucket de severidad por días de mora */
export const bucketOf = (client) => {
  const days = Number(client.max_morosidad_days) || 0;
  const overdue = Number(client.overdue_amount) || 0;
  if (overdue === 0 && Number(client.pending_amount) > 0) return "por_vencer";
  if (overdue === 0) return "al_dia";
  if (days >= 60) return "critico";
  if (days >= 30) return "vencido";
  return "reciente";
};

/** Metadata visual por bucket */
export const BUCKET_META = {
  critico: {
    label: "Crítico",
    sub: "+60 días",
    color: "#b13a2a",
    bg: "#fdecea",
  },
  vencido: {
    label: "Vencido",
    sub: "30–60 días",
    color: "#d97a1f",
    bg: "#fdf2e3",
  },
  reciente: {
    label: "Mora reciente",
    sub: "1–29 días",
    color: "#a37800",
    bg: "#fbf4d8",
  },
  por_vencer: {
    label: "Por vencer",
    sub: "Aún en plazo",
    color: "#1a6fbf",
    bg: "#e6f1fb",
  },
  al_dia: {
    label: "Al día",
    sub: "Sin deuda",
    color: "#1f7a4d",
    bg: "#e6f4ec",
  },
};

/** Extrae iniciales de un nombre comercial (ignora C.A., S.A.) */
export const initialsOf = (name) => {
  const tokens = String(name || "")
    .replace(/[,.&]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !/^c\.?a\.?$/i.test(t) && !/^s\.?a\.?$/i.test(t));
  return (tokens[0]?.[0] || "?") + (tokens[1]?.[0] || "");
};

/** Color estable a partir del nombre */
export const colorFromName = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const palette = [
    "#5b6cff",
    "#0f9d58",
    "#d97a1f",
    "#9b59b6",
    "#11806a",
    "#c0392b",
    "#2980b9",
    "#8e44ad",
    "#16a085",
    "#d35400",
  ];
  return palette[h % palette.length];
};

/** Calcula la deuda neta total a partir de un array de items */
export const calculateTotalNetDebt = (items) =>
  items.reduce((acc, c) => acc + (Number(c.net_debt) || 0), 0);

/** Calcula la deuda bruta total */
export const calculateTotalGrossDebt = (items) =>
  items.reduce((acc, c) => acc + (Number(c.gross_debt) || 0), 0);

/** Calcula el total de créditos */
export const calculateTotalCredits = (items) =>
  items.reduce((acc, c) => acc + (Number(c.client_credits) || 0), 0);

/** Calcula el total vencido */
export const calculateTotalOverdue = (items) =>
  items.reduce((acc, c) => acc + (Number(c.overdue_amount) || 0), 0);
