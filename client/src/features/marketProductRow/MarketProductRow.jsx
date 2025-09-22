import { useMemo } from "react";

const MarketProductRow = ({ product, value, onChange, currency, fxRate }) => {
  const price = value?.price ?? "";

  const approxUSD = useMemo(() => {
    const n = Number(price);
    if (currency !== "VES" || !fxRate || !isFinite(n) || n <= 0) return null;
    const usd = n / Number(fxRate);
    if (!isFinite(usd) || usd <= 0) return null;
    return usd.toFixed(2);
  }, [price, currency, fxRate]);

  const setField = (field, v) => onChange?.({ ...value, [field]: v });

  return (
    <div className="grid grid-cols-12 gap-2 items-center border-b py-3 px-3">
      {/* Foto */}
      <div className="col-span-2 flex justify-center">
        {product.photo_url ? (
          <img
            src={product.photo_url}
            alt={product.name}
            className="h-20 w-20 object-contain rounded"
          />
        ) : (
          <div className="h-14 w-14 flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded">
            No Img
          </div>
        )}
      </div>

      {/* Detalles */}
      <div className="col-span-6">
        <div className="responsive-text font-bold leading-tight">
          {product.name}
        </div>
        <div className="text-sm text-gray-500">
          {product.presentation} • {product.weight_g}g •{" "}
          {product.brand_name || ""}
        </div>
      </div>

      {/* Precio (moneda global) */}
      <div className="col-span-4 flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          className="border responsive-text rounded px-3 py-2 w-full"
          placeholder={currency === "VES" ? "Precio (Bs)" : "Precio (USD)"}
          value={price}
          onChange={(e) => setField("price", e.target.value)}
        />
        {approxUSD && (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            ≈ ${approxUSD}
          </span>
        )}
      </div>
    </div>
  );
};

export default MarketProductRow;
