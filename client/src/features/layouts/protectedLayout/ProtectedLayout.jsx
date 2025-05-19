import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate, useLoaderData } from "react-router-dom";
/* state */
import { AuthContext } from "../../../App";
/* components */
import NavBar from "../../navBar/NavBar";
import { retrieveCart } from "../../slices/cartSlice";

const ProtectedLayout = () => {
  const { user } = React.useContext(AuthContext);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
    
      dispatch(retrieveCart({ userId: user.id }));
    }
  }, [user]);

  return user ? (
    <div className="">
      <NavBar />
      <Outlet />
    </div>
  ) : (
    <Navigate to="/signin" />
  );
};

export default ProtectedLayout;
