import React, { useEffect, useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* components */
import CustomButton from "../../features/customButton/customButton";
import OrderSummary from "../../features/orderSummary/OrderSummary";
import { getProductsInCart } from "../../features/slices/cartSlice";
import CartList from "../../features/cartList/CartList";
import { AuthContext } from "../../App";
/* react router */
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { updatedProduct } = useSelector((state) => state.cart);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    // Retornar una función de limpieza para eliminar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    try {
      dispatch(getProductsInCart({ user_id: user.id }));
    } catch (error) {
      console.log(error);
    }
  }, [updatedProduct]);

  return (
    <div className="page-container">
      <CartList />
      <div className="xs:w-full md:w-[30%] md:h-[50%]">
        <OrderSummary
          windowWidth={windowWidth}
          buttonTitle="Ir a la orden"
          handleOnClick={() => navigate("/checkout")}
        />
      </div>
      {windowWidth < 640 && (
        <CustomButton
          title="Ir a la orden"
          handleOnClick={() => navigate("/checkout")}
        />
      )}
    </div>
  );
};

export default CartPage;
