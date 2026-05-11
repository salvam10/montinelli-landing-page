import React from "react";
import CloseIcon from "@mui/icons-material/Close";

const MobileMenu = ({ isOpen, setIsOpen, navItems = [], brand = null }) => {
  const closeMenu = () => setIsOpen(false);

  const handleItemClick = (action) => {
    closeMenu();
    action?.();
  };

  return (
    <>
      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[300px] max-w-[84vw] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div className="min-w-0">{brand}</div>

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={closeMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-700 transition-colors hover:bg-stone-50"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-4">
          {navItems.map(({ key, label, icon: Icon, onClick }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleItemClick(onClick)}
              className="inline-flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-medium text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-900"
            >
              <Icon sx={{ fontSize: 20 }} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default MobileMenu;
