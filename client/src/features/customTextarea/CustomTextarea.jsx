import React, { useState } from "react";

const CustomTextarea = ({ value, setValue, label, width, height }) => {
  const handleOnChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className={`${width} flex flex-col gap-2`}>
      <label className="xs:text-[10px]">{label}:</label>
      <textarea
        value={value}
        onChange={handleOnChange}
        className={`${height} py-[5px] px-[15px]  border border-[#EBEBEB] rounded-md xs:text-[12px]`}
      />
    </div>
  );
};

export default CustomTextarea;
