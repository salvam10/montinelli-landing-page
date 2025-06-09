import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import CustomSelect from "../customSelect/CustomSelect";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import { getOrderById, updateOrder } from "../slices/ordersSlice";
import CustomTextInput from "../customTextInput/CustomTextInput";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

const AddInvoiceModal = ({
  setOpenModal,
  order,
  invoiceNumber,
  setInvoiceNumber,
}) => {
  const { isLoading } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  const handleCloseClick = () => {
    setOpenModal(false);
  };

  const updateInvoiceNumber = async () => {
    await dispatch(
      updateOrder({
        orderId: order.id,
        invoice_number: invoiceNumber,
        invoice_date: new Date(),
      })
    );
    dispatch(getOrderById({ orderId: order.id }));
    setOpenModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal gap-2">
        <div className="modal-header">
          <h3 className="text-[20px]">Agregar # de factura</h3>
        </div>
        <div className="modal-body flex gap-3 mb-4">
          <CustomTextInput
            value={order.invoiceNumber || invoiceNumber}
            setValue={setInvoiceNumber}
            type="text"
            width="w-full"
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
              isLoading={isLoading}
            />
            <CustomFormButton
              handleClickFunction={updateInvoiceNumber}
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

export default AddInvoiceModal;
