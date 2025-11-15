import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const CompetitorDashboard = () => {
  const tabs = [
    { path: "product", label: "Por Producto" },
    { path: "category", label: "Por Categoría" },
    { path: "client", label: "Por Establecimiento" },
  ];

  return (
    <div className="w-full px-6 py-4">
      <h2 className="text-2xl font-semibold mb-4">Análisis de Competencia</h2>

      <div className="flex gap-4 mb-6 border-b">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `pb-2 border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-neutral-600 hover:text-blue-600"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Subruta activa */}
      <Outlet />
    </div>
  );
};

export default CompetitorDashboard;
