import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const getPaymentTerms = createAsyncThunk(
  "paymentTerms/getPaymentTerms",
  async (arg, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/payment-terms`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);


const paymentTermsSlice = createSlice({
  name: "paymentTerms",
  initialState: {
    paymentTerms: [],
    isLoading: false,
    hasError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentTerms.pending, (state) => {
        state.isLoading = true;
        state.hasError = null;
      })
      .addCase(getPaymentTerms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentTerms = action.payload;
      })
      .addCase(getPaymentTerms.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = action.payload;
      });
  },
});

export default paymentTermsSlice.reducer;
