import React, { useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { adminSidebarItems } from "../../dummy";
import LogoutIcon from "@mui/icons-material/Logout";
import { userLogout } from "../slices/usersSlice";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../../App";
import { getOrders } from "../slices/ordersSlice";

const AdminSidebar = ({ isOpen = false, setIsOpen = () => {} }) => {
  const { setUser } = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders } = useSelector((state) => state.orders);
  const location = useLocation();

  const closeMenu = () => setIsOpen(false);

  const logout = () => {
    dispatch(userLogout());
    setUser(null);
  };
  
  return (
    <div
      className={`
        relative xs:fixed xs:top-0 xs:left-0 xs:h-screen xs:w-64 xs:shadow-lg 
        xs:transform xs:transition-transform xs:duration-300 xs:ease-in-out 
        xs:z-50 ${isOpen ? "xs:translate-x-0" : "xs:-translate-x-full"} 
        md:relative md:translate-x-0 md:shadow-none 
        medium-gray-bg w-[15%] h-screen p-5
      `}
    >
      {/* Botón de cerrar SOLO visible en móviles */}
      <div className="xs:flex md:hidden justify-end p-4">
        <button className="text-2xl" onClick={closeMenu}>
          <CloseIcon />
        </button>
      </div>

      <ul className="space-y-4">
        {adminSidebarItems.map((item, index) => {
          const isActive = location.pathname === item.route;

          return (
            <li
              key={index}
              className={`admin-sidebar-li cursor-pointer ${
                isActive ? "bg-[rgba(241,241,241,1)]  rounded-md px-2 py-1" : ""
              }`}
              onClick={() => {
                navigate(item.route);
                closeMenu();
              }}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-[13px] font-bold">{item.label}</span>
              </div>

              {item.subItems && (
                <div className="mt-2 pl-6 flex flex-col gap-1">
                  {item.subItems.map((sub, subIndex) => {
                    const isSubActive = location.pathname === sub.route;

                    return (
                      <div
                        key={subIndex}
                        className={`${
                          isSubActive
                            ? "bg-[rgba(250,250,250,1)] text rounded py-1 px-1"
                            : ""
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(sub.route);
                            closeMenu();
                          }}
                          className="text-[13px] ml-1 text-left hover:underline"
                        >
                          {sub.label}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="md:hidden absolute bottom-2">
        <div
          className="flex gap-2 items-center cursor-pointer"
          onClick={logout}
        >
          <LogoutIcon sx={{ transform: "scaleX(-1)" }} />
          <span className="responsive-text font-bold">Cerrar Sesión</span>
        </div>
        <p className="text-[13px] text-gray-500 mt-4">
          © 2023 Corporación GSM. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default AdminSidebar;
