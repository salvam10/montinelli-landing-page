import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const CustomFormButton = ({
  handleClickFunction,
  text,
  color,
  textColor,
  fontBold,
  icon,
  width = "w-full",
}) => {
  const { isLoading } = useSelector((state) => state.orders);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeout;
    if (isLoading) {
      setShowLoading(true);
    } else {
      // deja el spinner al menos 500ms aunque isLoading ya sea false
      timeout = setTimeout(() => setShowLoading(false), 500);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <button
      onClick={handleClickFunction}
      disabled={isLoading || showLoading}
      className={`${width} border rounded-lg ${color || "blue-bg"} ${
        textColor || "text-white"
      }  ${
        fontBold && "font-bold"
      } flex items-center justify-center gap-2 xs:text-[12px] xs:p-[6px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:font-`}
    >
      {(isLoading || showLoading) && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
      {isLoading || showLoading ? "Guardando..." : text || "Agregar"}
    </button>
  );
};

export default CustomFormButton;
