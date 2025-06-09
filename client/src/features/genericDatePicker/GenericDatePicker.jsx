import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";

const GenericDatePicker = ({
  label = "Seleccionar fecha",
  value,
  onChange,
}) => {
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    setSelectedDate(value || new Date());
  }, [value]);

  const handleChange = (date) => {
    setSelectedDate(date);
    onChange(date);
    setIsEditing(false);
  };

  const handleClickToEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="w-full">
      <div className="w-full flex">
        <h2 className="font-bold text-[14px]">{label}</h2>
      </div>

      {isEditing ? (
        <div className="w-full mt-2">
          <CustomDatePicker
            selectedDate={selectedDate}
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative inline-block mt-2">
          <div className="rounded-full blue-bg px-4 py-1 text-white">
            <span className="responsive-text font-bold">
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
            </span>
          </div>

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

export default GenericDatePicker;
