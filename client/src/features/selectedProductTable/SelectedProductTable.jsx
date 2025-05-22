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

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 items-center bg-gray-100 responsive-text font-semibold px-4 py-2">
        <div className="col-span-6">Producto</div>
        <div className="col-span-2 text-center">Cantidad</div>
        <div className="col-span-3 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {selectedProducts.map((product) => (
        <div
          key={product.id}
          className="grid grid-cols-12 items-center border-t px-4 py-3"
        >
          {/* Imagen + info */}
          <div className="col-span-6 flex items-center gap-3">
            <img
              src={product.media_url}
              alt={product.name}
              className="w-24 h-24 rounded object-cover"
            />
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-[#B3B3B3] font-medium">
                {product.description}
              </p>
              <p className="responsive-text text-blue-600">
                ${parseFloat(product.base_price).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Cantidad */}
          <div className="col-span-2 text-center responsive-text">
            <input
              type="number"
              min={1}
              value={product.quantity || 1}
              onChange={(e) => handleQuantityChange(product.id, e.target.value)}
              className="w-16 px-2 py-1 border rounded text-center"
            />
          </div>

          {/* Total */}
          <div className="col-span-3 text-right font-semibold responsive-text text-gray-700">
            $
            {((product.quantity || 1) * parseFloat(product.base_price)).toFixed(
              2
            )}
          </div>

          {/* Eliminar */}
          <div className="col-span-1 text-right">
            <button onClick={() => removeProduct(product.id)}>
              <CloseIcon fontSize="small" className="text-gray-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SelectedProductTable;
