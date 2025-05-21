import React, { useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import ProductCounter from "../productCounter/ProductCounter";
import { addProductToCart } from "../slices/cartSlice";
import { AuthContext } from "../../App";

const Product = ({ product }) => {
  const { user } = useContext(AuthContext);
  const { bsExchangeRate } = useSelector((state) => state.products);
  const cartItemsCount = useSelector((state) => state.cart.cartItemsCount);
  const dispatch = useDispatch();
  const [itemCount, setItemCount] = useState(0);

  const updateCart = (count, operator) => {
    setItemCount(count);
    dispatch(
      addProductToCart({
        user_id: user.id,
        product: product,
        quantity: count,
      })
    );
  };

  const handleOnClick = () => updateCart(itemCount + 1, "+");

  return (
    <div className="xs:w-[40%] flex-start flex-col gap-5 bg-white border rounded border-color p-[10px]">
      <div className="">
        <img src={product.media_url} alt={product.name} />
      </div>
      <div className="">
        <p className="xs:text-[13px] md:text-[18px] font-bold">
          {product.name}
        </p>
      </div>
      <div className="flex flex-col">
        <span className="text-[16px] text-[#0079bf] font-bold">
          Precio Caja = {`$${product.base_price}`}
        </span>
        {product.tax_percentage && (
          <span className="responsive-text text-[#B3B3B3] font-bold">
            Precio Caja + IVA ={" "}
            {`$${((product.base_price * product.tax_percentage) / 100).toFixed(
              2
            )}`}
          </span>
        )}
        <span className="responsive-text text-[#B3B3B3] font-bold">
          Precio Unidad ={" "}
          {`$${(product.base_price / product.quantity).toFixed(2)}`}
        </span>
        {product.tax_percentage && (
          <span className="responsive-text text-[#B3B3B3] font-bold">
            Precio Unidad + IVA ={" "}
            {`$${(
              (product.base_price / product.quantity) *
              (product.tax_percentage && product.tax_percentage / 100)
            ).toFixed(2)}`}
          </span>
        )}
      </div>
      <div className="w-full">
        {itemCount === 0 ? (
          <button
            className="w-full px-4 py-2 blue-bg rounded text-white xs:text-[13px] md:text-[14px]"
            onClick={handleOnClick}
          >
            Agregar
          </button>
        ) : (
          <ProductCounter
            cartItemsCount={cartItemsCount}
            product={product}
            itemCount={itemCount}
            updateCart={updateCart}
          />
        )}
      </div>
    </div>
  );
};

export default Product;
