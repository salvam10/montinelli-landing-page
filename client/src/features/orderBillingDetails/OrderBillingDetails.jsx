import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import CustomFormButton from "../customFormButton/CustomFormButton";
import { updateOrder, getOrderById } from "../slices/ordersSlice";
import PaymentTermsModal from "../modals/PaymentTermsModal";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

const OrderBillingDetails = ({ orderProducts, order }) => {
  const [showPaymentTermsModal, setShowPaymentTermsModal] = useState(false);
  const [paymentTermMsg, setPaymentTermMsg] = useState("");
  const [editPaymentTerms, setEditPaymentTerms] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Pendiente");
  const dispatch = useDispatch();

  useEffect(() => {
    if (!order?.created_at) return;

    const calculatedDueDate = addDays(
      new Date(order.created_at),
      Number(order.payment_term_days)
    );

    setPaymentStatus(order.payment_status);

    if (order.payment_term_days !== 0) {
      setPaymentTermMsg(
        `Vence el ${format(calculatedDueDate, "dd 'de' MMMM 'de' yyyy", {
          locale: es,
        })}`
      );
    } else {
      setPaymentTermMsg(`El pago debe realizarse de contado`);
    }
  }, [order]);

  const handleMarkAsPaid = async () => {
    if (paymentStatus === "Pagado") {
      await dispatch(updateOrder({ orderId: order.id, payment_status_id: 1 }));
    } else {
      await dispatch(updateOrder({ orderId: order.id, payment_status_id: 2 }));
    }
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
              onClick={() => {
                setEditPaymentTerms(!editPaymentTerms);
              }}
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
              {orderProducts?.reduce(
                (acc, product) => acc + (product.quantity || 0),
                0
              )}{" "}
              articulos
            </span>
            <span className="responsive-text ">
              $
              {isNaN(Number(order.subtotal))
                ? "0.00"
                : Number(order.subtotal).toFixed(2)}
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
              $
              {isNaN(Number(order.shippingCost))
                ? "0.00"
                : Number(order.shippingCost).toFixed(2)}
            </span>
          </div>
        </li>
        <li className="flex border-b">
          <div className="billing-li-label">
            <span className="responsive-text font-bold">Total</span>
          </div>
          <div className="billing-li-details justify-end">
            <span className="responsive-text font-bold">
              $
              {isNaN(Number(order.total))
                ? "0.00"
                : Number(order.total).toFixed(2)}
            </span>
          </div>
        </li>
        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text">Pagado</span>
          </div>
          <div className="billing-li-details justify-end">
            <span className="responsive-text">
              $
              {isNaN(Number(order.total))
                ? "0.00"
                : Number(order.total).toFixed(2)}
            </span>
          </div>
        </li>
        <li className="flex">
          <div className="billing-li-label">
            <span className="responsive-text">Saldo</span>
          </div>
          <div className="billing-li-details">
            <span className="responsive-text">{paymentTermMsg}</span>
            <span className="responsive-text">
              $
              {isNaN(Number(order.total))
                ? "0.00"
                : Number(order.total).toFixed(2)}
            </span>
          </div>
        </li>
      </div>
      {order?.invoice_number && (
        <div className="w-full flex justify-end">
          <div className="flex">
            <CustomFormButton
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
