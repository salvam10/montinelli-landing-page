import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import { fetchAddUser, fetchAuthLocalUser } from "../../api/usersApi";
import axios from "axios";
import ClientPayments from "../clientPayments/ClientPayments";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// Obtener pagos realizados por un cliente
export const getPaymentsByClientId = createAsyncThunk(
  "payments/getPaymentsByClientId",
  async ({ clientId }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/payments/client/${clientId}`
      );
      const clientPayments = response.data;
      return clientPayments;
    } catch (error) {
      console.log(error);
    }
  }
);

export const registerClientPayment = createAsyncThunk(
  "payments/registerClientPayment",
  async (
    { client_id, amount, paid_at, created_at, status, currency_code },
    thunkAPI
  ) => {
    try {
      const response = await axios.post(`${SERVER_URL}/api/payments`, {
        client_id,
        amount,
        paid_at,
        created_at,
        currency_code,
        status,
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState: {
    hasError: false,
    isLoading: false,
    clientPayments: [],
    newClientPayment: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentsByClientId.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getPaymentsByClientId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.clientPayments = action.payload;
      })
      .addCase(getPaymentsByClientId.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(registerClientPayment.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(registerClientPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.newClientPayment = action.payload;
      })
      .addCase(registerClientPayment.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});

export default paymentsSlice.reducer;
