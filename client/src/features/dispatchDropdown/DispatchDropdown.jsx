import React from "react";
import { useDispatch } from "react-redux";
import { dispatchStatuses } from "../../dummy";
import { updateOrder, getOrderById } from "../slices/ordersSlice";

const DispatchDropdown = ({ order, setOpenDropdown }) => {
  const dispatch = useDispatch();

 const handleOnClick = async (shippingStatus) => {
   setOpenDropdown(false);

   const isFinalStatus =
     shippingStatus === "Despachado" ||
     shippingStatus === "Rechazado por cliente";

   const payload = {
     orderId: order.id,
     shipping_status: shippingStatus,
     actual_dispatch_date: isFinalStatus ? new Date() : null,
     scheduled_dispatch_date: isFinalStatus
       ? order.scheduled_dispatch_date
       : null,
     shipping_company: isFinalStatus ? order.shipping_company : null,
   };

   try {
     await dispatch(updateOrder(payload));
     dispatch(getOrderById({ orderId: order.id }));
   } catch (error) {
     console.error("Error al actualizar el estado de envío:", error);
   }
 };


  return (
    <div className="absolute flex flex-col gap-1 bg-white top-8 -right-10 shadow-lg py-4 px-2 rounded-lg border z-10">
      {dispatchStatuses?.map((status, index) => (
        <div
          className="flex gap-1 responsive-text items-center hover:bg-[#EBEBEB] rounded-lg py-[1px] px-2"
          key={index}
          onClick={() => {
            handleOnClick(status.text);
          }}
        >
          <span>{status.text}</span>
        </div>
      ))}
    </div>
  );
};

export default DispatchDropdown;
