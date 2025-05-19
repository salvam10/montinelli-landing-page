import React, { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import CustomSelect from "../customSelect/CustomSelect";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import { getOrderById, updateOrder } from "../slices/ordersSlice";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";

const PaymentTermsModal = ({ setOpenModal, order }) => {
  const [selectedDate, setSelectedDate] = useState(order.created_at);
  const [options, setOptions] = useState([]);
  const [dueDate, setDueDate] = useState();
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState({
    id: 1,
    days: 7,
  });

  const { paymentTerms } = useSelector((state) => state.paymentTerms);
  const dispatch = useDispatch();

  useEffect(() => {
    if (paymentTerms) {
      const options = paymentTerms.map((term) => ({
        value: {
          id: term.id,
          days: term.days,
        },
        label: term.name,
      }));
      setOptions(options);
    }
  }, [paymentTerms]);

  useEffect(() => {
    setSelectedDate(order.created_at);
    setSelectedPaymentTerm({
      id: order.payment_term_id,
      days: order.payment_term_days,
    });
  }, [order]);

  useEffect(() => {
    const calculatedDueDate = addDays(
      selectedDate,
      Number(selectedPaymentTerm.days)
    );
    
    setDueDate(calculatedDueDate);
  }, [selectedPaymentTerm, selectedDate]);

  const handleCloseClick = () => {
    setOpenModal(false);
  };

  const handleSubmitClick = async () => {
    await dispatch(
      updateOrder({
        orderId: order.id,
        payment_term_id: selectedPaymentTerm.id,
        due_date: dueDate,
      })
    );
    dispatch(getOrderById({ orderId: order.id }));
    setOpenModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal gap-2">
        <div className="modal-header">
          <h3 className="text-[20px]">Editar las condiciones de pago</h3>
        </div>
        <div className="modal-body flex gap-3">
          <CustomSelect
            width="w-full"
            options={options}
            label="Condiciones de pago"
            value={selectedPaymentTerm}
            isObjectValue={true}
            setValue={setSelectedPaymentTerm}
          />
          <CustomDatePicker
            selectedDate={selectedDate}
            onChange={setSelectedDate}
            label="Fecha de emisión"
          />
          <button className="modal-close-button" onClick={handleCloseClick}>
            <CloseIcon />
          </button>
        </div>
        <div className="w-full mt-2 pl-7 border-b">
          <span className="responsive-text font-bold">
            {dueDate instanceof Date &&
              !isNaN(dueDate) &&
              `Pago adeudado el ${format(dueDate, "dd 'de' MMMM 'de' yyyy", {
                locale: es,
              })} (Net ${selectedPaymentTerm.days})`}
          </span>
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

export default PaymentTermsModal;
