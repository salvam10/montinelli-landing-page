import React from "react";

const fmtMoney = (v) =>
  isNaN(Number(v))
    ? "$0.00"
    : `$${Number(v).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

const ProductsList = ({ orderProducts = [] }) => {
  // Espera campos comunes: photo_url, name/product_name, presentation, unit_price/price, quantity/qty, line_total
  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="hidden grid-cols-12 items-center bg-neutral-50 px-4 py-3 text-xs font-semibold text-neutral-600 md:grid">
        <div className="col-span-6">Producto</div>
        <div className="col-span-2 text-right">Precio</div>
        <div className="col-span-2 text-right">Cantidad</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      {/* Items */}
      <ul className="divide-y">
        {orderProducts.map((it) => {
          const name = it.product_name || it.name || "—";
          const presentation = it.presentation || it.variant || "";
          const price = it.base_proce ?? it.base_price ?? 0;
          const qty = it.quantity ?? it.qty ?? 1;
          const lineTotal = it.line_total ?? Number(price) * Number(qty);
          const img = it.media_url || it.photo_url;

          return (
            <li key={it.id || `${name}-${presentation}`} className="px-4 py-3">
              <div className="grid grid-cols-12 items-center gap-3">
                {/* Left: image + name */}
                <div className="col-span-12 flex items-center gap-3 md:col-span-6">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-neutral-200">
                    {img ? (
                      <img
                        src={img}
                        alt={name}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-neutral-900">
                      {name}
                    </div>
                    <div className="truncate text-xs text-neutral-500">
                      {presentation}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-6 mt-2 text-sm text-neutral-700 md:col-span-2 md:mt-0 md:text-right">
                  {fmtMoney(price)}
                </div>

                {/* Qty */}
                <div className="col-span-3 mt-2 text-sm text-neutral-700 md:col-span-2 md:mt-0 md:text-right">
                  {qty}
                </div>

                {/* Line total */}
                <div className="col-span-3 mt-2 text-right text-sm font-semibold text-neutral-900 md:col-span-2 md:mt-0">
                  {fmtMoney(lineTotal)}
                </div>
              </div>
            </li>
          );
        })}

        {orderProducts.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-500">
            No hay productos en este pedido.
          </li>
        )}
      </ul>
    </div>
  );
};

export default ProductsList;
