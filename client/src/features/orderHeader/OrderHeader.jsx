import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import { useNavigate } from "react-router-dom";

import {
  updateOrder,
  getOrderById,
  getClientByOrderId,
} from "../slices/ordersSlice";
import { updateClient } from "../slices/clientsSlice";
import DropdownButton from "../dropdownMenu/DropdownButton";
import {
  managerApprovalStatuses,
  debtStatuses,
  combinedStatuses,
} from "../../dummy";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Pill from "../pill/Pill";
import GroupedDropdown from "../groupedDropdown/GroupedDropdown";

const OrderHeader = ({
  client,
  order,
  openManagerDrop,
  setOpenManagerDrop,
  openDebtDrop,
  setOpenDebtDrop,
  openGroupedDrop,
  setOpenGroupedDrop,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [pillBg, setPillBg] = useState();
  const [managerStatus, setManagerStatus] = useState();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [debtStatus, setDebtStatus] = useState();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setManagerStatus(order.manager_approval_status);
  }, [order]);

  useEffect(() => {
    if (typeof managerStatus === "string" && managerStatus.trim() !== "") {
      changePillBgColor(setPillBg, managerStatus);
    }
  }, [managerStatus]);

  useEffect(() => {
    if (client?.has_debt) {
      setDebtStatus("con deuda");
    } else {
      setDebtStatus("al dia");
    }
  }, [client]);

  const changePillBgColor = (setStatus, currentStatus) => {
    if (!currentStatus || typeof currentStatus !== "string") {
      return;
    }

    const status = currentStatus.toLowerCase().trim();

    switch (status) {
      case "aprobado":
      case "al dia":
        setStatus("bg-[rgba(112,181,0,0.5)]");
        break;
      case "pendiente":
        setStatus("bg-[rgba(242,214,0,0.5)]");
        break;
      case "negado":
      case "con deuda":
        setStatus("bg-[rgba(235,90,70,0.5)]");
        break;
      default:
        console.log("Estado desconocido:", currentStatus);
    }
  };

  const updateManagerStatus = async (status) => {
    await dispatch(
      updateOrder({ orderId: order.id, manager_approval_status: status })
    );
    dispatch(getOrderById({ orderId: order.id }));
    setOpenManagerDrop(false);
  };

  const updateDebtStatus = async (status) => {
    await dispatch(
      updateClient({
        rif: client.rif,
        has_debt: status,
      })
    );
    dispatch(getClientByOrderId({ orderId: order.id }));
    setOpenDebtDrop(false);
  };

  const handleGroupedDropdownClick = async (value, title) => {
    if (title === "Aprobación de gerencia") {
      await updateManagerStatus(value);
    } else if (title === "Estado de cuenta") {
      await updateDebtStatus(value);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div className="flex xs:flex-col md:flex-row gap-2 items-bottom">
          {/* breadcrumbs */}
          <div className="flex gap-1 items-bottom">
            <span
              className="cursor-pointer"
              onClick={() => navigate("/admin/orders")}
            >
              <InboxOutlinedIcon style={{ fontSize: "large" }} />
            </span>
            <span>
              <ArrowForwardIosOutlinedIcon style={{ fontSize: "medium" }} />
            </span>
            <span className="font-bold text-[18px]">#{order.id}</span>
          </div>

          {/* order metadata */}
          <div className="flex gap-2">
            <Pill
              setBgColor={changePillBgColor}
              prefix="Pedido"
              status={managerStatus}
            />
            <Pill
              setBgColor={changePillBgColor}
              prefix="Cliente"
              status={debtStatus}
            />
          </div>
        </div>
        {windowWidth > 640 ? (
          <div className="flex-end gap-2">
            <DropdownButton
              btnLabel="Aprobación gerencia"
              items={managerApprovalStatuses}
              currentItem={managerStatus}
              handleOnClick={updateManagerStatus}
              openDropdown={openManagerDrop}
              setOpenDropdown={setOpenManagerDrop}
            />
            <DropdownButton
              btnLabel="Estado de cuenta"
              items={debtStatuses}
              currentItem={client?.has_debt ? "con deuda" : "al dia"}
              handleOnClick={updateDebtStatus}
              openDropdown={openDebtDrop}
              setOpenDropdown={setOpenDebtDrop}
            />
          </div>
        ) : (
          <div className="text-[10px] cursor-pointer">
            <span
              className="px-[6px] py-[8px] rounded-full medium-gray-bg"
              onClick={() => {
                setOpenGroupedDrop(!openGroupedDrop);
              }}
            >
              <MoreHorizIcon style={{ color: "#000000" }} />
            </span>
            <GroupedDropdown
              items={combinedStatuses}
              openDropdown={openGroupedDrop}
              setOpenDropdown={setOpenGroupedDrop}
              handleOnClick={handleGroupedDropdownClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHeader;
