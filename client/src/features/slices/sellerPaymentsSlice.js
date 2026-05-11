import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSellerPayments, reportPayment } from "../../api/receivablesApi";

/** Obtener pagos reportados por el vendedor */
export const fetchSellerPayments = createAsyncThunk(
  "sellerPayments/fetchSellerPayments",
  async (userId, thunkAPI) => {
    try {
      return await getSellerPayments(userId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Error al obtener pagos del vendedor"
      );
    }
  }
);

/** Reportar un nuevo pago */
export const submitPaymentReport = createAsyncThunk(
  "sellerPayments/submitPaymentReport",
  async (paymentData, thunkAPI) => {
    try {
      return await reportPayment(paymentData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Error al reportar el pago"
      );
    }
  }
);

const sellerPaymentsSlice = createSlice({
  name: "sellerPayments",
  initialState: {
    items: [],
    isLoading: false,
    hasError: false,
    error: null,
    isSubmitting: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerPayments.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        state.error = null;
      })
      .addCase(fetchSellerPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSellerPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = true;
        state.error = action.payload || "Error al cargar los pagos";
      })
      .addCase(submitPaymentReport.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(submitPaymentReport.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(submitPaymentReport.rejected, (state, action) => {
        state.isSubmitting = false;
        state.hasError = true;
        state.error = action.payload || "Error al reportar el pago";
      });
  },
});

export default sellerPaymentsSlice.reducer;
