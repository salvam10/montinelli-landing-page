import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/* Obtener todos los clientes */
export const getClients = createAsyncThunk(
  "clients/getClients",
  async (arg, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/clients/`);
      const clients = response.data;
      return clients;
    } catch (error) {
      console.log(error);
    }
  }
);

/* Obtener un solo cliente */
export const getSingleClient = createAsyncThunk(
  "clients/getSingleClient",
  async ({rif}, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/clients/${rif}`);
      const client = response.data;
      return client;
    } catch (error) {
      console.log(error);
    }
  }
);

/* crear un cliente */
export const createClient = createAsyncThunk(
  "clients/createClient",
  async (
    {
      rif,
      name,
      mobile_phone,
      local_phone,
      legal_representative,
      street_address,
      city,
      municipality,
      state,
    },
    thunkAPI
  ) => {
    try {
      console.log("rif:", rif);
      console.log("name:", name);
      console.log("mobile_phone:", mobile_phone);
      console.log("local_phone:", local_phone);
      console.log("legal_representative:", legal_representative);
      console.log("street_address:", street_address);
      console.log("city:", city);
      console.log("municipality:", municipality);
      console.log("state:", state);
      const response = await axios.post(`${SERVER_URL}/api/clients/`, {
        rif,
        name,
        mobile_phone,
        local_phone,
        legal_representative,
        street_address,
        city,
        municipality,
        state,
      });
      const newClient = response.data;
      return newClient;
    } catch (error) {
      console.log(error);
    }
  }
);

const clientsSlice = createSlice({
  name: "clients",
  initialState: {
    clients: [],
    client: {},
    newClient: {},
    hasError: false,
    isLoading: false,
  },
  reducers: {
    resetClient: (state, action) => {
      state.client = {}      
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClient.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.newClient = action.payload;
      })
      .addCase(createClient.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(getClients.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getClients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.clients = action.payload;
      })
      .addCase(getClients.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
    .addCase(getSingleClient.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getSingleClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.client = action.payload;
      })
      .addCase(getSingleClient.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});


export const { resetClient } = clientsSlice.actions;

export default clientsSlice.reducer;
