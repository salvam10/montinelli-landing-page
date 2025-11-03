import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/* ============================================================
   Async Thunks
============================================================ */

/* Obtener items de una orden */
export const getOrderItemsByOrderId = createAsyncThunk(
  "orderItems/getOrderItemsByOrderId",
  async (order_id, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/order-items/order/${order_id}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* Crear un nuevo item */
export const createOrderItem = createAsyncThunk(
  "orderItems/createOrderItem",
  async (
    { order_id, product_id, quantity, price, tax_percentage, discount_pct = 0 },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/order-items/order/${order_id}`,
        {
          product_id,
          quantity,
          price,
          tax_percentage,
          discount_pct,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* Actualizar un item (usa order_id + product_id como clave) */
export const updateOrderItem = createAsyncThunk(
  "orderItems/updateOrderItem",
  async (
    { order_id, product_id, quantity, price, discount_pct = 0, tax_percentage },
    thunkAPI
  ) => {
    try {
      const response = await axios.put(
        `${SERVER_URL}/api/order-items/order/${order_id}/product/${product_id}`,
        {
          quantity,
          price,
          discount_pct,
          tax_percentage,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* Eliminar un item (usa order_id + product_id) */
export const deleteOrderItem = createAsyncThunk(
  "orderItems/deleteOrderItem",
  async ({ order_id, product_id }, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${SERVER_URL}/api/order-items/order/${order_id}/product/${product_id}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Añadir múltiples productos a una orden
export const addOrderItemsBulk = createAsyncThunk(
  "orderItems/addOrderItemsBulk",
  async ({ orderId, products }, thunkAPI) => {
    try {
      if (!Array.isArray(products) || products.length === 0) {
        throw new Error("El array de productos está vacío o es inválido.");
      }

      const response = await axios.post(
        `${SERVER_URL}/api/order-items/order/${orderId}/items/bulk`,
        { products }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message || "Error al agregar productos"
      );
    }
  }
);



/* Actualizar múltiples ítems */
export const updateMultipleOrderItems = createAsyncThunk(
  "orderItems/updateMultipleOrderItems",
  async ({ order_id, items }, thunkAPI) => {
    try {
      const sanitizedItems = items.map((i) => ({
        ...i,
        discount_pct: i.discount_pct ?? 0,
      }));

      const response = await axios.put(
        `${SERVER_URL}/api/order-items/order/${order_id}/bulk`,
        { items: sanitizedItems }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ============================================================
   Slice Definition
============================================================ */

const orderItemsSlice = createSlice({
  name: "orderItems",
  initialState: {
    orderItems: [],
    isLoading: false,
    hasError: false,
  },
  reducers: {
    clearOrderItems: (state) => {
      state.orderItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrderItemsByOrderId.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getOrderItemsByOrderId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderItems = action.payload;
      })
      .addCase(getOrderItemsByOrderId.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      .addCase(createOrderItem.fulfilled, (state, action) => {
        state.orderItems.push(action.payload);
      })

      .addCase(updateOrderItem.fulfilled, (state, action) => {
        const updated = action.payload;
        state.orderItems = state.orderItems.map((item) =>
          item.product_id === updated.product_id ? updated : item
        );
      })

      .addCase(deleteOrderItem.fulfilled, (state, action) => {
        const deleted = action.payload;
        state.orderItems = state.orderItems.filter(
          (item) => item.product_id !== deleted.product_id
        );
      })

      .addCase(updateMultipleOrderItems.fulfilled, (state, action) => {
        const updatedItems = action.payload;
        state.orderItems = state.orderItems.map((item) => {
          const updated = updatedItems.find(
            (u) => u.product_id === item.product_id
          );
          return updated ? updated : item;
        });
      })
      .addCase(addOrderItemsBulk.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(addOrderItemsBulk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const newItems = action.payload;
        const existingIds = new Set(state.orderItems.map((i) => i.product_id));

        state.orderItems.push(
          ...newItems.filter((item) => !existingIds.has(item.product_id))
        );
      })
      .addCase(addOrderItemsBulk.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = true;
        console.error("Error al agregar productos:", action.payload);
      });
  },
});

export const { clearOrderItems } = orderItemsSlice.actions;
export default orderItemsSlice.reducer;
