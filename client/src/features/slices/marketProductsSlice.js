import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import { fetchAddUser, fetchAuthLocalUser } from "../../api/usersApi";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const getAllProducts = createAsyncThunk(
  "products/getAllProducts",
  async (arg, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/products/`);
      const products = response.data;
      return products;
    } catch (error) {
      console.log(error);
    }
  }
);

export const getProductsByCategory = createAsyncThunk(
  "products/getProductsByCategory",
  async ({ categoryId }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/products/category/${categoryId}`
      );
      const products = response.data;
      return products;
    } catch (error) {
      console.log(error);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    bsExchangeRate: 36.6,
    hasError: false,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.products = action.payload;
      })
      .addCase(getAllProducts.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(getProductsByCategory.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.products = action.payload;
      })
      .addCase(getProductsByCategory.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});

export default productsSlice.reducer;
