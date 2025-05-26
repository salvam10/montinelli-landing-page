import React from "react";
import { AuthContext } from "../../../App";
import { Navigate, Outlet } from "react-router-dom";
import AdminNavbar from "../../adminNavbar/AdminNavbar";
import AdminSidebar from "../../adminSidebar/AdminSidebar";

const AdminLayout = () => {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <AdminNavbar />
      <div className="h-screen flex xs:flex-col gap-5 md:flex-row bg-[#f1f1f1]">
        <div className="flex">
          <AdminSidebar />
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
