import React from "react";

const CustomSelect = ({value, setValue, options, label, width }) => {


  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div className={`${width && `w-[${width}]`} flex flex-col gap-2`}>
      <label className="xs:text-[10px]">{label}:</label>
      <select
        id="custom-select"
        value={value}
        onChange={handleChange}
        className={`py-[5px] px-[15px] bg-white border border-[#EBEBEB] rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm xs:text-[12px]`}
      >
        {options.map((option, index) => (
          <option className="text-[12px]" key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomSelect;
