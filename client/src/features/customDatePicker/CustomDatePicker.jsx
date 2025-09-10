import React from "react";
import ReactDatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

// Registrar el idioma español
registerLocale("es", es);

const CustomDatePicker = ({
  selectedDate,
  onChange,
  label,
  placeholder = "Selecciona una fecha",
  minDate,
  maxDate,
  disabled = false,
  inline = false, // valor por defecto
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="xs:text-[10px]">{label}</label>}
      <div
        className={`relative w-full flex gap-2 items-baseline ${
          !inline ? "border border-[#EBEBEB] pl-2" : ""
        }`}
      >
        {!inline && (
          <span className="text-gray-500 pointer-events-none">📅</span>
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
          dateFormat="dd 'de' MMMM 'de' yyyy" // Formato largo
          className="w-full rounded-md py-[5px] shadow-sm text-[12px] focus:outline-none"
          inline={inline} // ✅ aquí se pasa la prop
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
