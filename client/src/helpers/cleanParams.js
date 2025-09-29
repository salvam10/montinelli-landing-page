export const cleanParams = (params = {}) => {
  const out = {};
  for (const [k, v] of Object.entries(params)) {
    // si v es undefined, null o string vacío => se ignora
    if (v === undefined || v === null || v === "") continue;

    // si es array, se filtran elementos vacíos
    if (Array.isArray(v)) {
      const arr = v.filter((x) => x !== undefined && x !== null && x !== "");
      if (arr.length) out[k] = arr; // solo lo agrega si quedó con valores
    } else {
      // si es un valor válido (string, número, booleano) => se agrega
      out[k] = v;
    }
  }
  return out;
};
