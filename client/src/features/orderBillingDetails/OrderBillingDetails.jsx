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

const OrderBillingDetails = ({
  orderProducts,
  orderClient,
  order,
  orderBalance,
}) => {
  const [showPaymentTermsModal, setShowPaymentTermsModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Pendiente");
  const { msg, overdue } = usePaymentInfo(order);
  const { isLoading, markAsPending, markAsPaid, registerDebtCheck } =
    usePaymentActions(order);
  const [showPayPicker, setShowPayPicker] = useState(false);
  const [payDate, setPayDate] = useState(() => new Date());

  useEffect(() => {
    setPaymentStatus(order?.payment_status);
  }, [order]);

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
  };

  const confirmMarkAsPaid = async () => {
    await markAsPaid(payDate);
    setShowPayPicker(false);
  };

  // Cálculo auxiliar de días de vencimiento
  const dueDate = order?.due_date ? new Date(order.due_date) : null;
  const daysLeft = dueDate
    ? Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-4">
      {/* Encabezado */}
      <div className="w-full flex justify-between items-center">
        <Pill
          setBgColor={changePillBgColor}
          prefix="Pedido"
          status={paymentStatus}
        />
        <PaymentTermsMenu onEdit={() => setShowPaymentTermsModal(true)} />
      </div>

      {/* Contenedor de resumen y pagos */}
      <div className="w-full border rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-base">
          Resumen y pagos
        </h3>

        <div className="grid grid-cols-2 gap-6 text-sm text-gray-700">
          {/* Columna izquierda */}
          <ul className="flex flex-col gap-3">
            <li className="flex justify-between border-b pb-2">
              <div>
                <div className="text-gray-700">Subtotal</div>
                <div className="text-xs text-gray-500">
                  {sumQty(orderProducts)} artículos
                </div>
              </div>
              <div className="text-gray-800">${fmtMoney(order?.subtotal)}</div>
            </li>

            <li className="flex justify-between border-b pb-2">
              <div>
                <div className="text-gray-700">Envío</div>
                <div className="text-xs text-gray-500">Standard</div>
              </div>
              <div className="text-gray-800">
                ${fmtMoney(order?.shippingCost)}
              </div>
            </li>

            <li className="flex justify-between pt-1">
              <div className="font-semibold text-gray-900">Total</div>
              <div className="font-semibold text-gray-900">
                ${fmtMoney(order?.total)}
              </div>
            </li>
          </ul>

          {/* Columna derecha */}
          {/* <ul className="flex flex-col gap-3">
            <li className="flex justify-between">
              <div className="text-gray-700">Pagado</div>
              <div className="text-gray-800">
                ${fmtMoney(orderBalance?.allocated)}
              </div>
            </li>

            <li className="flex justify-between">
              <div
                className={`text-gray-700 ${
                  overdue ? "text-red-600 font-semibold" : ""
                }`}
              >
                Saldo
              </div>
              <div className="text-gray-800">
                $
                {fmtMoney(
                  paymentStatus === "Pagado" ? 0 : orderBalance?.balance
                )}
              </div>
            </li>
          </ul> */}
        </div>

        {/* Fecha de vencimiento */}
        {dueDate && (
          <div className="text-right text-sm text-gray-500 mt-4">
            {daysLeft > 0
              ? `Vence en ${daysLeft} días (${dueDate.toLocaleDateString(
                  "es-VE"
                )})`
              : `Venció el ${dueDate.toLocaleDateString("es-VE")}`}
          </div>
        )}
      </div>

      {/* Botones inferiores */}
      {order?.invoice_number && (
        <div className="w-full flex justify-between gap-3">
          {/* Botón de registrar revisión */}
          <CustomFormButton
            isLoading={isLoading}
            text="Registrar Revisión"
            handleClickFunction={handleRegisterDebtCheck}
            className="w-full"
          />

          {/* Contenedor relativo para el botón de pago + popover */}
          <div className="relative w-full flex justify-end">
            <CustomFormButton
              isLoading={isLoading}
              text={
                paymentStatus === "Pagado"
                  ? "Marcar como pendiente"
                  : "Marcar como pagado"
              }
              handleClickFunction={handleMarkButtonClick}
              className="w-full"
            />

            {/* Popover de fecha de pago (aparece justo encima del botón) */}
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
        </div>
      )}

      {/* Modal de condiciones de pago */}
      {showPaymentTermsModal && (
        <PaymentTermsModal
          setOpenModal={setShowPaymentTermsModal}
          order={order}
          orderClient={orderClient}
          onSave={() => setShowPaymentTermsModal(false)}
        />
      )}
    </div>
  );
};

OrderBillingDetails.propTypes = {
  orderProducts: PropTypes.array,
  order: PropTypes.object,
  orderClient: PropTypes.object,
  orderBalance: PropTypes.object,
};

export default OrderBillingDetails;
