import React from 'react'

const OrderBillingDetails = ({order}) => {
  return (
    <div className="section-container">
      <div className="xs:w-full flex ">
        <span className="bg-yellow-500 py-1 px-2 border rounded-md responsive-text">
          Pendiente de pago
        </span>
      </div>
      <div className="w-full flex flex-col gap-5">
        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text">Subtotal</span>
          </div>
          <div className="billing-li-details">
            <span className="responsive-text ">3 articulos</span>
            <span className="responsive-text ">{order.subtotal} $</span>
          </div>
        </li>
        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text ">Envío</span>
          </div>
          <div className="billing-li-details">
            <span className="responsive-text ">Standard</span>
            <span className="responsive-text ">{order.shipping_cost}$</span>
          </div>
        </li>
        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text font-bold">Total</span>
          </div>
          <div className="billing-li-details justify-end">
            <span className="responsive-text font-bold">{order.total} $</span>
          </div>
        </li>
      </div>
      <div className="w-full flex justify-end">
        <button className="text-[12px] py-[6px] px-[12px] blue-bg text-white border rounded-md font-bold hover:bg-[#70b500]">
          Marcar como pagado
        </button>
      </div>
    </div>
  );
}

export default OrderBillingDetails
