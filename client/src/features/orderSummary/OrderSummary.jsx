import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
/* components */
import CustomButton from "../customButton/customButton";
import { setCartSubtotal } from "../slices/cartSlice";
import { useNavigate } from "react-router-dom";

const OrderSummary = ({ windowWidth, buttonTitle, handleOnClick }) => {
  const navigate = useNavigate();
  const { cartSubtotal, productsInCart, shippingCost } = useSelector(
    (state) => state.cart
  );
  const { bsExchangeRate } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCartSubtotal());
  }, [productsInCart]);

  const calculateIVA = () => {
    let acumIVA = 0;
    productsInCart?.map((product) => {
      console.log("product", product);
      return (acumIVA +=
        product.quantity *
        ((product.base_price * product.tax_percentage) / 100));
    });
    return acumIVA.toFixed(2);
  };

  return (
    <div className="flex flex-col gap-5 xs:py-[10px] xs:px-[20px]  bg-white">
      <div className="flex-center">
        <h3 className="font-bold ">Resumen del Pedido</h3>
      </div>
      <div>
        <ul>
          <li className="flex-between xs:p-[10px] border-2 border-l-0 border-r-0 border-[#F8F8F8]">
            <span className="title font-bold xs:text-[13px]">Subtotal</span>
            <div className="flex-end flex-col">
              <span className="value font-bold xs:text-[13px] text-[#B3B3B3]">
                ${cartSubtotal}
              </span>
            </div>
          </li>
          <li className="flex-between xs:p-[10px] border-2 border-l-0 border-r-0 border-[#F8F8F8]">
            <span className="title font-bold xs:text-[13px]">I.V.A</span>
            <div className="flex-end flex-col">
              <span className="value font-bold xs:text-[13px] text-[#B3B3B3]">
                ${calculateIVA()}
              </span>
            </div>
          </li>
          <li className="flex-between xs:p-[10px] border-1 border-l-0 border-r-0 border-[#F8F8F8] font-bold">
            <span className="title xs:text-[12px] font-bold">
              Costo de Envío
            </span>
            <span className="value xs:text-[12px] text-[#B3B3B3] font-bold">
              $ {shippingCost.toFixed(2)}
            </span>
          </li>
          <li className="flex-between xs:p-[10px] border-2 border-l-0 border-r-0 border-[#F8F8F8]">
            <span className="title font-bold xs:text-[15px]">Total</span>
            <div className="flex flex-col flex-end">
              <span className="font-bold xs:text-[15px] !text-right">
                ${(parseFloat(cartSubtotal) + shippingCost).toFixed(2)}
              </span>
            </div>
          </li>
        </ul>
      </div>
      <div className="xs:hidden md:block md:w-full flex-center">
        <CustomButton title={buttonTitle} handleOnClick={handleOnClick} />
      </div>
    </div>
  );
};

export default OrderSummary;
