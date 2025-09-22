import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// Thunk: envía el market check al backend
export const submitMarketCheck = createAsyncThunk(
  "marketChecks/submit",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${SERVER_URL}/api/market-checks`,
        payload
      );
      // Se espera algo como { survey_id: 123 }
      return data;
    } catch (err) {
      // Si el backend responde con error, axios lo expone en err.response
      if (err.response) {
        return rejectWithValue({
          status: err.response.status,
          message: err.response.data?.message || "Error en el servidor",
        });
      }
      return rejectWithValue({
        status: 0,
        message: err.message || "Error de red",
      });
    }
  }
);

const marketChecksSlice = createSlice({
  name: "marketChecks",
  initialState: {
    isLoading: false,
    hasError: false,
    errorMessage: null,
    lastSurveyId: null,
  },
  reducers: {
    clearSubmitState: (state) => {
      state.isLoading = false;
      state.hasError = false;
      state.errorMessage = null;
      state.lastSurveyId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitMarketCheck.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        state.errorMessage = null;
        state.lastSurveyId = null;
      })
      .addCase(submitMarketCheck.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.errorMessage = null;
        state.lastSurveyId = action.payload?.survey_id ?? null;
      })
      .addCase(submitMarketCheck.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = true;
        state.errorMessage = action.payload?.message || "Error al enviar";
      });
  },
});

export const { clearSubmitState } = marketChecksSlice.actions;
export default marketChecksSlice.reducer;
