import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
/* React Router */
import { useNavigate } from "react-router-dom";
/* Components */
import AdminSidebar from "../adminSidebar/AdminSidebar";
/* icons */
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
/* redux state */
import { getProductsInCart } from "../slices/cartSlice";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../../App";

const AdminNavbar = ({ isOpen, setIsOpen }) => {
  const { user } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 👈 estado del menú
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
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
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    // Retornar una función de limpieza para eliminar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleCartClick = () => {
    navigate(`/carrito`);
  };

  const handleLogoClick = () => {
    navigate(`/`);
  };

  return windowWidth > 640 ? (
    /* DESKTOP NAVBAR */
    <div className="w-full relative flex-end p-[15px] bg-[#c4c9cc]">
      {/* logo */}
      <div className="w-[85%] flex-start  cursor-pointer hover:font-bold">
        <span className="text-lg font-bold pl-4" onClick={handleLogoClick}>
          CORPORACION GSM
        </span>
      </div>
      <div className="w-[15%] flex-start gap-1 cursor-pointer text-[#0079bf] hover:font-bold">
        <PersonOutlineOutlinedIcon />
        <span>Cerrar sesión</span>
      </div>
    </div>
  ) : (
    /* MOBILE NAV */
    <div className="w-full relative flex-end p-[15px] bg-[#c4c9cc]">
      {/* burger sidebar menu */}
      <div
        className="cursor-pointer hover:border hover:rounded hover:bg-[#B3B3B3]"
        onClick={() => setIsMenuOpen(true)}
      >
        <MenuIcon />
      </div>
      {/* logo */}
      <div className="w-[80%] flex justify-center items-center gap-2 cursor-pointer hover:font-bold">
        <span className="text-lg font-bold pl-4" onClick={handleLogoClick}>
          CORPORACION GSM
        </span>
      </div>
      <AdminSidebar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
    </div>
  );
};

export default AdminNavbar;
