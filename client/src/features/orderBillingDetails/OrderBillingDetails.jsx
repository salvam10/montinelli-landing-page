import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CustomFormButton from "../customFormButton/CustomFormButton";
import { updateOrder, getOrderById } from "../slices/ordersSlice";
import PaymentTermsModal from "../modals/PaymentTermsModal";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";

const fmtMoney = (v) => (isNaN(Number(v)) ? "0.00" : Number(v).toFixed(2));
const sumQty = (items) =>
  items?.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0) ?? 0;

const OrderBillingDetails = ({ orderProducts, order }) => {
  const { isLoading } = useSelector((state) => state.orders);
  const [showPaymentTermsModal, setShowPaymentTermsModal] = useState(false);
  const [editPaymentTerms, setEditPaymentTerms] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState("Pendiente");
  const [paymentTermMsg, setPaymentTermMsg] = useState("");
  const [isOverdue, setIsOverdue] = useState(false);

  const dispatch = useDispatch();

  // Cálculos derivados, puros y memoizados
  const derived = useMemo(() => {
    if (!order) {
      return { msg: "", overdue: false };
    }

    const status = order.payment_status;
    const dispatchDateStr = order.actual_dispatch_date;
    const termDays = Number(order.payment_term_days) || 0;

    // Sin entrega registrada
    if (!dispatchDateStr) {
      return {
        msg: "Aún no se ha registrado la entrega. No corren días de crédito.",
        overdue: false,
      };
    }

    // Contado
    if (termDays === 0) {
      return { msg: "El pago debe realizarse de contado.", overdue: false };
    }

    const dispatchDate = new Date(dispatchDateStr);
    if (isNaN(dispatchDate.getTime())) {
      return { msg: "Fecha de entrega inválida.", overdue: false };
    }

    const dueDate = addDays(dispatchDate, termDays);
    const today = new Date();
    const formattedDue = format(dueDate, "dd 'de' MMMM 'de' yyyy", {
      locale: es,
    });

    const diff = differenceInCalendarDays(dueDate, today); // >0 faltan, 0 hoy, <0 vencida

    if (diff > 0) {
      return {
        msg: `Vence en ${diff} día${diff === 1 ? "" : "s"} (${formattedDue})`,
        overdue: false,
      };
    }
    if (diff === 0) {
      return { msg: `Vence hoy (${formattedDue})`, overdue: false };
    }
    const overdue = Math.abs(diff);
    return {
      msg: `Venció el ${formattedDue} (tiene ${overdue} día${
        overdue === 1 ? "" : "s"
      } vencida)`,
      overdue: true,
    };
  }, [order]);

  // Sincroniza estados de UI basados en derivados
  useEffect(() => {
    if (!order) return;
    setPaymentStatus(order.payment_status);
    setPaymentTermMsg(derived.msg);
    setIsOverdue(derived.overdue);
  }, [order, derived]);

  const handleMarkAsPaid = async () => {
    const goingTo = paymentStatus === "Pagado" ? 1 : 2; // 1=Pendiente, 2=Pagado
    await dispatch(
      updateOrder({ orderId: order.id, payment_status_id: goingTo })
    );
    dispatch(getOrderById({ orderId: order.id }));
  };

  return (
    <div className="w-full flex-center flex-col gap-1 bg-white p-5">
      {order?.invoice_number && (
        <div className="w-full relative flex flex-between">
          <div className="bg-[rgba(255,159,26,0.5)] rounded-lg py-[1px] px-2">
            <span className="responsive-text">{paymentStatus}</span>
          </div>

          <div className="border-transparent rounded-full px-[4px] hover:bg-[#EBEBEB]">
            <span
              className="text-[10px] cursor-pointer"
              onClick={() => setEditPaymentTerms(!editPaymentTerms)}
            >
              <MoreHorizIcon style={{ color: "#000000" }} />
            </span>
          </div>

          {editPaymentTerms && (
            <div className="absolute bg-white border rounded-md top-6 right-1">
              <button
                className="py-[4px] px-[4px] shadow-lg"
                onClick={() => {
                  setShowPaymentTermsModal(true);
                  setEditPaymentTerms(false);
                }}
              >
                <span className="responsive-text rounded-lg">
                  Editar condiciones de pago
                </span>
              </button>
            </div>
          )}
        </div>
      )}

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
              className={`responsive-text ${
                isOverdue
                  ? "bg-[rgba(235,90,70,0.5)] text-red-800 font-semibold px-2 py-0.5 rounded"
                  : ""
              }`}
            >
              {paymentTermMsg}
            </span>
            <span className="responsive-text">
              ${fmtMoney(order?.total /* o order.balance */)}
            </span>
          </div>
        </li>
      </div>

      {order?.invoice_number && (
        <div className="w-full flex justify-end">
          <div className="flex">
            <CustomFormButton
              isLoading={isLoading}
              text={
                paymentStatus === "Pagado"
                  ? "Marcar como pendiente"
                  : "Marcar como pagado"
              }
              handleClickFunction={handleMarkAsPaid}
            />
          </div>
        </div>
      )}

      {showPaymentTermsModal && (
        <PaymentTermsModal
          setOpenModal={setShowPaymentTermsModal}
          order={order}
        />
      )}
    </div>
  );
};

export default OrderBillingDetails;
