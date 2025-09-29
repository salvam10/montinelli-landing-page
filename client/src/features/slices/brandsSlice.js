import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import { fetchAddUser, fetchAuthLocalUser } from "../../api/usersApi";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const getBrands = createAsyncThunk(
  "brands/getBrands",
  async (arg, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/brands/`);
      const products = response.data;
      return products;
    } catch (error) {
      console.log(error);
    }
  }
);


const brandsSlice = createSlice({
  name: "brands",
  initialState: {
    brands: [],
    hasError: false,
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getBrands.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.brands = action.payload;
      })
      .addCase(getBrands.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
  },
});

export default brandsSlice.reducer;
