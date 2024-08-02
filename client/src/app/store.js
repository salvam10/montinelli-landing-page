import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "../features/slices/productsSlice";
import clientsReducer from "../features/slices/clientsSlice";
import usersReducer from "../features/slices/usersSlice";
import cartReducer from "../features/slices/cartSlice";
import categoriesReducer from "../features/slices/categoriesSlice";
import ordersReducer from "../features/slices/ordersSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    users: usersReducer,
    cart: cartReducer,
    clients: clientsReducer,
    categories: categoriesReducer,
    orders: ordersReducer
  },
});
