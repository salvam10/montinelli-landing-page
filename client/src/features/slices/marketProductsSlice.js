import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import { fetchAddUser, fetchAuthLocalUser } from "../../api/usersApi";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const getAllMarketProducts = createAsyncThunk(
  "products/getAllMarketProducts",
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

export const getMarketProductsByCat = createAsyncThunk(
  "products/getMarketProductsByCat",
  async ({ categoryId }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/market-products/category/${categoryId}`
      );
      const products = response.data.data;
      return products;
    } catch (error) {
      console.log(error);
    }
  }
);

const marketProductsSlice = createSlice({
  name: "marketProducts",
  initialState: {
    marketProducts: [],
    bsExchangeRate: 36.6,
    hasError: false,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllMarketProducts.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getAllMarketProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.marketProducts = action.payload;
      })
      .addCase(getAllMarketProducts.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(getMarketProductsByCat.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getMarketProductsByCat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.marketProducts = action.payload;
      })
      .addCase(getMarketProductsByCat.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});

export default marketProductsSlice.reducer;
