import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const getOrders = createAsyncThunk(
  "orders/getOrders",
  async ({ manager_approval_status, product_category_id }, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/orders/`, {
        params: { manager_approval_status, product_category_id },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getAllOrders = createAsyncThunk(
  "orders/getAllOrders",
  async ({ product_category_id }, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/orders/`, {
        params: { product_category_id },
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async ({ orderId }, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getSellerOrders = createAsyncThunk(
  "orders/getrSellerOrders",
  async ({ userId, product_category_id }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/orders/seller/${userId}`,
        { params: { product_category_id } }
      );
      return response.data;
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
      return response.data;
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
      return response.data;
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

      for (const product of productsInCart) {
        const res = await axios.post(
          `${SERVER_URL}/api/orders/${newOrder.id}/items`,
          {
            product_id: product.id,
            quantity: product.quantity,
            price: product.base_price,
            tax_percentage: product.tax_percentage,
          }
        );
        addedProducts.push(res.data);
      }

      return { newOrder, addedProducts };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createSplitOrders = createAsyncThunk(
  "orders/createSplitOrders",
  async (
    {
      user_id,
      client_id,
      payment_method,
      payment_status_id,
      shipping_status,
      shipping_cost,
      productsInCart,
      invoice_date,
      invoice_number,
      manager_approval_status,
      created_at,
    },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/orders/split-by-category`,
        {
          user_id,
          client_id,
          payment_method,
          payment_status_id,
          shipping_status,
          shipping_cost,
          invoice_date,
          invoice_number,
          manager_approval_status,
          products: productsInCart,
          created_at,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async ({ orderId }, thunkAPI) => {
    try {
      const response = await axios.put(`${SERVER_URL}/api/orders/${orderId}`, {
        status: "eliminada",
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async (
    {
      orderId,
      status,
      payment_status_id,
      invoice_number,
      invoice_date,
      payment_term_id,
      due_date,
      manager_approval_status,
      shipping_status,
      shipping_company,
      scheduled_dispatch_date,
      actual_dispatch_date,
    },
    { dispatch }
  ) => {
    try {
      const response = await axios.put(`${SERVER_URL}/api/orders/${orderId}`, {
        status,
        invoice_number,
        invoice_date,
        payment_status_id,
        payment_term_id,
        due_date,
        manager_approval_status,
        shipping_company,
        scheduled_dispatch_date,
        actual_dispatch_date,
        shipping_status,
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    allOrders: [],
    order: {},
    sellerOrders: null,
    newOrder: {},
    orderClient: {},
    orderProducts: [],
    orderStatuses: [],
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

      .addCase(getAllOrders.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.allOrders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      .addCase(getOrderById.fulfilled, (state, action) => {
        state.order = action.payload;
      })
      .addCase(getProductsByOrderId.fulfilled, (state, action) => {
        state.orderProducts = action.payload;
      })
      .addCase(getClientByOrderId.fulfilled, (state, action) => {
        state.orderClient = action.payload;
      })

      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.newOrder = payload.newOrder;
        state.orderProducts = payload.addedProducts;
      })
      .addCase(createSplitOrders.fulfilled, (state, action) => {
        state.orders.push(...action.payload);
        state.orderProducts = [];
        state.newOrder = {};
      })

      .addCase(deleteOrder.fulfilled, (state, action) => {
        const deletedOrder = action.payload;
        state.orders = current(state).orders.filter(
          (order) => order.id !== deletedOrder.id
        );
      })

      .addCase(updateOrder.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        state.orders = current(state).orders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        );
      })

      .addCase(getSellerOrders.fulfilled, (state, action) => {
        state.sellerOrders = action.payload;
      });
  },
});

export default ordersSlice.reducer;
