import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import { fetchAddUser, fetchAuthLocalUser } from "../../api/usersApi";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

/* retrieve cart  by user id*/
export const retrieveCart = createAsyncThunk(
  "cart/retrieveCart",
  async ({ user_id }, thunkAPI) => {
    try {
      const response = await axios.get(
        `${SERVER_URL}/api/cart/${user_id}/items`
      );
      const productsInCart = response.data;
      return productsInCart;
    } catch (error) {
      console.log(error);
    }
  }
);

/* add product to cart */
export const addProductToCart = createAsyncThunk(
  "cart/addProductToCart",
  async ({ user_id, product, quantity }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/api/cart/${user_id}/items`,
        {
          productId: product.id,
          quantity: quantity,
        }
      );
      const added_product = response.data;
      return { ...product, quantity };
    } catch (error) {
      console.log("error", error);
    }
  }
);

/* update a product in cart */
export const updateProductInCart = createAsyncThunk(
  "cart/updateProductInCart",
  async ({ user_id, product_id, quantity }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${SERVER_URL}/api/cart/${user_id}/${product_id}`,
        {
          quantity,
        }
      );
      const productUpdated = response.data;
      return productUpdated;
    } catch (error) {
      console.log(error);
    }
  }
);

/* delete product in cart */
export const deleteProductInCart = createAsyncThunk(
  "cart/deleteProductInCart",
  async ({ user_id, product_id }, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${SERVER_URL}/api/cart/${user_id}/${product_id}`
      );
      const deletedId = response.data.product_id;
      return deletedId;
    } catch (error) {
      console.log(error);
    }
  }
);

/* Funciíon auxiliar para calcular la cantitad de items en el carrito. */
const calculateCartItemsCount = (products) => {
  return products.reduce((acc, product) => acc + product.quantity, 0);
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItemsCount: 0,
    productsInCart: [],
    updatedProduct: {},
    cartSubtotal: 0,
    shippingCost: 0.0,
    hasError: false,
    isLoading: false,
  },
  reducers: {
    setCartSubtotal: (state, action) => {
      let acum = 0;
      current(state).productsInCart.forEach(
        (product) =>
          (acum +=
            product.quantity *
            (product.base_price ))
      );
      state.cartSubtotal = acum.toFixed(2);
    },
    resetCart: (state, action) => {
      state.cartItemsCount = 0;
      state.productsInCart = [];
      state.cartSubtotal = 0;
      state.updatedProduct = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(retrieveCart.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(retrieveCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const products = action.payload;
        let acum = 0;
        products.forEach((product) => (acum += product.quantity));
        state.productsInCart = action.payload;
        state.cartItemsCount = acum;
      })
      .addCase(retrieveCart.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(addProductToCart.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(addProductToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const adeddProduct = action.payload;
        state.productsInCart = current(state).productsInCart.filter(
          (product) => product.id !== adeddProduct.id
        );
        state.productsInCart.push(adeddProduct);
        state.cartItemsCount = calculateCartItemsCount(state.productsInCart);
      })
      .addCase(addProductToCart.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(updateProductInCart.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(updateProductInCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const updatedProduct = action.payload;
        state.productsInCart = current(state).productsInCart.map((product) =>
          product.id === updatedProduct.product_id
            ? { ...product, quantity: updatedProduct.quantity }
            : product
        );
        state.cartItemsCount = calculateCartItemsCount(state.productsInCart);
      })
      .addCase(updateProductInCart.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(deleteProductInCart.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(deleteProductInCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const deletedId = action.payload;
        const deletedProduct = current(state).productsInCart.find(
          (product) => product.id === deletedId
        );
        const productsInCart = current(state).productsInCart.filter(
          (product) => product.id != deletedProduct.id
        );
        state.productsInCart = productsInCart;
        state.cartItemsCount = calculateCartItemsCount(state.productsInCart);
      })
      .addCase(deleteProductInCart.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});

export const { setCartSubtotal, resetCart } = cartSlice.actions;

export default cartSlice.reducer;
