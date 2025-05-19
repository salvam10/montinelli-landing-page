import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { getProductsInCart } from "../slices/cartSlice";
import { AuthContext } from "../../App";
import { userLogout } from "../slices/usersSlice";
import MobileMenu from "../mobileMenu/MobileMenu";

const NavBar = () => {
  const { user, setUser } = useContext(AuthContext);
  const { cartItemsCount } = useSelector((state) => state.cart);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 👈 estado del menú
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      dispatch(getProductsInCart({ user_id: user.id }));
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCartClick = () => navigate(`/carrito`);
  const handleLogoClick = () => navigate(`/`);
  const logout = () => {
    dispatch(userLogout());
    setUser(null);
  };

  return (
    <>
      {windowWidth > 640 ? (
        /* DESKTOP NAVBAR */
        <div className="w-full flex-end p-[15px] bg-white">
          <div className="w-[85%] flex-start cursor-pointer hover:font-bold">
            <span className="text-lg font-bold pl-4" onClick={handleLogoClick}>
              CORPORACION GSM
            </span>
          </div>
          <div className="w-[15%] flex-start gap-1 cursor-pointer text-[#0079bf] hover:font-bold">
            <PersonOutlineOutlinedIcon />
            <span onClick={logout}>Cerrar sesión</span>
          </div>
          <div
            className="w-[5%] relative flex justify-between cursor-pointer text-[#0079bf] hover:font-bold"
            onClick={handleCartClick}
          >
            <ShoppingCartOutlinedIcon />
            <span className="w-[20px] h-[20px] orange-bg flex-center absolute -top-3 right-8 border rounded-full text-xs">
              {cartItemsCount}
            </span>
          </div>
        </div>
      ) : (
        /* MOBILE NAV */
        <div className="w-full relative flex-end p-[15px]">
          <div
            className="w-[25%] flex-start gap-1 cursor-pointer text-[#0079bf]"
            onClick={() => setIsMenuOpen(true)} // 👈 abre el menú
          >
            <MenuIcon />
          </div>
          <div className="w-[50%] flex-start cursor-pointer hover:font-bold">
            <span className="text-lg font-bold pl-4" onClick={handleLogoClick}>
              CORPORACION GSM
            </span>
          </div>
          <div
            className="w-[25%] relative flex-end cursor-pointer text-[#0079bf]"
            onClick={handleCartClick}
          >
            <ShoppingCartOutlinedIcon />
            <span className="w-[20px] h-[20px] orange-bg flex-center absolute -top-3 -right-2 border rounded-full text-xs">
              {cartItemsCount}
            </span>
          </div>
        </div>
      )}

      {/* Render del menú lateral */}
      <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
    </>
  );
};

export default NavBar;
