import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

import CustomFormButton from "../customFormButton/CustomFormButton";
import PaymentTermsModal from "../modals/PaymentTermsModal";
import Pill from "../pill/Pill";

import PaymentTermsMenu from "./PaymentTermsMenu";
import PayDatePopover from "./PayDatePopover";

import { fmtMoney, sumQty } from "../../helpers/money";
import { usePaymentInfo } from "../../hooks/usePaymentInfo";
import { usePaymentActions } from "../../hooks/usePaymentActions";
import { changePillBgColor } from "../../helpers/changePillColor";

const OrderBillingDetails = ({ orderProducts, orderClient, order }) => {
  const [showPaymentTermsModal, setShowPaymentTermsModal] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState("Pendiente");
  const { msg, overdue } = usePaymentInfo(order);

  const { isLoading, markAsPending, markAsPaid, registerDebtCheck } =
    usePaymentActions(order);
  const [showPayPicker, setShowPayPicker] = useState(false);
  const [payDate, setPayDate] = useState(() => new Date());

  const [pillBg, setPillBg] = useState("");

  useEffect(() => {
    setPaymentStatus(order?.payment_status);
  }, [order]);

  useEffect(() => {
    changePillBgColor(setPillBg, paymentStatus);
  }, [paymentStatus]);

  const handleMarkButtonClick = () => {
    if (paymentStatus !== "Pagado") {
      setPayDate(new Date());
      setShowPayPicker(true);
      return;
    }
    markAsPending();
  };

  const handleRegisterDebtCheck = () => { 
    registerDebtCheck(new Date());
  }

  const confirmMarkAsPaid = async () => {
    await markAsPaid(payDate);
    setShowPayPicker(false);
  };

  return (
    <div className="w-full flex-center flex-col gap-1 bg-white p-5 relative">
      {order?.invoice_number && (
        <div className="w-full relative flex flex-between">
          <Pill
            setBgColor={changePillBgColor}
            prefix="Pedido"
            status={paymentStatus}
          />
          <PaymentTermsMenu onEdit={() => setShowPaymentTermsModal(true)} />
        </div>
      )}

      {/* Detalles */}
      <div className="w-full flex flex-col gap-5 border rounded-md py-2 px-5">
        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text">Subtotal</span>
          </div>
          <div className="billing-li-details">
            <span className="responsive-text ">
              {sumQty(orderProducts)} artículos
            </span>
            <span className="responsive-text ">
              ${fmtMoney(order?.subtotal)}
            </span>
          </div>
        </li>

        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text ">Envío</span>
          </div>
          <div className="billing-li-details">
            <span className="responsive-text ">Standard</span>
            <span className="responsive-text ">
              ${fmtMoney(order?.shippingCost)}
            </span>
          </div>
        </li>

        <li className="flex border-b">
          <div className="billing-li-label">
            <span className="responsive-text font-bold">Total</span>
          </div>
          <div className="billing-li-details justify-end">
            <span className="responsive-text font-bold">
              ${fmtMoney(order?.total)}
            </span>
          </div>
        </li>

        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text">Pagado</span>
          </div>
          <div className="billing-li-details justify-end">
            <span className="responsive-text">
              ${fmtMoney(order?.total /* o order.paid_amount */)}
            </span>
          </div>
        </li>

        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text">Saldo</span>
          </div>
          <div className="billing-li-details">
            <span
              className={`responsive-text max-w-60 ${
                overdue ? " text-red-500 font-bold px-2 py-0.5 rounded" : ""
              }`}
            >
              {msg}
            </span>
            <span className="responsive-text">
              $
              {fmtMoney(
                paymentStatus === "Pagado"
                  ? 0
                  : order?.total /* o order.balance */
              )}
            </span>
          </div>
        </li>
      </div>

      {/* Botón + popover de fecha de pago */}
      {order?.invoice_number && (
        <div className="w-full flex justify-end relative">
          <div className="w-[50%] flex">
            <CustomFormButton
              isLoading={isLoading}
              text="Registrar Revisión"
              handleClickFunction={handleRegisterDebtCheck} /
            >
            <CustomFormButton
              isLoading={isLoading}
              text={
                paymentStatus === "Pagado"
                  ? "Marcar como pendiente"
                  : "Marcar como pagado"
              }
              handleClickFunction={handleMarkButtonClick}
            />
          </div>

          {showPayPicker && (
            <PayDatePopover
              date={payDate}
              onChange={setPayDate}
              onAssign={confirmMarkAsPaid}
              onCancel={() => setShowPayPicker(false)}
              title="Selecciona la fecha de pago"
            />
          )}
        </div>
      )}

      {showPaymentTermsModal && (
        <PaymentTermsModal
          setOpenModal={setShowPaymentTermsModal}
          order={order}
          orderClient={orderClient}
        />
      )}
    </div>
  );
};

OrderBillingDetails.propTypes = {
  orderProducts: PropTypes.array,
  order: PropTypes.object,
};

export default OrderBillingDetails;
