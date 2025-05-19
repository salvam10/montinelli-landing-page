import React, { useState, useEffect } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ScheduleDispatchModal from "../modals/ScheduleDispatchModal";
import DispatchDropdown from "../dispatchDropdown/DispatchDropdown";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const OrderProductsDetails = ({ orderProducts, order }) => {
  const [openModal, setOpenModal] = useState(false);
  const [shippingStatus, setShippingStatus] = useState(order.shipping_status);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [pillBg, setPillBg] = useState();

  useEffect(() => {
    setShippingStatus(order.shipping_status);
  }, [order]);

  useEffect(() => {
    switch (order.shipping_status) {
      case "Despacho agendado":
        setPillBg("bg-[rgba(242,214,0,0.5)]");
        break;
      case "Sin despacho asignado":
        setPillBg("bg-[#EBEBEB]");
        break;
      case "Rechazado por cliente":
        setPillBg("bg-[rgba(235,90,70,0.5)]");
        break;
      case "Despachado":
        setPillBg("bg-[rgba(112,181,0,0.5)]");
        break;
      default:
        break;
    }
  }, [shippingStatus]);

  const handleOnClick = () => {
    setOpenModal(true);
    setOpenDropdown(false);
  };

  return (
    <div className="w-full flex-center flex-col gap-1 bg-white p-5">
      <div className="w-full relative flex flex-between">
        <div className={`${pillBg} rounded-lg py-[1px] px-2`}>
          <span className="responsive-text">{shippingStatus}</span>
        </div>
        <div className="border-transparent rounded-full px-[4px] hover:bg-[#EBEBEB]">
          <div className="text-[10px] cursor-pointer">
            <span
              onClick={() => {
                setOpenDropdown(!openDropdown);
              }}
            >
              <MoreHorizIcon style={{ color: "#000000" }} />
            </span>
            {openDropdown && (
              <DispatchDropdown
                setOpenDropdown={setOpenDropdown}
                order={order}
              />
            )}
          </div>
        </div>
      </div>

      {order?.scheduled_dispatch_date && (
        <div className="w-full border rounded-md py-2 px-5">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="responsive-text font-bold">
                Fecha Pautada de despacho:
              </span>
              <span className="responsive-text">
                {format(
                  new Date(order.scheduled_dispatch_date),
                  "dd 'de' MMMM 'de' yyyy",
                  {
                    locale: es,
                  }
                )}
              </span>
            </div>
            {order?.actual_dispatch_date && (
              <div className="flex flex-col">
                <span className="responsive-text font-bold">
                  Fecha de Recepción:
                </span>
                <span className="responsive-text">
                  {format(
                    new Date(order.actual_dispatch_date),
                    "dd 'de' MMMM 'de' yyyy",
                    {
                      locale: es,
                    }
                  )}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="responsive-text font-bold">
                Empresa de Transporte:
              </span>
              <span className="responsive-text">{order.shipping_company}</span>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-md py-2 px-5">
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
      </div>
      <div className="w-full flex justify-end">
        {order.shipping_status !== "Despacho agendado" && (
          <div className="flex">
            <button
              className="w-full border rounded-lg blue-bg text-white  undefined flex items-center justify-center gap-2 xs:text-[12px] xs:p-[6px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:font-"
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
