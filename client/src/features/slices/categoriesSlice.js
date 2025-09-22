import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/* Obtener todos los clientes */
export const getCategories = createAsyncThunk(
  "categories/getCategories",
  async (
    { names = [], active, level, parent_id = [] } = {}, // 👈 valor por defecto
    thunkAPI
  ) => {
    try {
      const qsParts = [];

      // names -> ?q=Montinelli&q=Peros
      if (Array.isArray(names) && names.length) {
        qsParts.push(...names.map((n) => `q=${encodeURIComponent(n)}`));
      }

      if (active !== undefined) qsParts.push(`active=${active}`);
      if (level !== undefined) qsParts.push(`level=${level}`);

      // parent_id -> ?parent_id=67&parent_id=68
      if (Array.isArray(parent_id) && parent_id.length) {
        qsParts.push(
          ...parent_id.map((id) => `parent_id=${encodeURIComponent(id)}`)
        );
      } else if (parent_id && !Array.isArray(parent_id)) {
        // caso cuando viene como número/string simple
        qsParts.push(`parent_id=${encodeURIComponent(parent_id)}`);
      }

      const qs = qsParts.length ? `?${qsParts.join("&")}` : "";
      const url = `${SERVER_URL}/api/categories/${qs}`;

      const { data } = await axios.get(url);
      return data;
    } catch (error) {
      console.error(error);
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Error al obtener categorías" }
      );
    }
  }
);


const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    categories:[],
    hasError: false,
    isLoading: false,
  },
  reducers: {
    },
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
  },
});

export default categoriesSlice.reducer;
