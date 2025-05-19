import React from "react";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";

const DropdownButton = ({
  btnLabel,
  items,
  currentItem,
  handleOnClick,
  openDropdown,
  setOpenDropdown,
}) => {
  

  return (
    <div
      className="relative flex gap-1 items-center medium-gray-bg py-[1px] px-2 rounded-lg font-bold cursor-pointer"
      onClick={() => {
        setOpenDropdown(!openDropdown);
      }}
    >
      <span className="responsive-text">{btnLabel}</span>
      <span className="font-bold">
        <ExpandMoreOutlinedIcon
          style={{ fontSize: "medium", fontWeight: "fontBold" }}
        />
      </span>
      {openDropdown && (
        <div className="absolute flex flex-col gap-1 bg-white top-8 -right-10 shadow-lg py-4 px-2 rounded-lg border z-10">
          {items.map((item, index) => {
            if (item?.text.toLowerCase() !== currentItem?.toLowerCase()) {
              return (
                <div
                  className="flex gap-1 responsive-text items-center hover:bg-[#EBEBEB] rounded-lg py-[1px] px-2"
                  key={index}
                  onClick={() => {
                    handleOnClick(item.value);
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
