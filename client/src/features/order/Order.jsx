import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* React Router Dom */
import { useParams } from "react-router-dom";
import {
  getClientByOrderId,
  getProductsByOrderId,
  getOrderById,
} from "../../features/slices/ordersSlice";
/* Components */
import OrderBillingDetails from "../orderBillingDetails/OrderBillingDetails";
import OrderProductsDetails from "../orderProductDetails/OrderProductsDetails";
import OrderClientDetails from "../orderClientDetails/OrderClientDetails";
import OrderClientStatus from "../orderClientStatus/OrderClientStatus";
import OrderHeader from "../orderHeader/OrderHeader";
import { getPaymentTerms } from "../../features/slices/paymentTermsSlice";

const Order = () => {
  const [openManagerDrop, setOpenManagerDrop] = useState(false);
  const [openDebtDrop, setOpenDebtDrop] = useState(false);
  const { orderProducts, orderClient, order } = useSelector(
    (state) => state.orders
  );

  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getOrderById({ orderId: id }));
    dispatch(getProductsByOrderId({ orderId: id }));
    dispatch(getClientByOrderId({ orderId: id }));
    dispatch(getPaymentTerms());
  }, []);

  return (
    <div className="flex items-center flex-col p-5 bg-transparent gap-5">
      <div className="w-[80%]">
        <OrderHeader
          order={order}
          client={orderClient}
          openManagerDrop={openManagerDrop}
          setOpenManagerDrop={setOpenManagerDrop}
          openDebtDrop={openDebtDrop}
          setOpenDebtDrop={setOpenDebtDrop}
        />
      </div>
      <div className="xs:w-full md:w-[80%] flex gap-5">
        <div className="md:w-[70%] flex flex-col gap-5">
          <OrderProductsDetails orderProducts={orderProducts} order={order} />
          <OrderBillingDetails order={order} />
        </div>
        <div className="md:w-[30%] flex flex-col gap-5">
          <OrderClientDetails orderClient={orderClient} order={order} />
        </div>
      </div>
    </div>
  );
};

export default Order;
