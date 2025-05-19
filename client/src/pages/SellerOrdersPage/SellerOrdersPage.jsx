import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSellerOrders } from "../../features/slices/ordersSlice";
import { AuthContext } from "../../App";
import SellerOrderItem from "../../features/sellerOrderItem/SellerOrderItem";

const SellerOrdersPage = () => {
  const { sellerOrders } = useSelector((state) => state.orders);
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    Object.keys(user).length > 0 &&
      dispatch(getSellerOrders({ userId: user.id }));
  }, [user]);

  const handleCategoryClick = (product_category_id) => {
    dispatch(
      getSellerOrders({
        userId: user.id,
        product_category_id: product_category_id,
      })
    );
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold mb-4">Mis Órdenes</h1>
      <div className="flex-center gap-4">
        <span
          className="badge border shadow hover:bg-[#0079bf] hover:text-white cursor-pointer"
          onClick={() => {
            handleCategoryClick(34);
          }}
        >
          Alimentos
        </span>
        <span
          className="badge border shadow hover:bg-[#0079bf] hover:text-white cursor-pointer"
          onClick={() => {
            handleCategoryClick(35);
          }}
        >
          Limpieza
        </span>
      </div>
      {/* Aquí iría la lógica para listar las órdenes del vendedor */}
      {sellerOrders?.length > 0 ? (
        <ul>
          {sellerOrders.map((order, key) => (
            <SellerOrderItem key={key} order={order} />
          ))}
        </ul>
      ) : (
        <p>No hay órdenes disponibles.</p>
      )}
    </div>
  );
};

export default SellerOrdersPage;
