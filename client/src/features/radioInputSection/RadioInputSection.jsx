import React, { useState } from "react";
import CustomRadioInput from "../customRadioInput/CustomRadioInput";
import CreateClientModal from "../modals/CreateClientModal";
import ExistingClientModal from "../modals/ExistingClientModal";

const RadioInputSection = ({
  options,
  title,
  setCheckedOption,
  checkedOption,
  openModal,
  setOpenModal,
}) => {
  return (
    <div className="section-container">
      <div className="w-full flex">
        <h3 className="font-bold">{title}</h3>
      </div>
      <div className="w-full flex items-baseline justify-evenly">
        {options.map((option, index) => (
          <li key={index} className="flex gap-1 items-center">
            <CustomRadioInput
              value={option.value}
              label={option.label}
              setCheckedOption={setCheckedOption}
              checkedOption={checkedOption}
              openModal={openModal}
              setOpenModal={setOpenModal}
            />
          </li>
        ))}
      </div>
    </div>
  );
};

export default RadioInputSection;
