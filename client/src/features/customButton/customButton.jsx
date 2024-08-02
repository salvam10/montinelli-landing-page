import React from "react";
import { useNavigate } from "react-router-dom";

const CustomButton = ({title, handleOnClick }) => {
  const navigate = useNavigate();

  return (
    <button
      className={`w-full md:border md:rounded-[0.4rem] xs:px-[20px] xs:py-3 blue-bg text-white xs:text-[13px] font-bold `}
      onClick={handleOnClick}
    >
      {title}
    </button>
  );
};

export default CustomButton;
