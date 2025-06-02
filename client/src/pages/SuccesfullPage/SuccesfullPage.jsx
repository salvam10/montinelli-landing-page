import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { cleanCart } from "../../features/slices/cartSlice";

const SuccesfullPage = () => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("cart", cart);

    if (cart) {
      dispatch(cleanCart({ cartId: cart.id }));
    }
  }, [cart]);

  return (
    <div className="page-container">
      <div className="section-container h-[80%]">
        <div className="flex-center flex-col">
          <h3 className="font-bold xs:text-[30px] md:text-[50px]">
            Pedido Realizado
          </h3>
          <CheckCircleIcon style={{ fontSize: "50px", color: "green" }} />
        </div>
      </div>
    </div>
  );
};

export default SuccesfullPage;
