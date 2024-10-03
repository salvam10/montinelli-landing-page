import React from 'react'
import CloseIcon from "@mui/icons-material/Close";

const CustomFormButton = ({ handleClickFunction }) => {

  

  return (
    <button className="w-full border rounded-full blue-bg text-white xs:text-[12px] xs:p-[6px]" onClick={handleClickFunction}>
      Agregar
    </button>
  );
};

export default CustomFormButton
