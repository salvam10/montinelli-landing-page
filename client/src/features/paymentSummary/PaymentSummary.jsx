import React, { useEffect } from "react";

const PaymentSummary = ({ order, orderProducts }) => {
  useEffect(() => {
    console.log("orderProducts", orderProducts);
  }, [orderProducts]);

  const calculateIVA = () => {
    let acumIVA = 0;
    orderProducts?.map((product) => {
      console.log("product", product);
      return (acumIVA += product.quantity * (product.base_price * product.tax_percentage) / 100);
    });
    return acumIVA.toFixed(2);
  };

  return (
    <div className="section-container">
      <div className="w-full flex">
        <h2 className="font-bold text-[14px]">Pago</h2>
      </div>

      <div className="w-full flex flex-col gap-5 border rounded-md py-2 px-5">
        <li className="flex items-baseline">
          <div className="billing-li-label">
            <span className="responsive-text">Subtotal</span>
          </div>
          <div className="billing-li-details">
            <span className="responsive-text ">
              {orderProducts?.reduce(
                (acc, product) => acc + (product.quantity || 0),
                0
              )}{" "}
              artículos
            </span>
            <span className="responsive-text">
              ${Number(order.subtotal).toFixed(2)}
            </span>
          </div>
        </li>
        <li className="flex items-baseline">
          <div className="billing-li-label">
            <span className="responsive-text">IVA</span>
          </div>
          <div className="billing-li-details justify-end">
            <span className="responsive-text">${calculateIVA()}</span>
          </div>
        </li>
        <li className="flex items-baseline">
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

        <li className="flex items-baseline">
          <div className="billing-li-label">
            <span className="responsive-text font-bold">Total</span>
          </div>
          <div className="billing-li-details justify-end">
            <span className="responsive-text font-bold">
              $
              {(
                Number(order.total || 0) +
                Number(order.shippingCost || 0) +
                Number(calculateIVA())
              ) // ajusta según tu lógica
                .toFixed(2)}
            </span>
          </div>
        </li>
      </div>
    </div>
  );
};

export default PaymentSummary;
