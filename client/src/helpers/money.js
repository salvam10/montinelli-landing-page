export const fmtMoney = (v) =>
  isNaN(Number(v)) ? "0.00" : Number(v).toFixed(2);

export const sumQty = (items) =>
  items?.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0) ?? 0;
