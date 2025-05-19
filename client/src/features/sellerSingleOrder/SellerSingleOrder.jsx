import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getOrderById,
  getProductsByOrderId,
  getClientByOrderId,
} from "../slices/ordersSlice";
import OrderProductsDetails from "../orderProductDetails/OrderProductsDetails";
import { getPaymentTerms } from "../../features/slices/paymentTermsSlice";
import ProductsList from "../productsList/ProductsList";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";
import { useNavigate } from "react-router-dom";

const SellerSingleOrder = () => {
  const { orderId } = useParams();
  console.log("order id", orderId);

  const { orderProducts, orderClient, order } = useSelector(
    (state) => state.orders
  );
  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrderById({ orderId: orderId }));
    dispatch(getProductsByOrderId({ orderId: orderId }));
    dispatch(getClientByOrderId({ orderId: orderId }));
    dispatch(getPaymentTerms());
  }, []);

  return (
    <div className="h-screen flex flex-col gap-10 bg-white mt-10">
      <div className="relative flex-center flex items-bottom py-4 border-b">
        <span
          className="absolute left-5 py-1 px-2 bg-[rgba(235,235,235,1)] rounded-full cursor-pointer"
          onClick={() => {
            navigate("/mis-pedidos");
          }}
        >
          <ArrowBackIosOutlinedIcon
            style={{
              fontSize: "small",
              color: "#B3B3B3",
              fontWeight: "600",
            }}
          />
        </span>
        <span className="responsive-text font-bold">{order?.client_name}</span>
      </div>
      <div className="">
        <ProductsList orderProducts={orderProducts} />
      </div>
    </div>
  );
};

export default SellerSingleOrder;
