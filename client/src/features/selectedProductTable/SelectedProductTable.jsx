import React from "react";
import CloseIcon from "@mui/icons-material/Close";

const SelectedProductTable = ({ selectedProducts, setSelectedProducts }) => {
  const handleQuantityChange = (id, quantity) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, quantity: Math.max(1, parseInt(quantity) || 1) }
          : p
      )
    );
  };

  const handlePriceChange = (id, price) => {
    const parsedPrice = parseFloat(price) || 0;
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, base_price: parsedPrice } : p))
    );
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="w-full mt-6 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 items-center responsive-text font-semibold px-5 py-2">
        <div className="col-span-5">Producto</div>
        <div className="col-span-2 text-center">Cantidad</div>
        <div className="col-span-2 text-center">Precio</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {selectedProducts.map((product) => {
        const unitPrice = Number(product.base_price || 0);
        const quantity = product.quantity || 1;
        const total = (unitPrice * quantity).toFixed(2);

        return (
          <div
            key={product.id}
            className="grid grid-cols-12 items-center border-t px-4 py-3"
          >
            {/* Imagen + info */}
            <div className="col-span-5 flex items-center gap-3">
              <img
                src={product.media_url}
                alt={product.name}
                className="w-16 h-16 rounded object-cover"
              />
              <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-[#B3B3B3] font-medium">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Cantidad */}
            <div className="col-span-2 text-center responsive-text">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(product.id, e.target.value)
                }
                className="w-16 px-2 py-1 border rounded text-center"
              />
            </div>

            {/* Precio unitario editable */}
            <div className="col-span-2 text-center responsive-text">
              <input
                type="number"
                min={0}
                step="0.01"
                value={Number(product.base_price || 0).toFixed(2)}
                onChange={(e) => handlePriceChange(product.id, e.target.value)}
                className="w-20 px-2 py-1 border rounded text-center"
              />
            </div>

            {/* Total */}
            <div className="col-span-2 text-right font-semibold responsive-text text-gray-700">
              ${total}
            </div>

            {/* Eliminar */}
            <div className="col-span-1 text-right">
              <button onClick={() => removeProduct(product.id)}>
                <CloseIcon fontSize="small" className="text-gray-500" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectedProductTable;
