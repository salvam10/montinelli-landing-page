import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/* Obtener todos los clientes */
export const getCategories = createAsyncThunk(
  "categories/getCategories",
  async (arg, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/categories/`);
      const categories = response.data;
      return categories;
    } catch (error) {
      console.log(error);
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
