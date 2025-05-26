import React, { useState, useRef } from "react";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const InvoiceDatePicker = ({ invoiceDate, setInvoiceDate }) => {
  const [selectedDate, setSelectedDate] = useState();
  const [isEditing, setIsEditing] = useState(true);

  const handleChange = (date) => {
    setSelectedDate(date);
    setInvoiceDate(date);
    setIsEditing(false);
  };

  const handleClickToEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="w-full flex">
        <h2 className="font-bold text-[14px]">Fecha de facturación</h2>
      </div>

      {isEditing ? (
        <div className="w-full mt-2">
          <CustomDatePicker
            selectedDate={selectedDate || new Date()}
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative inline-block mt-2">
          {/* Fecha como pill */}
          <div className="rounded-full blue-bg px-4 py-1 text-white">
            <span className="responsive-text font-bold">
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>

          {/* Botón para editar */}
          <button
            onClick={handleClickToEdit}
            className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow"
            title="Editar fecha"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceDatePicker;
