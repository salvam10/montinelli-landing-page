import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const ProductsSummary = ({ title }) => {
  const { cartItemsCount, productsInCart } = useSelector((state) => state.cart);
  const { bsExchangeRate } = useSelector((state) => state.products);

  return (
    <div className="section-container">
      <div className="w-full flex flex-col ">
        <h3 className="font-bold">{title}</h3>
        <span className="xs:text-[12px] text-[#B3B3B3]">
          {cartItemsCount} productos
        </span>
      </div>
      <div className="w-full flex flex-col xs:overflow-auto">
        {productsInCart.map((product, index) => (
          <li className="flex justify-evenly" key={index}>
            <div className="xs:w-[20%] md:w-[10%]">
              <img src={product.media_url} alt={product.name} />
            </div>
            <div className="xs:w-[50%] md:w-[60%] flex-center  flex-col xs:text-[12px] md:text-[15px]">
              <p className="font-[600]">{product.name}</p>
              <p className="responsive-text">{product.description}</p>
            </div>
            <div className="xs:w-[15%] flex-center text-[13px]">
              {product.quantity}
            </div>
            <div className="xs:w-[15%] flex-center flex-col">
              <p className="text-[13px] text-[#0079bf] font-bold">
                $ {product.base_price}
              </p>
              <span className="responsive-text text-[#B3B3B3] font-bold">
                I.V.A ${(product.base_price * 0.16).toFixed(2)}
              </span>
            </div>
          </li>
        ))}
      </div>
    </div>
  );
};

export default ProductsSummary;
