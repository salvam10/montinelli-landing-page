import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getClientInvoices } from "../../api/receivablesApi";

/** Obtener facturas de un cliente específico */
export const fetchClientInvoices = createAsyncThunk(
  "clientInvoices/fetchClientInvoices",
  async (clientId, thunkAPI) => {
    try {
      return await getClientInvoices(clientId);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.message || "Error al obtener facturas"
      );
    }
  }
);

const clientInvoicesSlice = createSlice({
  name: "clientInvoices",
  initialState: {
    items: [],
    isLoading: false,
    hasError: false,
    error: null,
    clientId: null,
  },
  reducers: {
    clearInvoices: (state) => {
      state.items = [];
      state.clientId = null;
      state.hasError = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientInvoices.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        state.error = null;
      })
      .addCase(fetchClientInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.clientId = action.meta.arg;
      })
      .addCase(fetchClientInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = true;
        state.error = action.payload || "Error al cargar facturas";
      });
  },
});

export const { clearInvoices } = clientInvoicesSlice.actions;
export default clientInvoicesSlice.reducer;
