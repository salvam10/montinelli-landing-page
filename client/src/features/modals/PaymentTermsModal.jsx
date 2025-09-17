import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import CustomSelect from "../customSelect/CustomSelect";
import CustomFormButton from "../customFormButton/CustomFormButton";
import { getOrderById, updateOrder } from "../slices/ordersSlice";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { updateClient } from "../slices/clientsSlice";

const toYMD = (d) => format(new Date(d), "yyyy-MM-dd");

const PaymentTermsModal = ({ setOpenModal, orderClient, order }) => {
  const dispatch = useDispatch();
  const { paymentTerms } = useSelector((state) => state.paymentTerms);

  // Fecha base: SIEMPRE la fecha real de entrega (no editable)
  const dispatchDate = useMemo(
    () =>
      order?.actual_dispatch_date ? new Date(order.actual_dispatch_date) : null,
    [order?.actual_dispatch_date]
  );

  // Opciones del select (id + days)
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (!paymentTerms) return;
    setOptions(
      paymentTerms.map((term) => ({
        value: { id: term.id, days: term.days },
        label: term.name,
      }))
    );
  }, [paymentTerms]);

  // Término de pago seleccionado (inicialmente lo de la orden)
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState({
    id: order?.payment_term_id,
    days: order?.payment_term_days,
  });

  useEffect(() => {
    setSelectedPaymentTerm({
      id: orderClient?.credit_id,
      days: orderClient?.credit_days,
    });
  }, [orderClient?.credit_id, orderClient?.credit_days]);

  // due_date recalculado cada vez que cambian los días (base = dispatchDate)
  const computedDueDate = useMemo(() => {
    if (!dispatchDate) return null;
    const days = Number(selectedPaymentTerm?.days) || 0;
    return addDays(dispatchDate, days);
  }, [dispatchDate, selectedPaymentTerm?.days]);

  const handleClose = () => setOpenModal(false);

  const handleSubmit = async () => {
    if (!dispatchDate || !computedDueDate) return;
    await dispatch(
      updateOrder({
        orderId: order.id,
        payment_term_id: selectedPaymentTerm.id,
        // Guardar como 'date' (YYYY-MM-DD)
        due_date: toYMD(computedDueDate),
      })
    );
    await dispatch(
      updateClient({
        id: orderClient.id,
        payment_term_id: selectedPaymentTerm.id,
      })
    );
    dispatch(getOrderById({ orderId: order.id }));
    setOpenModal(false);
  };

  const disableSave = !dispatchDate || !selectedPaymentTerm?.id;

  return (
    <div className="modal-overlay">
      <div className="modal w-[450px] h-[55vh] relative gap-2">
        <div className="absolute top-0 right-4 cursor-pointer">
          <button className="modal-close-button" onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-header">
          <h3 className="text-[20px]">Editar las condiciones de pago</h3>
        </div>

        <div className="modal-body flex gap-3 relative">
          <CustomSelect
            width="w-full"
            options={options}
            label="Condiciones de pago"
            value={selectedPaymentTerm}
            isObjectValue={true}
            setValue={setSelectedPaymentTerm}
          />

          {/* Fecha base solo lectura (entrega real) */}
          <div className="w-full flex flex-col">
            <label className="block text-xs mb-1 text-gray-600">
              Entregado al cliente el:
            </label>

            <span className="responsive-text">
              {dispatchDate
                ? format(dispatchDate, "dd 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })
                : "— Sin fecha de entrega —"}
            </span>
          </div>
        </div>

        {/* Resumen de vencimiento */}
        <div className="w-full mt-2 pl-7 border-b">
          <span className="responsive-text font-bold">
            {computedDueDate
              ? `Pago adeudado el ${format(
                  computedDueDate,
                  "dd 'de' MMMM 'de' yyyy",
                  {
                    locale: es,
                  }
                )} (Net ${selectedPaymentTerm?.days ?? 0})`
              : "Define fecha de entrega para calcular el vencimiento"}
          </span>
        </div>

        {/* Aviso si falta la fecha de entrega */}
        {!dispatchDate && (
          <div className="w-full mt-2 pl-7 text-[12px] text-red-600">
            Esta orden no tiene <b>fecha de entrega</b>. Asigna el despacho para
            poder calcular el vencimiento.
          </div>
        )}

        <div className="w-full flex-end">
          <div className="w-[50%] mt-2 flex-end gap-2">
            <CustomFormButton
              handleClickFunction={handleClose}
              text="Cancelar"
              color="bg-white-500"
              textColor="text-[#000000]"
              fontBold={true}
            />
            <CustomFormButton
              handleClickFunction={handleSubmit}
              text="Guardar"
              color="bg-blue-500"
              textColor="text-white"
              fontBold={true}
              disabled={disableSave}
              isLoading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTermsModal;
