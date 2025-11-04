import React, { useState } from "react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ScheduleDispatchModal from "../modals/ScheduleDispatchModal";
import DispatchDropdown from "../dispatchDropdown/DispatchDropdown";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const OrderDispatchDetails = ({ order }) => {
  const [openModal, setOpenModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const dispatchStatus = order?.shipping_status || "Sin despacho asignado";
  const hasScheduledDispatch = Boolean(order?.scheduled_dispatch_date);

  const formattedDate = (d) =>
    d ? format(new Date(d), "d 'de' MMMM 'de' yyyy", { locale: es }) : "-";

  return (
    <div className="border-t pt-5 mt-3 space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Despacho</h3>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <EventAvailableOutlinedIcon
            fontSize="small"
            className="text-gray-500"
          />
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">Fecha pautada</span>
            <span className="font-medium text-gray-900">
              {formattedDate(order?.scheduled_dispatch_date)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <LocalShippingOutlinedIcon
            fontSize="small"
            className="text-gray-500"
          />
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{dispatchStatus}</span>
            <span className="font-medium text-gray-900">
              {formattedDate(order?.actual_dispatch_date)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        {!hasScheduledDispatch && (
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-all duration-150"
          >
            <EventAvailableOutlinedIcon fontSize="small" />
            Programar Despacho
          </button>
        )}

        {/* Botón con posición relativa */}
        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => setOpenDropdown((v) => !v)}
            title="Opciones de despacho"
          >
            <MoreHorizIcon style={{ color: "#000000" }} />
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 z-10">
              <DispatchDropdown
                setOpenDropdown={setOpenDropdown}
                order={order}
              />
            </div>
          )}

          {/* Modal posicionado relativo al ícono */}
          {openModal && (
            <div
              className="absolute z-20 top-100 left-100 bg-red-500"
            >
              <ScheduleDispatchModal
                order={order}
                setOpenModal={setOpenModal}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDispatchDetails;
