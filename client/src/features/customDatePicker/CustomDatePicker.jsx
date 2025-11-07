import React from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("es", es);

const CustomDatePicker = ({
  selectedDate,
  onChange,
  label,
  placeholder = "Selecciona una fecha",
  minDate,
  maxDate,
  disabled = false,
  inline = false,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[13px] font-medium text-gray-700">{label}</label>
      )}

      <div className="relative w-full">
        {!inline && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[14px]">
            📅
          </span>
        )}

        <ReactDatePicker
          selected={selectedDate}
          onChange={onChange}
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          popperPlacement="bottom-start"
          locale="es"
          dateFormat="dd 'de' MMMM 'de' yyyy"
          className={`block w-full pl-4 pr-4 py-[7px] text-[13px] text-gray-700 border border-[#E6E6E6] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 ${
            disabled
              ? "bg-gray-100 cursor-not-allowed text-gray-400"
              : "bg-white"
          }`}
          inline={inline}
          // ⚡ Fuerza el estilo interno del input
          wrapperClassName="block w-full"
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
