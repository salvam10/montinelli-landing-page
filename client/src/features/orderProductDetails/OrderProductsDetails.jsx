import React from "react";

const OrderProductsDetails = ({ orderProducts }) => {
  return (

    <div className="section-container">
      {/* Pendiente de envio */}
      <div className="xs:w-full flex ">
        <span className="bg-yellow-500 py-1 px-2 border rounded-md responsive-text">
          Pendiente de Envío
        </span>
      </div>
      {orderProducts?.map((product, index) => (
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
      ))}
      {/* Botón - Marcar como enviado  */}
      <div className="w-full flex justify-end">
        <button className="text-[12px] py-[6px] px-[12px] blue-bg text-white border rounded-md font-bold hover:bg-[#70b500]">
          Marcar como enviado
        </button>
      </div>
    </div>
  );
};

export default OrderProductsDetails;
