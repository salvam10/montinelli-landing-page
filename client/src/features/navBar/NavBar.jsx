import React, { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { getProductsInCart } from "../slices/cartSlice";
import { AuthContext } from "../../App";
import { userLogout } from "../slices/usersSlice";
import MobileMenu from "../mobileMenu/MobileMenu";

const BrandLogo = ({ compact = false }) => (
  <img
    src="/montinelli-logo.png"
    alt="Montinelli"
    className={`block h-auto object-contain ${
      compact ? "w-[140px]" : "w-[180px] sm:w-[240px] lg:w-[300px]"
    }`}
  />
);

const NavBar = () => {
  const { user, setUser } = useContext(AuthContext);
  const { cartItemsCount } = useSelector((state) => state.cart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.id) return;

    dispatch(getProductsInCart({ user_id: user.id }));
  }, [dispatch, user?.id]);

  const logout = () => {
    dispatch(userLogout());
    setUser(null);
  };

  const navItems = [
    {
      key: "orders",
      label: "Mis pedidos",
      icon: InboxOutlinedIcon,
      onClick: () => navigate("/mis-pedidos"),
    },
    {
      key: "prices",
      label: "Estudio Precios",
      icon: LocalOfferOutlinedIcon,
      onClick: () => navigate("/market-check"),
    },
    {
      key: "receivables",
      label: "Estados de cuenta",
      icon: AccountBalanceWalletOutlinedIcon,
      onClick: () => navigate("/cuenta-por-cobrar"),
    },
    {
      key: "logout",
      label: "Cerrar sesión",
      icon: PersonOutlineOutlinedIcon,
      onClick: logout,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-700 transition-colors hover:bg-stone-50 md:hidden"
            >
              <MenuIcon fontSize="small" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex shrink-0 items-center rounded-lg text-left leading-none"
            >
              <BrandLogo />
            </button>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <nav className="flex items-center gap-1">
              {navItems.map(({ key, label, icon: Icon, onClick }) => (
                <button
                  key={key}
                  type="button"
                  onClick={onClick}
                  className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 hover:text-stone-900"
                >
                  <Icon sx={{ fontSize: 18 }} />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="h-7 w-px bg-stone-200" />

            <button
              type="button"
              aria-label="Ir al carrito"
              onClick={() => navigate("/carrito")}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-800 shadow-sm transition-colors hover:bg-stone-50"
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
              <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
                {cartItemsCount}
              </span>
            </button>
          </div>

          <button
            type="button"
            aria-label="Ir al carrito"
            onClick={() => navigate("/carrito")}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-800 shadow-sm transition-colors hover:bg-stone-50 md:hidden"
          >
            <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
            <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
              {cartItemsCount}
            </span>
          </button>
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        navItems={navItems}
        brand={<BrandLogo compact />}
      />
    </>
  );
};

export default NavBar;
