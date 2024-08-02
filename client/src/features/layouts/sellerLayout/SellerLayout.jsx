import React, { useEffect } from "react";
import { AuthContext } from "../../../App";
import { Outlet, Navigate } from "react-router-dom";

const SellerLayout = () => {
  const { user } = React.useContext(AuthContext);

  useEffect(() => {
  }, [user]);
  return (
    <div className="">
      {user?.role === "admin" || user?.role === "seller" ? (
        <Outlet />
      ) : (
        <Navigate to="/" />
      )}
    </div>
  );
};

export default SellerLayout;
