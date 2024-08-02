import React, { useContext } from "react";
import { useDispatch } from "react-redux";

const ProductCounter = ({ itemCount, updateCart}) => {
  const dispatch = useDispatch();

  const increment = () => updateCart(itemCount + 1, '+');
  const decrement = () => updateCart(itemCount - 1, '-');

  return (
    <div className="flex-center blue-bg rounded">
      <div className="flex gap-4">
        <button
          onClick={decrement}
          className={`blue-bg text-[13px] font-bold text-white px-4 py-2 rounded-[100%]`}
        >
          -
        </button>
        <input
          type="number"
          value={itemCount}
          disabled
          className="xs:w-12 flex text-center text-white font-bold blue-bg"
        />
        <button
          onClick={increment}
          className="blue-bg text-[13px] font-bold text-white px-4 py-2 rounded-[100%]"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ProductCounter;
