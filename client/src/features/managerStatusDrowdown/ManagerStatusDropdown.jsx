import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getOrderById, updateOrder } from "../slices/ordersSlice";
import { managerApprovalStatuses } from "../../dummy";

const ManagerStatusDropdown = ({
  orderId,
  currentManagerStatus,
  setIsDropdownOpen,
}) => {
  const dispatch = useDispatch();

  const handleOnClick = async (managerStatus) => {
    await dispatch(
      updateOrder({ orderId: orderId, manager_approval_status: managerStatus })
    );
    dispatch(getOrderById({ orderId }));
    setIsDropdownOpen(false); 
  };

  return (
    <div className="absolute flex flex-col gap-1 bg-white top-8 -right-10 shadow-lg py-4 px-2 rounded-lg border z-10">
      {managerApprovalStatuses.map((status, index) => {
        if (
          status?.text.toLowerCase() !== currentManagerStatus?.toLowerCase()
        ) {
          return (
            <div
              className="flex gap-1 responsive-text items-center hover:bg-[#EBEBEB] rounded-lg py-[1px] px-2"
              key={index}
              onClick={() => {
                handleOnClick(status.text);
              }}
            >
              <span>{status.icon}</span>
              <span>{status.text}</span>
            </div>
          );
        }
      })}
    </div>
  );
};

export default ManagerStatusDropdown;
