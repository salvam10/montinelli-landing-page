import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProductPickerModal from "../../features/productPickerModal/ProductPickerModal";
import { getAllProducts } from "../../features/slices/productsSlice";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";
import SelectedProductTable from "../../features/selectedProductTable/SelectedProductTable";

const ProductPicker = ({ selectedProducts, setSelectedProducts }) => {
  const [productName, setProductName] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const { products, isLoading } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  const handleSubmitClick = () => {
    console.log("selectedProducts (enviar al backend)", selectedProducts);
  };

  return (
    <div className="section-container px-0">
      <div className="w-full flex px-5">
        <h2 className="font-bold text-[14px]">Productos</h2>
      </div>

      <div className="flex-start">
        <CustomFormButton
          text="Agregar productos"
          width="w-auto"
          handleClickFunction={() => setOpenModal(true)}
        />
      </div>

      {openModal && (
        <ProductPickerModal
          products={products}
          productName={productName}
          setProductName={setProductName}
          setOpenModal={setOpenModal}
          openModal={openModal}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          handleSubmitClick={handleSubmitClick}
        />
      )}

      {selectedProducts.length > 0 && (
        <SelectedProductTable
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
      )}
    </div>
  );
};

export default ProductPicker;
