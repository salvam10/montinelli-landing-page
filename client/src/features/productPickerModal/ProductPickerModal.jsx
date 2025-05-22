import React, { useState, useEffect } from "react";
import CustomTextInput from "../customTextInput/CustomTextInput";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CloseIcon from "@mui/icons-material/Close";

const ProductPickerModal = ({
  products,
  productName,
  setProductName,
  setOpenModal,
  openModal,
  selectedProducts,
  setSelectedProducts,
  handleSubmitClick
}) => {
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(productName.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [productName, products]);

const toggleProduct = (product) => {
  setSelectedProducts((prev) => {
    const exists = prev.find((p) => p.id === product.id);
    if (exists) {
      return prev.filter((p) => p.id !== product.id);
    } else {
      return [...prev, { ...product, quantity: 1 }];
    }
  });
};

  const handleCloseClick = () => {
    setOpenModal(false);
  };


  return (
    <div className="modal-overlay">
      <div className="modal relative">
        {/* Header */}
        <div className="modal-header w-full flex justify-between items-center">
          <h3 className="text-[20px]">Seleccionar productos</h3>
          <button className="modal-close-button" onClick={handleCloseClick}>
            <CloseIcon />
          </button>
        </div>

        {/* Search bar */}
        <div className="w-full flex items-center gap-4 mb-4">
          <CustomTextInput
            width="w-full"
            setValue={setProductName}
            value={productName}
            placeholder="Buscar productos"
          />
          <CustomFormButton text="Explorar" width="w-[100px]" />
        </div>

        {/* Product list */}
        <div className="modal-inputs-container flex-1 overflow-y-auto divide-y text-sm border rounded-md">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center py-3 px-3 gap-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleProduct(product)}
            >
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5"
                checked={selectedProducts.some((p) => p.id === product.id)}
                onClick={(e) => e.stopPropagation()}
                onChange={() => toggleProduct(product)}
              />
              <img
                src={product.media_url}
                alt={product.name}
                className="w-14 h-14 rounded object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-gray-500 text-sm">{product.description}</p>
              </div>
              <div className="min-w-[90px] text-right font-semibold text-gray-700">
                ${parseFloat(product.base_price).toFixed(2)} USD
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 mt-4 w-full">
          <span className="text-sm text-gray-500">
            {selectedProducts.length}/{products.length} variantes seleccionadas
          </span>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
              onClick={handleCloseClick}
            >
              Cancelar
            </button>
            <button
              className={`px-4 py-2 rounded text-white ${
                selectedProducts.length === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={() => {
                handleSubmitClick()
                setOpenModal(false);
              }}
              disabled={selectedProducts.length === 0}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPickerModal;
