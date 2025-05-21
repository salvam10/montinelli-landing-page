import React from "react";
import { useNavigate } from "react-router-dom";
import { adminSidebarItems } from "../../dummy";

const AdminSidebar = ({ isOpen = false, setIsOpen = () => {} }) => {
  const navigate = useNavigate();
  const closeMenu = () => setIsOpen(false);

  return (
    <div
      className={`
        xs:fixed xs:top-0 xs:left-0 xs:h-screen xs:w-64 xs:shadow-lg 
        xs:transform xs:transition-transform xs:duration-300 xs:ease-in-out 
        xs:z-50 ${isOpen ? "xs:translate-x-0" : "xs:-translate-x-full"} 
        md:relative md:translate-x-0 md:shadow-none 
        medium-gray-bg w-[15%] h-screen p-5
      `}
    >
      {/* Botón de cerrar SOLO visible en móviles */}
      <div className="xs:flex md:hidden justify-end p-4">
        <button className="text-2xl" onClick={closeMenu}>
          x
        </button>
      </div>

      <ul className="space-y-4">
        {adminSidebarItems.map((item, index) => (
          <li
            key={index}
            className="admin-sidebar-li cursor-pointer"
            onClick={() => navigate(item.route)}
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="text-[13px] font-bold">{item.label}</span>
            </div>

            {item.subItems && (
              <div className="mt-2 pl-6 flex flex-col gap-1">
                {item.subItems.map((sub, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(sub.route);
                      closeMenu();
                    }}
                    className="text-[13px] ml-1 text-left hover:underline"
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminSidebar;
