import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* React Router Dom */
import { useParams } from "react-router-dom";
import {
  getClientByOrderId,
  getProductsByOrderId,
  getOrderById,
  getOrderBalance,
} from "../../features/slices/ordersSlice";
/* Components */
import OrderBillingDetails from "../orderBillingDetails/OrderBillingDetails";
import OrderProductsDetails from "../orderProductDetails/OrderProductsDetails";
import OrderClientDetails from "../orderClientDetails/OrderClientDetails";
import OrderHeader from "../orderHeader/OrderHeader";
import { getPaymentTerms } from "../../features/slices/paymentTermsSlice";
import ProductPickerModal from "../productPickerModal/ProductPickerModal";
import { addOrderItemsBulk } from "../../features/slices/orderItemsSlice";
import { getAllProducts } from "../slices/productsSlice";

const Order = () => {
  const [openManagerDrop, setOpenManagerDrop] = useState(false);
  const [openDebtDrop, setOpenDebtDrop] = useState(false);
  const [openGroupedDrop, setOpenGroupedDrop] = useState(false);
  const [openAddProd, setOpenAddProd] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const { products, isLoading } = useSelector((state) => state.products);
  const { orderProducts, orderClient, orderBalance, order } = useSelector(
    (state) => state.orders
  );

  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getOrderById({ orderId: id }));
    dispatch(getProductsByOrderId({ orderId: id }));
    dispatch(getClientByOrderId({ orderId: id }));
    dispatch(getPaymentTerms());
    dispatch(getOrderBalance({ orderId: id }));
    dispatch(getAllProducts());
  }, []);

  const handleSubmitClick = async () => { 
    await dispatch(addOrderItemsBulk({ orderId: order.id, products: selectedProducts }));
    dispatch(getProductsByOrderId({ orderId: id }));
    dispatch(getOrderById({ orderId: id }));
    dispatch(getOrderBalance({ orderId: id }));
  };

  return (
    <div className="flex items-center flex-col p-5 bg-transparent gap-5">
      <div className="xs:w-full md:w-[80%]">
        <OrderHeader
          order={order}
          client={orderClient}
          openManagerDrop={openManagerDrop}
          setOpenManagerDrop={setOpenManagerDrop}
          openDebtDrop={openDebtDrop}
          setOpenDebtDrop={setOpenDebtDrop}
          openGroupedDrop={openGroupedDrop}
          setOpenGroupedDrop={setOpenGroupedDrop}
        />
      </div>
      <div className="xs:w-full md:w-[90%] flex flex-col gap-5">
        <div className="w-full flex flex-col gap-5">
          <OrderClientDetails orderClient={orderClient} order={order} />
          <OrderProductsDetails
            orderProducts={orderProducts}
            order={order}
            setOpenAddProd={setOpenAddProd}
          />
          <OrderBillingDetails
            orderProducts={orderProducts}
            orderClient={orderClient}
            order={order}
            orderBalance={orderBalance}
          />
        </div>
      </div>
      {openAddProd && (
        <ProductPickerModal
          products={products}
          productName={productName}
          setProductName={setProductName}
          setOpenModal={setOpenAddProd}
          openModal={openAddProd}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          handleSubmitClick={handleSubmitClick}
        />
      )}
    </div>
  );
};

export default Order;
