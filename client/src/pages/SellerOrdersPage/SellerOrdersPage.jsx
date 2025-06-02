import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSellerOrders } from "../../features/slices/ordersSlice";
import { AuthContext } from "../../App";
import SellerOrderItem from "../../features/sellerOrderItem/SellerOrderItem";

const SellerOrdersPage = () => {
  const { sellerOrders } = useSelector((state) => state.orders);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState(34); // Alimentos por defecto

  useEffect(() => {
    if (user && Object.keys(user).length > 0) {
      dispatch(
        getSellerOrders({
          userId: user.id,
          product_category_id: 34,
        })
      );
    }
  }, [user]);

  const handleCategoryClick = (product_category_id) => {
    setSelectedCategory(product_category_id);
    dispatch(
      getSellerOrders({
        userId: user.id,
        product_category_id,
      })
    );
  };

  const getCategoryButtonClass = (categoryId) =>
    `badge border shadow cursor-pointer hover:bg-[#0079bf] hover:text-white ${
      selectedCategory === categoryId ? "bg-[#0079bf] text-white" : ""
    }`;

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold mb-4">Mis Órdenes</h1>

      <div className="flex justify-center gap-4">
        <span
          className={getCategoryButtonClass(34)}
          onClick={() => handleCategoryClick(34)}
        >
          Alimentos
        </span>
        <span
          className={getCategoryButtonClass(35)}
          onClick={() => handleCategoryClick(35)}
        >
          Limpieza
        </span>
      </div>

      {sellerOrders?.length > 0 ? (
        <ul>
          {sellerOrders.map((order, key) => (
            <SellerOrderItem key={key} order={order} />
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 mt-4">
          No hay órdenes disponibles.
        </p>
      )}
    </div>
  );
};

export default SellerOrdersPage;
