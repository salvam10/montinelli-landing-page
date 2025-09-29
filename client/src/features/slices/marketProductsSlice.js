import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cleanParams } from "../../helpers/cleanParams";
import axios from "axios";
import qs from "qs";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/* --------- thunks --------- */

export const getMarketProducts = createAsyncThunk(
  "marketProducts/getMarketProducts",
  async (
    {
      q,
      active,
      brand_id,
      category,
      category_id, // 👈 NUEVO
      page,
      pageSize,
      all,
    } = {},
    { rejectWithValue, signal }
  ) => {
    try {
      const rawParams = {
        q,
        active:
          active === true ? "true" : active === false ? "false" : undefined,
        brand_id,
        category,
        category_id,
        page,
        pageSize,
        all: all ? "true" : undefined,
      };

      const params = cleanParams(rawParams);

      const response = await axios.get(`${SERVER_URL}/api/market-products/`, {
        params,
        paramsSerializer: (p) =>
          qs.stringify(p, {
            arrayFormat: "repeat",
            skipNulls: true,
          }),
        signal,
      });

      return response.data.data;
    } catch (err) {
      return rejectWithValue(err?.message || "Error de red");
    }
  }
);

export const getCompetitorPrices = createAsyncThunk(
  "marketProducts/getCompetitorPrices",
  async (
    {
      productIds, // number | number[]
      clientIds, // number | number[]
      latest, // boolean
    } = {},
    { rejectWithValue, signal }
  ) => {
    try {
      const rawParams = {
        productIds,
        clientIds,
        latest: latest ? "true" : undefined,
      };

      const params = cleanParams(rawParams);

      const response = await axios.get(
        `${SERVER_URL}/api/market-products/competitor-prices`,
        {
          params,
          paramsSerializer: (p) =>
            qs.stringify(p, {
              arrayFormat: "repeat", // ?productIds=79&productIds=81
              skipNulls: true,
            }),
          signal,
        }
      );

      // backend devuelve { count, latest, data }
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err?.message || "Error de red");
    }
  }
);

// GET /competitor-products-summary con categoryId o productIds
export const getCompetitorProductsSummary = createAsyncThunk(
  "marketProducts/getCompetitorProductsSummary",
  async (
    {
      categoryId, // <-- nuevo (opcional). Si viene, ignora productIds
      productIds, // puede ser number | number[]
      agg = "mean", // "mean" | "median"
      sinceDays, // opcional: e.g. 90
      highlightProductId, // opcional: el que tienes seleccionado en el state
      excludeClientIds, // opcional: string con ids separados por coma 
    },
    { rejectWithValue }
  ) => {
    try {
      const params = {};

      if (categoryId != null) {
        params.categoryId = Number(categoryId);
      } else if (productIds != null) {
        const ids = Array.isArray(productIds) ? productIds : [productIds];
        const clean = ids.map(Number).filter(Boolean);
        if (!clean.length)
          throw new Error("Debes enviar categoryId o productIds válidos");
        params.productIds = clean.join(",");
      } else {
        throw new Error("Debes enviar categoryId o productIds");
      }

      if (agg) params.agg = agg;
      if (sinceDays != null) params.sinceDays = Number(sinceDays);
      if (highlightProductId != null)
        params.highlightProductId = Number(highlightProductId);

      if (excludeClientIds) {
        params.excludeClientIds = excludeClientIds;
      }

      const res = await axios.get(
        `${SERVER_URL}/api/market-products/competitor-products-summary`,
        {
          params,
        }
      );

      const json = res.data;

      // normaliza para que siempre devuelva { data, meta }
      if (Array.isArray(json?.data)) return json;
      return { data: Array.isArray(json) ? json : [], meta: json?.meta ?? {} };
    } catch (err) {
      return rejectWithValue(err?.message || "Error de red");
    }
  }
);

export const getMarketProductsByCat = createAsyncThunk(
  "products/getMarketProductsByCat",
  async ({ categoryId }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/market-products/category/${categoryId}`
      );
      return response.data.data;
    } catch (error) {
      console.log(error);
      return thunkAPI.rejectWithValue(error?.message || "Error de red");
    }
  }
);

/* --------- slice --------- */

const marketProductsSlice = createSlice({
  name: "marketProducts",
  initialState: {
    marketProducts: [],
    competitorPrices: [],
    productsSummary: [], // <-- nuevo
    bsExchangeRate: 36.6,

    // estados para loading/error
    isLoading: false,
    hasError: false,

    loadingSummary: false, // <-- nuevo
    errorSummary: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // getMarketProducts
      .addCase(getMarketProducts.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getMarketProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.marketProducts = action.payload;
      })
      .addCase(getMarketProducts.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      // getMarketProductsByCat
      .addCase(getMarketProductsByCat.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getMarketProductsByCat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.marketProducts = action.payload;
      })
      .addCase(getMarketProductsByCat.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      // getCompetitorPrices
      .addCase(getCompetitorPrices.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getCompetitorPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.competitorPrices = action.payload;
      })
      .addCase(getCompetitorPrices.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })

      // getCompetitorProductsSummary
      .addCase(getCompetitorProductsSummary.pending, (state) => {
        state.loadingSummary = true;
        state.errorSummary = null;
      })
      .addCase(getCompetitorProductsSummary.fulfilled, (state, action) => {
        state.loadingSummary = false;
        state.errorSummary = null;
        state.productsSummary = action.payload || [];
      })
      .addCase(getCompetitorProductsSummary.rejected, (state, action) => {
        state.loadingSummary = false;
        state.errorSummary =
          action.error?.message || "Error obteniendo resumen";
        state.productsSummary = [];
      });
  },
});

export default marketProductsSlice.reducer;
