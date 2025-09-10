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

/* Obtener las ordenes de un vendedor */
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

/*Obtener Ordenes de un cliente  */
export const getClientOrders = createAsyncThunk(
  "orders/getClientOrders",
  async ({ clientId, product_category_id }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/orders/client/${clientId}`,
        { params: { product_category_id } }
      );
      const clientOrders = response.data;
      return { product_category_id, clientOrders };
    } catch (error) {
      console.error("Error en getClientOrders", error);
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error inesperado"
      );
    }
  }
);

/* Obtener los productos de una orden */
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

/* Obtener el cliente de una orden */
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

/* Crear Orden */
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

/*  Crear ordenes separadas por categoria de producto */
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

/* Eliminar Orden */
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

/* Actualizar Orden */
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
    console.log('due_date', due_date);
    
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
    clientFoodOrders: [],
    clientCleaningOrders: [],
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
      // GET ORDERS
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

      // GET ALL ORDERS
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

      // GET ORDER BY ID
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

      // GET PRODUCTS BY ORDER ID
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

      // GET CLIENT BY ORDER ID
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

      // CREATE ORDER
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.hasError = false;
        state.newOrder = payload.newOrder;
        state.orderProducts = payload.addedProducts;
      })
      .addCase(createOrder.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      // CREATE SPLIT ORDERS
      .addCase(createSplitOrders.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(createSplitOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.orders.push(...action.payload);
        state.orderProducts = [];
        state.newOrder = {};
      })
      .addCase(createSplitOrders.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      // DELETE ORDER
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const deletedOrder = action.payload;
        state.orders = state.orders.filter(
          (order) => order.id !== deletedOrder.id
        );
      })
      .addCase(deleteOrder.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      // UPDATE ORDER
      .addCase(updateOrder.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const updatedOrder = action.payload;
        state.orders = state.orders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        );
      })
      .addCase(updateOrder.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      // GET SELLER ORDERS
      .addCase(getSellerOrders.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getSellerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.sellerOrders = action.payload;
      })
      .addCase(getSellerOrders.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      // GET CLIENT ORDERS
      .addCase(getClientOrders.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getClientOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;

        const { product_category_id, clientOrders } = action.payload || {};

        if (!product_category_id || !clientOrders) return;

        if (product_category_id === 34) {
          state.clientFoodOrders = clientOrders;
        } else {
          state.clientCleaningOrders = clientOrders;
        }
      })

      .addCase(getClientOrders.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});

export default ordersSlice.reducer;
