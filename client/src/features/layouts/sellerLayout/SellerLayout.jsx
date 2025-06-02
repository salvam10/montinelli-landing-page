import React, { useEffect, useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AuthContext } from "../../../App";
import NavBar from "../../navBar/NavBar";
import { retrieveCart } from "../../slices/cartSlice";
const SellerLayout = () => {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.id) {
      dispatch(retrieveCart({ userId: user.id }));
    }
  }, [user, dispatch]);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!["seller", "superadmin"].includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="">
      <NavBar />
      <Outlet />
    </div>
  );
};

export default SellerLayout;
