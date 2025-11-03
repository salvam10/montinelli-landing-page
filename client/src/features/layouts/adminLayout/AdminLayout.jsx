import React from "react";
import { AuthContext } from "../../../App";
import { Navigate, Outlet } from "react-router-dom";
import AdminNavbar from "../../adminNavbar/AdminNavbar";
import AdminSidebar from "../../adminSidebar/AdminSidebar";

const AdminLayout = () => {
  const { user } = React.useContext(AuthContext);
  const [isOpen, setIsOpen] = React.useState(false);

  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== "admin" && user.role !== "superadmin")
    return <Navigate to="/" replace />;

  return (
    <div className="h-screen flex flex-col bg-[#f1f1f1] overflow-hidden">
      {/* Navbar fijo arriba */}
      <div className="flex-shrink-0">
        <AdminNavbar setIsOpen={setIsOpen} />
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar (visible fijo en desktop, drawer en mobile) */}
        <div className="hidden md:block w-[15%] min-w-[220px] h-full  border-gray-200">
          <AdminSidebar />
        </div>

        {/* Drawer lateral para mobile */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>

        {/* Capa de fondo semitransparente cuando el sidebar móvil está abierto */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          ></div>
        )}

        {/* Contenido principal scrollable */}
        <div className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};



export default AdminLayout;
