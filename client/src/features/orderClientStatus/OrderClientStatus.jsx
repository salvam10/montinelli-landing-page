import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomSelect from "../customSelect/CustomSelect";
import { updateOrder } from "../../features/slices/ordersSlice";
import { orderStatuses } from "../../dummy";

const OrderClientStatus = ({ order, id }) => {
  const [orderStatus, setOrderStatus] = useState(order.status || "");
  const dispatch = useDispatch();

    useEffect(() => { 
    setOrderStatus(order?.status);
  }, [order]);

  const handleStatusChange = () => {
    dispatch(updateOrder({ orderId: id, status: orderStatus }));
  };

  return (
    <div className="xs:w-full flex">
      <div className="section-container">
        <div className="w-full">
          <div className="flex flex-col">
            <span className="client-detail-label">Estado</span>
            <CustomSelect
              options={orderStatuses}
              setValue={setOrderStatus}
              value={orderStatus}
              width="w-[100%]"
            />
          </div>
        </div>
        <CustomFormButton
          type="submit"
          handleClickFunction={handleStatusChange}
          text="Actualizar"
        />
      </div>
    </div>
  );
};

export default OrderClientStatus;
