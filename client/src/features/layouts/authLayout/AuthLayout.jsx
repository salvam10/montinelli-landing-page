import React, { useState } from "react";
import { AuthContext } from "../../../App";
/* React Router */
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const { user } = React.useContext(AuthContext);

  return <>{!user ? <Outlet /> : <Navigate to="/" />}</>;
};

export default AuthLayout;
