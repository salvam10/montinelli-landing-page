import React from "react";

const CustomSelect = ({
  value,
  setValue,
  options,
  label,
  width,
  isObjectValue = false,
}) => {
  const handleChange = (event) => {
    const selectedStringValue = event.target.value;
    const parsedValue = isObjectValue
      ? JSON.parse(selectedStringValue)
      : selectedStringValue;
    setValue(parsedValue);
  };

  //Los select solo aceptan string como valor, por lo que si el valor es un objeto, se convierte a string.
  const formatOptionValue = (val) => {
    if (val === null || val === undefined) return "";
    return isObjectValue ? JSON.stringify(val) : val;
  };

  return (
    <div className={`${width | `w-full`} flex flex-col gap-2`}>
      <label className="xs:text-[10px]">{label}</label>
      <select
        id="custom-select"
        value={formatOptionValue(value)}
        onChange={handleChange}
        className={`py-[5px] px-[15px] bg-white border border-[#EBEBEB] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm xs:text-[12px]`}
      >
        {options.map((option, index) => (
          <option
            className="text-[12px]"
            key={index}
            value={formatOptionValue(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomSelect;
