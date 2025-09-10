import React, { useState, useMemo } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ScheduleDispatchModal from "../modals/ScheduleDispatchModal";
import DispatchDropdown from "../dispatchDropdown/DispatchDropdown";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const OrderProductsDetails = ({ orderProducts, order }) => {
  const [openModal, setOpenModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  // Texto de la pastilla: "Despachado el <fecha>" si aplica, si no el estado tal cual
  const shippingBadgeText = useMemo(() => {
    const status = order?.shipping_status || "";
    if (status === "Despachado" && order?.actual_dispatch_date) {
      const human = format(
        new Date(order.actual_dispatch_date),
        "d 'de' MMM yyyy",
        { locale: es }
      );
      return `Despachado el ${human}`;
    }
    return status;
  }, [order?.shipping_status, order?.actual_dispatch_date]);

  // Color de la pastilla según estado
  const pillBg = useMemo(() => {
    switch (order?.shipping_status) {
      case "Despacho agendado":
        return "bg-[rgba(242,214,0,0.5)]";
      case "Sin despacho asignado":
        return "bg-[#EBEBEB]";
      case "Rechazado por cliente":
        return "bg-[rgba(235,90,70,0.5)]";
      case "Despachado":
        return "bg-[rgba(112,181,0,0.5)]";
      default:
        return "bg-[#EBEBEB]";
    }
  }, [order?.shipping_status]);

  const handleOnClick = () => {
    setOpenModal(true);
    setOpenDropdown(false);
  };

  return (
    <div className="w-full flex-center flex-col gap-1 bg-white p-5">
      <div className="w-full relative flex flex-between">
        <div className={`${pillBg} rounded-lg py-[1px] px-2`}>
          <span className="responsive-text">{shippingBadgeText}</span>
        </div>

        <div className="border-transparent rounded-full px-[4px] hover:bg-[#EBEBEB]">
          <button
            type="button"
            className="text-[10px] cursor-pointer p-1 rounded-full"
            aria-haspopup="menu"
            aria-expanded={openDropdown}
            onClick={() => setOpenDropdown((v) => !v)}
            title="Opciones de despacho"
          >
            <MoreHorizIcon style={{ color: "#000000" }} />
          </button>

          {openDropdown && (
            <DispatchDropdown setOpenDropdown={setOpenDropdown} order={order} />
          )}
        </div>
      </div>

      {order?.scheduled_dispatch_date && (
        <div className="w-full border rounded-md py-2 px-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="responsive-text font-bold">
                Fecha pautada de despacho:
              </span>
              <span className="responsive-text">
                {format(
                  new Date(order.scheduled_dispatch_date),
                  "dd 'de' MMMM 'de' yyyy",
                  { locale: es }
                )}
              </span>
            </div>

            {order?.actual_dispatch_date && (
              <div className="flex flex-col">
                <span className="responsive-text font-bold">
                  Fecha de recepción:
                </span>
                <span className="responsive-text">
                  {format(
                    new Date(order.actual_dispatch_date),
                    "dd 'de' MMMM 'de' yyyy",
                    { locale: es }
                  )}
                </span>
              </div>
            )}

            <div className="flex flex-col">
              <span className="responsive-text font-bold">
                Empresa de transporte:
              </span>
              <span className="responsive-text">
                {order?.shipping_company || "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-md py-2 px-2">
        {orderProducts?.map((product) => (
          <div
            className="flex justify-evenly items-center gap-2 overflow-x-auto"
            key={product.id ?? product.media_url} // usa un id si lo tienes
          >
            {/* imagen */}
            <div className="xs:w-[15%] md:w-[10%]">
              <img src={product.media_url} alt={product.name} />
            </div>

            {/* nombre */}
            <div className="xs:w-[50%] md:w-[60%] flex flex-col xs:text-[12px] md:text-[15px]">
              <p>{product.name}</p>
              <p className="responsive-text">{product.description}</p>
            </div>

            {/* cantidad */}
            <div className="xs:w-[20%] flex-center text-[13px]">
              ${product.order_price} x {product.quantity}
            </div>

            {/* precio */}
            <div className="xs:w-[15%] flex-center">
              <p className="text-[13px] text-[#0079bf] font-bold">
                ${(product.order_price * product.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-end">
        {order?.shipping_status !== "Despacho agendado" && (
          <div className="flex">
            <button
              className="w-full border rounded-lg blue-bg text-white flex items-center justify-center gap-2 xs:text-[12px] xs:p-[6px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handleOnClick}
            >
              Programar Despacho
            </button>
          </div>
        )}
      </div>

      {openModal && (
        <ScheduleDispatchModal order={order} setOpenModal={setOpenModal} />
      )}
    </div>
  );
};

export default OrderProductsDetails;
