import React from "react";
import { Link, useNavigate } from "react-router-dom";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

const AdminSidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-[15%] medium-gray-bg p-5 ">
      <li
        className="admin-sidebar-li"
        onClick={() => navigate("/admin/orders")}
      >
        <div className="flex">
          <InboxOutlinedIcon style={{ fontSize: "20px" }} />
        </div>
        <div className="w-[80%] flex-start">
          <p className="text-[13px] font-bold">Pedidos</p>
        </div>
      </li>
    </div>
  );
};

export default AdminSidebar;
