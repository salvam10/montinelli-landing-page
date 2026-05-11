import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getSellerClients } from "../../api/clientsApi";

/* Obtener clientes de un vendedor con métricas de cobranzas */
export const fetchSellerReceivables = createAsyncThunk(
  "sellerReceivables/fetchSellerReceivables",
  async (userId, thunkAPI) => {
    try {
      return await getSellerClients(userId);
    } catch (error) {
      console.error("Error al obtener cuentas por cobrar del vendedor:", error);
      return thunkAPI.rejectWithValue(
        error.message || error.response?.data?.message || "Error desconocido"
      );
    }
  }
);

const sellerReceivablesSlice = createSlice({
  name: "sellerReceivables",
  initialState: {
    items: [],
    isLoading: false,
    hasError: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellerReceivables.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        state.error = null;
      })
      .addCase(fetchSellerReceivables.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchSellerReceivables.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = true;
        state.error = action.payload || "Error al cargar los datos";
      });
  },
});

export default sellerReceivablesSlice.reducer;
