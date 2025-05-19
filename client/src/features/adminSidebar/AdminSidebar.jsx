import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminSidebarItems } from "../../dummy";

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-[15%] h-screen medium-gray-bg p-5">
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
