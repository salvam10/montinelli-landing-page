import React, { useState } from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import CircleIcon from "@mui/icons-material/Circle";

const CustomRadioInput = ({
  value,
  label,
  setCheckedOption,
  checkedOption,
  openModal,
  setOpenModal
}) => {

  const handleOptionClick = (value) => {
    setCheckedOption(value);
    openModal !== undefined && setOpenModal(!openModal)
  };  

  return (
    <div className="flex items-center gap-1">
      <span
        className="cursor-pointer"
        onClick={() => {
          handleOptionClick(value);
        }}
      >
        {checkedOption === value ? (
          <CircleIcon style={{ width: "20px", color: "#0079bf" }} />
        ) : (
          <CircleOutlinedIcon style={{ width: "20px", color: "#0079bf" }} />
        )}
      </span>
      <span className="text-[13px]">{label}</span>
    </div>
  );
};

export default CustomRadioInput;
