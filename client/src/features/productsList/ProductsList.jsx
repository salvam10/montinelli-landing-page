import React from "react";

const ProductsList = ({ orderProducts }) => {
  return orderProducts?.map((product, index) => (
    /* product details container*/
    <div className="flex justify-evenly" key={index}>
      {/* imagen */}
      <div className="xs:w-[15%] md:w-[10%]">
        <img src={product.media_url} alt={product.name} />
      </div>
      {/* nombre */}
      <div className="xs:w-[50%] md:w-[60%] flex-center xs:text-[12px] md:text-[15px]">
        <p>{product.name}</p>
      </div>
      {/* cantidad */}
      <div className="xs:w-[15%] flex-center text-[13px]">
        ${product.base_price} x {product.quantity}
      </div>
      {/* precio */}
      <div className="xs:w-[15%]  flex-center">
        <p className="text-[13px] text-[#0079bf] font-bold">
          ${(product.base_price * product.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  ));
};
export default ProductsList;
