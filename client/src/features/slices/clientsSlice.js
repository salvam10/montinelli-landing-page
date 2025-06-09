import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/* Obtener todos los clientes */
export const getClients = createAsyncThunk(
  "clients/getClients",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/clients/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error desconocido"
      );
    }
  }
);

/* Obtener un cliente por ID */
export const getSingleClient = createAsyncThunk(
  "clients/getSingleClient",
  async ({ id }, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener cliente:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error desconocido"
      );
    }
  }
);

/* Crear un nuevo cliente */
export const createClient = createAsyncThunk(
  "clients/createClient",
  async (
    {
      rif,
      name,
      phone,
      legal_representative,
      street_address,
      city,
      municipality,
      state,
      formData,
      sunagro_code,
      profit_code,
      created_at,
      user_id,
    },
    thunkAPI
  ) => {
    try {
      const clientData = {
        rif,
        name,
        phone,
        legal_representative,
        street_address,
        city,
        municipality,
        state,
        sunagro_code,
        profit_code,
        created_at,
        user_id,
      };

      const clientResponse = await axios.post(
        `${SERVER_URL}/api/clients/`,
        clientData
      );
      const clientId = clientResponse.data.id;

      if (formData && formData.get("file")) {
        const uploadResponse = await axios.post(
          `${SERVER_URL}/api/firebase/upload/${clientId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        return {
          ...clientResponse.data,
          rif_url: uploadResponse.data.url,
        };
      }

      return clientResponse.data;
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error desconocido"
      );
    }
  }
);

/* Actualizar un cliente */
export const updateClient = createAsyncThunk(
  "clients/updateClient",
  async (client, thunkAPI) => {
    try {
      const { id, ...clientData } = client;
      const clientResponse = await axios.put(
        `${SERVER_URL}/api/clients/${id}`,
        clientData
      );
      if (clientData.formData && clientData.formData.get("file")) {
        const uploadResponse = await axios.post(
          `${SERVER_URL}/api/firebase/upload/${id}`,
          clientData.formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        return {
          ...clientResponse.data,
          rif_url: uploadResponse.data.url,
        };
      }

      return clientResponse.data;
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error desconocido"
      );
    }
  }
);

/* Slice */
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
    resetClient: (state) => {
      state.client = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getClients.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getClients.fulfilled, (state, action) => {
        state.isLoading = false;
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
        state.client = action.payload;
      })
      .addCase(getSingleClient.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(createClient.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.newClient = action.payload;
      })
      .addCase(createClient.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(updateClient.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.isLoading = false;
        state.client = action.payload;
      })
      .addCase(updateClient.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});

export const { resetClient } = clientsSlice.actions;

export default clientsSlice.reducer;
