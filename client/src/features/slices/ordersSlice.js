import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const getOrders = createAsyncThunk(
  "orders/getOrders",
  async (arg, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/orders/`);
      const orders = response.data;
      return orders;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async ({orderId}, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/orders/${orderId}`);
      const order = response.data;
      return order;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getProductsByOrderId = createAsyncThunk(
  "orders/getProductsByOrderId",
  async ({ orderId }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/orders/${orderId}/items`
      );
      const orderProducts = response.data;
      return orderProducts;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getClientByOrderId = createAsyncThunk(
  "orders/getClientByOrderId",
  async ({ orderId }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/orders/${orderId}/client`
      );
      const orderClient = response.data;
      return orderClient;
    } catch (error) {
      console.log(error);
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (
    {
      user_id,
      payment_status,
      subtotal,
      shipping_cost,
      shipping_status,
      total,
      payment_method,
      client_id,
      productsInCart,
    },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/orders/user/${user_id}`,
        {
          payment_status,
          subtotal,
          shipping_cost,
          shipping_status,
          total,
          payment_method,
          client_id,
        }
      );
      const newOrder = response.data;

      const addedProducts = [];
      productsInCart?.forEach(async (product) => {
        const second_response = await axios.post(
          `${SERVER_URL}/api/orders/${newOrder.id}/items`,
          {
            product_id: product.id,
            quantity: product.quantity,
            price: product.base_price,
            tax_percentage: product.tax_percentage
          }
        );
        addedProducts.push(second_response.data);
        return { newOrder, addedProducts };
      });
    } catch (error) {
      console.log(error);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async ({ orderId }, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${SERVER_URL}/api/orders/${orderId}`
      );
      const deletedOrder = response.data;
      return deletedOrder;
    } catch (error) {
      console.log(error);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    order:{},
    newOrder: {},
    orderClient: {},
    orderProducts: [],
    hasError: false,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
        .addCase(getOrders.pending, (state) => {
          state.isLoading = true;
          state.hasError = false;
        })
        .addCase(getOrders.fulfilled, (state, action) => {
          state.isLoading = false;
          state.hasError = false;
          state.orders = action.payload;
        })
        .addCase(getOrders.rejected, (state) => {
          state.isLoading = false;
          state.hasError = true;
        })
        .addCase(getOrderById.pending, (state) => {
          state.isLoading = true;
          state.hasError = false;
        })
        .addCase(getOrderById.fulfilled, (state, action) => {
          state.isLoading = false;
          state.hasError = false;
          state.order = action.payload;
        })
        .addCase(getOrderById.rejected, (state) => {
          state.isLoading = false;
          state.hasError = true;
        })
        .addCase(getProductsByOrderId.pending, (state) => {
          state.isLoading = true;
          state.hasError = false;
        })
        .addCase(getProductsByOrderId.fulfilled, (state, action) => {
          state.isLoading = false;
          state.hasError = false;
          state.orderProducts = action.payload;
        })
        .addCase(getProductsByOrderId.rejected, (state) => {
          state.isLoading = false;
          state.hasError = true;
        })
        .addCase(getClientByOrderId.pending, (state) => {
          state.isLoading = true;
          state.hasError = false;
        })
        .addCase(getClientByOrderId.fulfilled, (state, action) => {
          state.isLoading = false;
          state.hasError = false;
          state.orderClient = action.payload;
        })
        .addCase(getClientByOrderId.rejected, (state) => {
          state.isLoading = false;
          state.hasError = true;
        })
        .addCase(createOrder.pending, (state) => {
          state.isLoading = true;
          state.hasError = false;
        })
        .addCase(
          createOrder.fulfilled,
          (state, { newOrder, addedProducts }) => {
            state.isLoading = false;
            state.hasError = false;
            state.newOrder = newOrder;
            state.orderProducts = addedProducts;
          }
        )
        .addCase(createOrder.rejected, (state) => {
          state.isLoading = false;
          state.hasError = true;
        })
        .addCase(deleteOrder.pending, (state) => {
          state.isLoading = true;
          state.hasError = false;
        })
        .addCase(deleteOrder.fulfilled, (state, action) => {
          state.isLoading = false;
          state.hasError = false;
          const deletedOrder = action.payload;
          state.orders = current(state).orders.filter(
            (order) => order.id !== deletedOrder.id
          );
        })
        .addCase(deleteOrder.rejected, (state) => {
          state.isLoading = false;
          state.hasError = true;
        });
  },
});

export default ordersSlice.reducer;
