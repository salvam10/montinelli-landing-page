import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import CustomSelect from "../customSelect/CustomSelect";
import CloseIcon from "@mui/icons-material/Close";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { shippingCompanies } from "../../dummy";
import { updateOrder, getOrderById } from "../slices/ordersSlice";

const ScheduleDispatchModal = ({ order, setOpenModal }) => {
  const [shippingCompany, setShippingCompany] = useState(shippingCompanies[0]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedDate(new Date());
  }, [order]);

  const handleCloseClick = () => {
    setOpenModal(false);
  };

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
    <div className="modal-overlay">
      <div className="modal gap-2">
        <div className="modal-header">
          <h3 className="text-[20px]">Programar despacho del pedido</h3>
        </div>
        <div className="modal-body flex gap-3">
          <CustomDatePicker
            selectedDate={selectedDate}
            onChange={setSelectedDate}
            label="Fecha de despacho"
          />
          <CustomSelect
            width="w-full"
            options={shippingCompanies}
            label="Empresa de Transporte"
            value={shippingCompany}
            isObjectValue={true}
            setValue={setShippingCompany}
          />
          <button className="modal-close-button" onClick={handleCloseClick}>
            <CloseIcon />
          </button>
        </div>
        <div className="w-full flex-end">
          <div className="w-[50%] mt-2 flex-end gap-2">
            <CustomFormButton
              handleClickFunction={handleCloseClick}
              text="Cancelar"
              color="bg-white-500"
              textColor="text-[#000000]"
              fontBold={true}
            />
            <CustomFormButton
              handleClickFunction={handleSubmitClick}
              text="Guardar"
              color="bg-blue-500"
              textColor="text-white"
              fontBold={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDispatchModal;
