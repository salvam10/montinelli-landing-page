import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getPendingReceipts,
  reportPayment,
  updatePaymentStatus,
} from "../../api/receivablesApi";

/** Obtener pagos con comprobante para validación (admin) */
export const fetchPendingReceipts = createAsyncThunk(
  "pendingReceipts/fetchPendingReceipts",
  async (_, thunkAPI) => {
    try {
      return await getPendingReceipts();
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Error al obtener comprobantes"
      );
    }
  }
);

/** Validar o rechazar un pago (admin) */
export const changePaymentStatus = createAsyncThunk(
  "pendingReceipts/changePaymentStatus",
  async ({ paymentId, status }, thunkAPI) => {
    try {
      return await updatePaymentStatus(paymentId, status);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Error al actualizar estado"
      );
    }
  }
);

export const submitAdminPaymentReport = createAsyncThunk(
  "pendingReceipts/submitAdminPaymentReport",
  async (paymentData, thunkAPI) => {
    try {
      return await reportPayment(paymentData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Error al registrar el pago"
      );
    }
  }
);

const pendingReceiptsSlice = createSlice({
  name: "pendingReceipts",
  initialState: {
    items: [],
    isLoading: false,
    hasError: false,
    error: null,
    isSubmittingPayment: false,
    submitError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingReceipts.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        state.error = null;
      })
      .addCase(fetchPendingReceipts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchPendingReceipts.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = true;
        state.error = action.payload || "Error al cargar comprobantes";
      })
      .addCase(submitAdminPaymentReport.pending, (state) => {
        state.isSubmittingPayment = true;
        state.submitError = null;
      })
      .addCase(submitAdminPaymentReport.fulfilled, (state) => {
        state.isSubmittingPayment = false;
      })
      .addCase(submitAdminPaymentReport.rejected, (state, action) => {
        state.isSubmittingPayment = false;
        state.submitError = action.payload || "Error al registrar el pago";
      })
      .addCase(changePaymentStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((p) => p.id === updated.id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], status: updated.status };
        }
      });
  },
});

export default pendingReceiptsSlice.reducer;
