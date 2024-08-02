import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate, useLoaderData } from "react-router-dom";
/* state */
import { AuthContext } from "../../../App";
/* components */
import NavBar from "../../navBar/NavBar";

const ProtectedLayout = () => {
  const { user } = React.useContext(AuthContext);

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
