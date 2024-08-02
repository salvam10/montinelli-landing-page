import React, { useContext, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
/* Components */
import Counter from "../counter/Counter";
import { deleteProductInCart } from "../slices/cartSlice";
import { AuthContext } from "../../App";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const CartList = () => {
  const { user } = useContext(AuthContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { productsInCart } = useSelector((state) => state.cart);
  const { bsExchangeRate } = useSelector((state) => state.products);
  const dispatch = useDispatch();

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

  const handleDeleteClick = (product_id) => {
    try {
      dispatch(
        deleteProductInCart({ user_id: user.id, product_id: product_id })
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="xs:w-full md:w-[70%] flex-start flex-col gap-2">
      {productsInCart?.map((product, index) => (
        <div key={index} className="w-full flex bg-white">
          {/* left */}
          <div className="xs:w-[30%] md:w-[20%]">
            <img src={product.media_url} alt="" />
          </div>
          {/* right */}
          <div className="w-full flex xs:flex-col md:flex-row xs:justify-between  md:items-center  gap-4 relative xs:px-4">
            {/* product name */}
            <div className="w-[60%] flex-start items-baseline pt-[10px]">
              <p className="md:w-full xs:text-[15px] font-bold">
                {product.name}
              </p>
              <button
                className="md:hidden absolute right-8"
                onClick={(e) => {
                  handleDeleteClick(product.id);
                }}
              >
                X
              </button>
            </div>
            {/* product details */}
            <div className="w-full flex justify-between p-4 xs:items-center md:items-center">
              {/* Price Section*/}
              <div className="md:w-[20%] flex-center flex-col xs:text-lg text-[#0079bf] font-bold">
                <span>{product.base_price}$</span>
                <span className="responsive-text text-[#B3B3B3] font-bold">
                  Bs.{(product.base_price * bsExchangeRate).toFixed(2)}
                </span>
                <span className="responsive-text text-[#B3B3B3] font-bold">
                  I.V.A{" "}
                  {(
                    product.base_price *
                    (product.tax_percentage / 100)
                  ).toFixed(2)}
                  $
                </span>
              </div>
              {/* Counter Section*/}
              <div className="md:w-[20%] flex">
                <Counter
                  product_quantity={product.quantity}
                  product_id={product.id}
                />
              </div>
              <div className="md:w-[10%] xs:hidden md:flex md:justify-center items:center cursor-pointer">
                <span
                  onClick={(e) => {
                    handleDeleteClick(product.id);
                  }}
                >
                  <DeleteOutlineOutlinedIcon style={{ color: "#B3B3B3", fontSize:'30px' }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartList;
