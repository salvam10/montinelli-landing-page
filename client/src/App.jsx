import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
/* Pages */
import SuccesfullPage from "./pages/SuccesfullPage/SuccesfullPage";
import CheckoutPage from "./pages/CheckoutPage/CheckoutPage";
import OrdersPage from "./pages/ordersPage.jsx/OrdersPage";
import CartPage from "./pages/CartPage.jsx/CartPage.jsx";
import CedulaLoginPage from "./pages/LoginPage/CedulaLoginPage.jsx";
import HomePage from "./pages/HomePage/HomePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage/PrivacyPolicyPage.jsx";
/* Layouts */
import SellerLayout from "./features/layouts/sellerLayout/SellerLayout";
import AdminLayout from "./features/layouts/adminLayout/AdminLayout";
import CategoriesPage from "./pages/CategoriesPage/CategoriesPage";
import AuthLayout from "./features/layouts/authLayout/AuthLayout";
import SellerOrdersPage from "./pages/SellerOrdersPage/SellerOrdersPage.jsx";
/* Components */
import Category from "./features/category/Category";
import Order from "./features/order/Order";
/* Css */
import "./App.css";
import SellerSingleOrder from "./features/sellerSingleOrder/SellerSingleOrder.jsx";
import CreateOrderPage from "./pages/CreateOrderPage/CreateOrderPage.jsx";
import ClientsPage from "./pages/ClientsPage/ClientsPage.jsx";
import CreateClientPage from "./pages/CreateClientPage/CreateClientPage.jsx";
import ClientDetailPage from "./pages/ClientDetailPage/ClientDetailPage.jsx";
import AccountsReceivablePage from "./pages/AccountsReceivablePage/AccountsReceivablePage.jsx";

export const AuthContext = React.createContext();

const App = () => {
  const redux_user = useSelector((state) => state.users.user);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const contextValues = {
    user,
    setUser,
  };

  useEffect(() => {
    console.log("succesfull launch");
  }, []);

  const dispatch = useDispatch();

  useEffect(() => {
    if (redux_user) {
      localStorage.setItem("user", JSON.stringify(redux_user));
      setUser(JSON.parse(localStorage.getItem("user")));
    }
  }, [redux_user]);

  return (
    <AuthContext.Provider value={contextValues}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<CedulaLoginPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          </Route>
          <Route element={<SellerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="mis-pedidos" element={<SellerOrdersPage />} />
            <Route path="orders/:orderId" element={<SellerSingleOrder />} />
            <Route path="categorias" element={<CategoriesPage />} />
            <Route path="categorias/:name" element={<Category />} />
            <Route path="carrito" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-confirmation" element={<SuccesfullPage />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<Navigate to="orders/category/34" replace />}
            />
            <Route path="orders" element={<OrdersPage />} />
            <Route
              path="orders/category/:prodCategoryId"
              element={<OrdersPage />}
            />
            <Route path="orders/:id" element={<Order />} />
            <Route path="orders/create" element={<CreateOrderPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route
              path="accounts-receivable"
              element={<AccountsReceivablePage />}
            />
            <Route path="clients/:id" element={<ClientDetailPage />} />
            <Route path="clients/create" element={<CreateClientPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

export default App;
