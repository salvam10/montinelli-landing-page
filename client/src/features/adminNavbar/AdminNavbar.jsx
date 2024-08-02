import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
/* React Router */
import { useNavigate } from "react-router-dom";
/* icons */
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
/* redux state */
import { retrieveCart } from "../slices/cartSlice";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../../App";

const AdminNavbar = () => {
  const { user } = useContext(AuthContext);
  const { cartItemsCount } = useSelector((state) => state.cart);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  useEffect(() => {
    try {
      dispatch(retrieveCart({ user_id: user.id }));
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
    <div className="w-full flex-end p-[15px] bg-[#c4c9cc]">
      {/* logo */}
      <div className="w-[85%] flex-start cursor-pointer hover:font-bold">
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
      <div className="cursor-pointer hover:border hover:rounded hover:bg-[#B3B3B3]">
        <MenuIcon />
      </div>
      {/* logo */}
      <div className="w-[80%] flex-start cursor-pointer hover:font-bold">
        <span className="text-lg font-bold pl-4" onClick={handleLogoClick}>
          CORPORACION GSM
        </span>
      </div>
      {/* user icon */}
      <div className="w-[10%] flex-start gap-1 cursor-pointer text-[#0079bf] hover:font-bold">
        <PersonOutlineOutlinedIcon />
      </div>
    </div>
  );
};

export default AdminNavbar;
