import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProductPickerModal from "../../features/productPickerModal/ProductPickerModal";
import { getAllProducts } from "../../features/slices/productsSlice";
import CustomTextInput from "../../features/customTextInput/CustomTextInput";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";
import SelectedProductTable from "../../features/selectedProductTable/SelectedProductTable";

const CreateOrderPage = () => {
  const [productName, setProductName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const { products, isLoading } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProducts());
  }, []);

  useEffect(() => {
    console.log("selectedProducts", selectedProducts);
  }, [selectedProducts]);

  const handleSubmitClick = () => {
    console.log("selectedProducts", selectedProducts);
  };

  return (
    <div className="w-[80%] flex flex-col gap-4 bg-white p-6 rounded-lg shadow max-h-[80vh] overflow-y-auto">
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

export default CreateOrderPage;
