import React from "react";
import { useNavigate } from "react-router-dom";

const MobileMenu = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const goToOrders = () => {
    closeMenu();
    navigate("/mis-pedidos");
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button className="text-2xl" onClick={closeMenu}>
            ×
          </button>
        </div>
        <nav className="p-4">
          <button
            onClick={goToOrders}
            className="w-full text-left text-lg text-gray-800 hover:text-blue-600"
          >
            Pedidos
          </button>
        </nav>
      </div>

      {/* Fondo oscuro detrás del menú */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={closeMenu}
        ></div>
      )}
    </>
  );
};

export default MobileMenu;
