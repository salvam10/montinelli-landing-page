import React, { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProductInCart} from "../slices/cartSlice";
import { AuthContext } from "../../App";

const Counter = ({ product_quantity, product_id }) => {
  const { user } = useContext(AuthContext);
  const cartItemsCount = useSelector((state) => state.cart.cartItemsCount);
  const [itemCount, setItemCount] = useState(product_quantity);
  const dispatch = useDispatch();
  
   useEffect(() => {
     setItemCount(product_quantity);
  },[product_quantity]) 
  
  const updateCart = (count, operator) => {
    setItemCount(count);
    dispatch(
      updateProductInCart({
        user_id: user.id,
        product_id: product_id,
        quantity: count,
      })
    );
  };

  const increment = () => updateCart(itemCount + 1, "+");
  const decrement = () => updateCart(itemCount - 1, "-");

  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setItemCount(value);
    } else {
      setItemCount(0);
    }
  };

  return (
    <div className="flex-center">
      <div className="flex gap-4">
        <button
          disabled={itemCount <= 1}
          onClick={decrement}
          className={`w-[30px] h-[30px] blue-bg text-[13px] font-bold text-white rounded-[100%] ${
            itemCount <= 1 && "!opacity-50"
          }`}
        >
          -
        </button>
        <input
          type="number"
          disabled
          value={itemCount}
          onChange={handleChange}
          className="xs:w-12 flex text-center font-bold"
        />
        <button
          onClick={increment}
          className="w-[30px] h-[30px] blue-bg text-[13px] font-bold text-white rounded-[100%]"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Counter;
