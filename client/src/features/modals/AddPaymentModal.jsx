import React, { useState } from "react";
import { useDispatch } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import CustomTextInput from "../customTextInput/CustomTextInput";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import CustomFormButton from "../customFormButton/CustomFormButton";
import { registerClientPayment } from "../slices/paymentsSlice";

const AddPaymentModal = ({ setShowAddPayment, title, client }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [amount, setAmount] = useState(null);
  const dispatch = useDispatch();
  const handleCloseClick = () => {
    setShowAddPayment(false);
  };

  const handleAddClientPayment = async () => {
    await dispatch(
      registerClientPayment({
        client_id: client.id,
        amount: parseFloat(amount).toFixed(2),
        paid_at: selectedDate,
        created_at: new Date(),
        status: "posted",
        currency_code: "USD",
      })
    );
    setShowAddPayment(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="text-[20px]">{title}</h3>
          <button className="modal-close-button" onClick={handleCloseClick}>
            <CloseIcon />
          </button>
        </div>

        <div className=" flex gap-3 mb-4">
          <CustomTextInput
            value={amount}
            setValue={setAmount}
            type="number"
            placeholder="100.00"
            width="w-full"
          />
          <CustomDatePicker
            label="Fecha de Pago"
            selectedDate={selectedDate}
            onChange={setSelectedDate}
            width="w-full"
          />
        </div>
        <CustomFormButton
          handleClickFunction={handleAddClientPayment}
          text="Registrar"
          color="bg-blue-500"
          textColor="text-white"
          fontBold={true}
        />
      </div>
    </div>
  );
};

export default AddPaymentModal;
