import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import CustomSelect from "../customSelect/CustomSelect";
import { shippingCompanies } from "../../dummy";
import { updateOrder, getOrderById } from "../slices/ordersSlice";

const ScheduleDispatchModal = ({ order, setOpenModal }) => {
  const { isLoading } = useSelector((state) => state.orders);
  const [shippingCompany, setShippingCompany] = useState(shippingCompanies[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedDate(new Date());
  }, [order]);

  const handleCloseClick = () => setOpenModal(false);

  const handleSubmitClick = async () => {
    await dispatch(
      updateOrder({
        orderId: order.id,
        scheduled_dispatch_date: selectedDate,
        shipping_company: shippingCompany.value,
        shipping_status: "Despacho agendado",
      })
    );
    dispatch(getOrderById({ orderId: order.id }));
    setOpenModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-xl w-[380px] p-5">
        {/* Cerrar */}
        <button
          onClick={handleCloseClick}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <CloseIcon fontSize="small" />
        </button>

        {/* Título */}
        <h2 className="text-center text-[18px] font-semibold text-gray-800 mb-5">
          Programar despacho del pedido
        </h2>

        {/* Campos */}
        <div className="flex flex-col gap-3">
          <div>
            <CustomDatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              label="📅 Fecha de despacho"
              width="w-full"
              inputClassName="!w-full !text-sm !pr-10"
            />
          </div>

          <div>
            <CustomSelect
              width="w-full"
              options={shippingCompanies}
              label="🚚 Empresa de transporte"
              value={shippingCompany}
              isObjectValue={true}
              setValue={setShippingCompany}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleCloseClick}
            className="px-4 py-1.5 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmitClick}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-md text-sm font-medium text-white transition ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDispatchModal;
