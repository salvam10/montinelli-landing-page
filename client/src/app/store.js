import { configureStore } from "@reduxjs/toolkit";
import productsReducer from "../features/slices/productsSlice";
import clientsReducer from "../features/slices/clientsSlice";
import usersReducer from "../features/slices/usersSlice";
import cartReducer from "../features/slices/cartSlice";
import categoriesReducer from "../features/slices/categoriesSlice";
import ordersReducer from "../features/slices/ordersSlice";
import paymentTermsReducer from "../features/slices/paymentTermsSlice";
import marketProductsReducer from "../features/slices/marketProductsSlice";
import marketCheckReducer from "../features/slices/marketCheckSlice";
import brandsReducer from "../features/slices/brandsSlice";
import paymentsReducer from "../features/slices/paymentsSlice";
import orderItemsReducer from "../features/slices/orderItemsSlice";
import sellerReceivablesReducer from "../features/slices/sellerReceivablesSlice";
import clientInvoicesReducer from "../features/slices/clientInvoicesSlice";
import sellerPaymentsReducer from "../features/slices/sellerPaymentsSlice";
import pendingReceiptsReducer from "../features/slices/pendingReceiptsSlice";

export const store = configureStore({
  reducer: {
    products: productsReducer,
    users: usersReducer,
    cart: cartReducer,
    clients: clientsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    paymentTerms: paymentTermsReducer,
    marketProducts: marketProductsReducer,
    marketChecks: marketCheckReducer,
    brands: brandsReducer,
    payments: paymentsReducer,
    orderItems: orderItemsReducer,
    sellerReceivables: sellerReceivablesReducer,
    clientInvoices: clientInvoicesReducer,
    sellerPayments: sellerPaymentsReducer,
    pendingReceipts: pendingReceiptsReducer,
  },
});
