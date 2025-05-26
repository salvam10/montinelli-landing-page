import React from "react";
import { AuthContext } from "../../../App";
import { Navigate, Outlet } from "react-router-dom";
import AdminNavbar from "../../adminNavbar/AdminNavbar";
import AdminSidebar from "../../adminSidebar/AdminSidebar";

const AdminLayout = () => {
  const { user } = React.useContext(AuthContext);

  return (
    <>
      {user.role === "admin" ? (
        <div>
          <AdminNavbar />
          {/* w-screen h-screen flex xs:flex-col gap-5 md:flex-row 
           bg-[#f1f1f1] */}
          <div className="flex">
            <AdminSidebar />
            <Outlet/>
          </div>
        </div>
      ) : (
        <Navigate to="/" />
      )}
    </>
  );
};

export default AdminLayout;
