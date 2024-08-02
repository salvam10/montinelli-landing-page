import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
/* React Router Dom */
import { useParams } from "react-router-dom";
import {
  getClientByOrderId,
  getProductsByOrderId,
  getOrderById,
} from "../../features/slices/ordersSlice";
/* Components */
import CustomButton from "../customButton/customButton";
import OrderBillingDetails from "../orderBillingDetails/OrderBillingDetails";
import OrderProductsDetails from "../orderProductDetails/OrderProductsDetails";
import OrderClientDetails from "../orderClientDetails/OrderClientDetails";

const Order = () => {
  const { orderProducts, orderClient, order } = useSelector(
    (state) => state.orders
  );
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    dispatch(getOrderById({ orderId: id }));
    dispatch(getProductsByOrderId({ orderId: id }));
    dispatch(getClientByOrderId({ orderId: id }));
  }, []);

  return (
    <div className="page-container md:flex-col overflow-auto bg-transparent">
      <OrderProductsDetails orderProducts={orderProducts} />
      <OrderBillingDetails order={order} />
      <OrderClientDetails orderClient={orderClient} />
    </div>
  );
};

export default Order;
