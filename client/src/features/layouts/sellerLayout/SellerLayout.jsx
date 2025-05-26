import React, { useEffect } from "react";
import { AuthContext } from "../../../App";
import { Outlet, Navigate } from "react-router-dom";
import NavBar from "../../navBar/NavBar"; // Asegúrate de importar esto si no lo has hecho

const SellerLayout = () => {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (user.role !== "seller" && user.role !== "superadmin") {
    console.log('no soy superadmin');
    
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
