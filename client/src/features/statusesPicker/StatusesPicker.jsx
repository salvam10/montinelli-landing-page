import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import { changePillBgColor } from "../../helpers/changePillColor";
import DropdownButton from "../dropdownMenu/DropdownButton";
import {
  managerApprovalStatuses,
  combinedStatuses,
  paymentStatuses,
} from "../../dummy";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Pill from "../pill/Pill";
import GroupedDropdown from "../groupedDropdown/GroupedDropdown";

const StatusesPicker = ({
  openManagerDrop,
  setOpenManagerDrop,
  openGroupedDrop,
  setOpenGroupedDrop,
  openPaymentDrop,
  setOpenPaymentDrop,
  paymentStatus,
  setPaymentStatus,
  managerStatus,
  setManagerStatus
}) => {
  const navigate = useNavigate();
  const [pillBg, setPillBg] = useState();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    setManagerStatus(managerApprovalStatuses[0]);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof managerStatus === "string" && managerStatus.trim() !== "") {
      changePillBgColor(setPillBg, managerStatus);
    }
  }, [managerStatus]);

  const updateManagerStatus = (statusValue) => {
    const selected = managerApprovalStatuses.find(
      (s) => s.value === statusValue
    );
    setManagerStatus(selected);
    setOpenManagerDrop(false);
  };

  const updatePaymentStatus = (statusValue) => {
    const selected = paymentStatuses.find((s) => s.value === statusValue);
    setPaymentStatus(selected);
    setOpenPaymentDrop(false);
  };

  const handleGroupedDropdownClick = async (value, title) => {
    if (title === "Aprobación de gerencia") {
      await updateManagerStatus(value);
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
            <span className="font-bold text-[18px]">Crea Pedido</span>
          </div>

          {/* order metadata */}
          <div className="flex gap-2">
            <Pill
              setBgColor={changePillBgColor}
              prefix="Pedido"
              status={managerStatus?.text}
            />
            <Pill
              setBgColor={changePillBgColor}
              prefix="Factura"
              status={paymentStatus?.text}
            />
          </div>
        </div>
        {windowWidth > 640 ? (
          <div className="flex-end gap-2">
            <DropdownButton
              btnLabel="Aprobación gerencia"
              items={managerApprovalStatuses}
              currentItem={managerStatus?.text}
              handleOnClick={updateManagerStatus}
              openDropdown={openManagerDrop}
              setOpenDropdown={setOpenManagerDrop}
            />
            <DropdownButton
              btnLabel="Estado de la factura"
              items={paymentStatuses}
              currentItem={paymentStatus?.text}
              handleOnClick={updatePaymentStatus}
              openDropdown={openPaymentDrop}
              setOpenDropdown={setOpenPaymentDrop}
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

export default StatusesPicker;
