import React, { useState, useRef } from "react";
import CustomTextInput from "../customTextInput/CustomTextInput";
import InvoiceDatePicker from "../invoiceDatePicker/InvoiceDatePicker";

const AddInvoice = ({
  invoiceNumber,
  setInvoiceNumber,
  invoiceDate,
  setInvoiceDate,
}) => {
  const [isEditing, setIsEditing] = useState(true);
  const inputRef = useRef(null);

  const handleBlur = () => {
    // solo se oculta si hay algo escrito
    if (invoiceNumber.trim() !== "") {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur(); // dispara blur
    }
  };

  const handleClickToEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0); // enfoca tras render
  };

  return (
    <div className="section-container">
      <div className="w-full flex">
        <h2 className="font-bold text-[14px]">Factura</h2>
      </div>

      {isEditing ? (
        <div className="w-full">
          <CustomTextInput
            value={invoiceNumber}
            setValue={setInvoiceNumber}
            placeholder="# de factura"
            type="text"
            width="w-full"
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
          />
        </div>
      ) : (
        <div className="w-full flex">
          {/* Badge de factura */}
          <div className="relative rounded-full blue-bg  px-4 py-1 cursor-default">
            <span className="responsive-text text-white">{invoiceNumber}</span>
            {/* Botón de edición "X" */}
            <button
              onClick={handleClickToEdit}
              className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow "
              title="Editar factura"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Fecha de facturación */}
      {invoiceNumber && !isEditing && (
        <InvoiceDatePicker
          invoiceDate={invoiceDate}
          setInvoiceDate={setInvoiceDate}
        />
      )}
    </div>
  );
};

export default AddInvoice;
