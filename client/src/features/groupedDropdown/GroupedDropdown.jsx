import React, { useEffect, useRef } from "react";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";

const GroupedDropdown = ({
  btnLabel,
  items,
  currentItem,
  handleOnClick,
  openDropdown,
  setOpenDropdown,
}) => {
  const dropdownRef = useRef(null);
  // Detecta clics fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, setOpenDropdown]);

  return (
    <div className="relative inline-block text-left">
      {openDropdown && (
        <div className="absolute flex flex-col gap-2 bg-white top-8 -right-10 shadow-lg py-4 px-2 rounded-lg border z-10 min-w-[220px]">
          {items.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-600 px-2">
                {group.title}
              </span>

              {group.statuses.map((item, index) => {
                if (item?.text.toLowerCase() !== currentItem?.toLowerCase()) {
                  return (
                    <div
                      className="flex gap-2 items-center responsive-text hover:bg-[#EBEBEB] rounded-lg py-[2px] px-2 cursor-pointer"
                      key={index}
                      onClick={() => {
                        handleOnClick(item.value, group.title) 
                        setOpenDropdown(false);
                      } }
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.text}</span>
                    </div>
                  );
                }
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupedDropdown;
