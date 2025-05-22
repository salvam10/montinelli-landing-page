import React, { useState } from "react";

const CustomTextInput = ({ value, setValue, label, type, width, placeholder }) => {

  const handleOnChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className={`${width} flex flex-col gap-2`}>
      {label && <label className="xs:text-[10px]">{label}:</label>}
      <input
        type={type}
        value={value}
        onChange={handleOnChange}
        className={`py-[5px] px-[15px]  border border-[#EBEBEB] rounded-md xs:text-[12px]`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomTextInput;
