import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";
/* Pages */
import SuccesfullPage from "./pages/SuccesfullPage/SuccesfullPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import OrdersPage from "./pages/ordersPage.jsx/OrdersPage";
import CartPage from "./pages/CartPage.jsx/CartPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/HomePage/HomePage";
/* Layouts */
import SellerLayout from "./features/layouts/sellerLayout/SellerLayout";
import AdminLayout from "./features/layouts/adminLayout/AdminLayout";
import CategoriesPage from "./pages/CategoriesPage/CategoriesPage";
import AuthLayout from "./features/layouts/authLayout/AuthLayout";
import ProtectedLayout from "./features/layouts/protectedLayout/ProtectedLayout";
/* Components */
import Category from "./features/category/Category";
import Order from "./features/order/Order";
/* Css */
import "./App.css";

export const AuthContext = React.createContext();

const App = () => {
  const redux_user = useSelector((state) => state.users.user);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const contextValues = {
    user,
    setUser,
  };

  const dispatch = useDispatch();

  useEffect(() => {
    if (redux_user) {
      localStorage.setItem("user", JSON.stringify(redux_user));
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, [redux_user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Trial />} />
        <Route path="/signin" element={<Hey />} />
      </Routes>
    </BrowserRouter>
  );
};

const Trial = () => {
  return (<div className="font-bold">HOLA MUNDOOOOO</div>)
}


const Hey = () => {
  return <div className="font-bold">Hello motoooo</div>;
};


export default App;
/*  */
