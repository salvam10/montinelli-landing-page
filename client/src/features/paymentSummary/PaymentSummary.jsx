import React, { useEffect } from "react";

const PaymentSummary = ({ order, orderProducts }) => {
  useEffect(() => {
    console.log("orderProducts", orderProducts);
  }, [orderProducts]);

  return (
    <div className="section-container">
      <div className="w-full flex">
        <h2 className="font-bold text-[14px]">Pago</h2>
      </div>

      <div className="w-full flex flex-col gap-5 border rounded-md py-2 px-5">
        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text">Subtotal</span>
          </div>
          <div className="billing-li-details">
            <span className="responsive-text ">
              {orderProducts?.length} artículos
            </span>
            <span className="responsive-text">
              ${Number(order.subtotal).toFixed(2)}
            </span>
          </div>
        </li>

        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text">Envío</span>
          </div>
          <div className="billing-li-details">
            <span className="responsive-text">Standard</span>
            <span className="responsive-text">
              ${Number(order.shippingCost).toFixed(2)}
            </span>
          </div>
        </li>

        <li className="flex ">
          <div className="billing-li-label">
            <span className="responsive-text font-bold">Total</span>
          </div>
          <div className="billing-li-details justify-end">
            <span className="responsive-text font-bold">
              ${Number(order.total).toFixed(2)}
            </span>
          </div>
        </li>
      </div>
    </div>
  );
};

export default PaymentSummary;
