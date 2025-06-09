import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAllProducts } from "../../features/slices/productsSlice";
import ProductPicker from "../../features/productPicker/ProductPicker";
import ClientPicker from "../../features/clientPicker/ClientPicker";
import AddInvoice from "../../features/addInvoice/AddInvoice";
import StatusesPicker from "../../features/statusesPicker/StatusesPicker";
import SellerPicker from "../../features/sellerPicker/SellerPicker";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";
import PaymentSummary from "../../features/paymentSummary/PaymentSummary";
import { createSplitOrders } from "../../features/slices/ordersSlice";
import { paymentStatuses } from "../../dummy";

const CreateOrderPage = () => {
  const { isLoading } = useSelector((state) => state.orders);
  const [selectedSeller, setSelectedSeller] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [selectedClientId, setSelectedClientId] = useState();
  const [paymentStatus, setPaymentStatus] = useState(paymentStatuses[0]);
  const [managerStatus, setManagerStatus] = useState();
  const [openManagerDrop, setOpenManagerDrop] = useState(false);
  const [openPaymentDrop, setOpenPaymentDrop] = useState(false);
  const [openGroupedDrop, setOpenGroupedDrop] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProducts());
  }, []);

  // Cálculo del resumen de pago
  const subtotal = selectedProducts.reduce(
    (acc, product) => acc + (product.base_price || 0) * (product.quantity || 0),
    0
  );

  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const order = {
    subtotal,
    shippingCost,
    total,
  };

  const handleCreateOrder = () => {
    dispatch(
      createSplitOrders({
        user_id: selectedSeller.id,
        payment_status_id: paymentStatus.value,
        manager_approval_status: managerStatus.value,
        shipping_cost: 0,
        shipping_status: "Despachado",
        payment_method: "credito",
        client_id: selectedClientId,
        created_at: invoiceDate,
        invoice_date: invoiceDate,
        invoice_number: invoiceNumber,
        productsInCart: selectedProducts, // debe incluir category_id
      })
    );
  };

  return (
    <div className="w-full flex items-center flex-col p-5 bg-transparent gap-5 overflow-auto max-h-[90vh]">
      <div className="xs:w-full md:w-[80%]">
        <StatusesPicker
          openManagerDrop={openManagerDrop}
          setOpenManagerDrop={setOpenManagerDrop}
          openGroupedDrop={openGroupedDrop}
          setOpenGroupedDrop={setOpenGroupedDrop}
          openPaymentDrop={openPaymentDrop}
          setOpenPaymentDrop={setOpenPaymentDrop}
          paymentStatus={paymentStatus}
          setPaymentStatus={setPaymentStatus}
          managerStatus={managerStatus}
          setManagerStatus={setManagerStatus}
        />
        <CustomFormButton
          isLoading={isLoading}
          text="Guardar"
          width="w-auto"
          handleClickFunction={handleCreateOrder}
        />
      </div>

      <div className="xs:w-full md:w-[80%] flex flex-col md:flex-row gap-5">
        <div className="w-full md:w-[70%] flex flex-col gap-5">
          <ProductPicker
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
          />
          <PaymentSummary orderProducts={selectedProducts} order={order} />
        </div>

        <div className="w-full md:w-[30%] flex flex-col gap-5">
          <ClientPicker
            selectedClientId={selectedClientId}
            setSelectedClientId={setSelectedClientId}
          />
          <AddInvoice
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            invoiceDate={invoiceDate}
            setInvoiceDate={setInvoiceDate}
          />
          <SellerPicker
            selectedSeller={selectedSeller}
            setSelectedSeller={setSelectedSeller}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
