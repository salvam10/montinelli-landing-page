import { createSlice, createAsyncThunk, current } from "@reduxjs/toolkit";
import { fetchAddUser, fetchAuthLocalUser } from "../../api/usersApi";
import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const addUser = createAsyncThunk(
  "users/addUser",
  async (
    {
      firstname = null,
      lastname = null,
      phone = null,
      access_token = null,
      role = null,
      email = null,
      password = "123",
    },
    thunkAPI
  ) => {
    const newUser = await fetchAddUser(
      firstname,
      lastname,
      phone,
      access_token,
      role,
      email,
      password
    );
    return newUser;
  }
);

/* Eliminar usuario */
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async ({ id }, thunkAPI) => {
    try {
      const response = await axios.delete(`${SERVER_URL}/users/${id}`);
      const deleted_user = response.data;
      return deleted_user;
    } catch (error) {
      console.log("error al intentar eliminar un usuarrio", error);
    }
  }
);

/* Revisar si usuario existe */
export const checkUserExistence = createAsyncThunk(
  "users/checkUserExistence",
  async ({ email }, thunkAPI) => {
    const response = await axios.get(
      `${SERVER_URL}/users/exists?email=${email}`
    );
    const userExists = response.data;
    return userExists;
  }
);

/* Obtener vendedores */
export const getSellers = createAsyncThunk(
  "users/getSellers",
  async (arg, thunkAPI) => {
    console.log('entre');
    
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/`, {
        params: {
          roles: "seller", // también puedes usar ["seller", "admin"] si deseas varios
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener los vendedores:", error);
      return thunkAPI.rejectWithValue(
        error.response?.data || "Error desconocido"
      );
    }
  }
);

export const localAuthenticateUser = createAsyncThunk(
  "users/localAuthenticateUser",
  async ({ cedula, password }, thunkAPI) => {
    try {
      console.log("local Authenticate User");
      const status = await fetchAuthLocalUser(cedula, password);
      if (status.message === "Succesfully Authenticated") {
        thunkAPI.dispatch(getLocalUser());
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }
);

export const getLocalUser = createAsyncThunk(
  "users/getLocalUser",
  async (arg, thunkAPI) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/auth/login/success`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Content_type: "application/json",
          "Access-Control-Allow-Credentials": true,
        },
      });
      if (response.status === 200) {
        const resObject = await response.json();
        const user = resObject.user;
        return user;
      } else {
        throw new Error("authentication has been failed");
      }
    } catch (err) {
      console.log(err);
    }
  }
);

//Cerrar sesión del usuario.
export const userLogout = createAsyncThunk(
  "users/userLogout",
  async (arg, thunkAPI) => {
    try {
      const response = await axios.post(`${SERVER_URL}/api/auth/logout`);
      console.log("user logged out");
    } catch (error) {
      console.log("error while trying logout");
    }
  }
);

export const retrieveAllUsers = createAsyncThunk(
  "users/retrieveAllUsers",
  async (arg, thunkAPI) => {
    const response = await axios.get(`${SERVER_URL}/api/users`);
    const users = response.data;
    return users;
  }
);

export const getFacebookAccounts = createAsyncThunk(
  "users/getFacebookAccounts",
  async (arg, thunkAPI) => {
    const user = thunkAPI.getState().users.user;
    const response = await axios.get(
      `https://graph.facebook.com/v15.0/me?fields=id,name,first_name,       accounts&access_token=${user.accessToken}`
    );
    const accounts = response.data.accounts.data;
    return accounts;
  }
);

export const getUserById = createAsyncThunk(
  "users/getUserById",
  async ({ id }, thunkAPI) => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/${id}`);
      const user = response.data;
      return user;
    } catch (error) {
      console.log("error while trying to get user by its Id", error);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, firstname, lastname, phone, email, role }, thunkAPI) => {
    console.log("id", id);
    try {
      const response = await axios.put(`${SERVER_URL}/api/users/${id}`, {
        firstname,
        lastname,
        phone,
        email,
        role,
      });
      const updatedIgAccount = response.data;
      return updatedIgAccount;
    } catch (error) {
      console.log(error);
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    user: null,
    users: [],
    sellers: [],
    hasError: false,
    isLoading: false,
    isValidUser: true,
    userExists: null,
    single_user: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        console.log("Update User Pending");
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const updatedUser = action.payload;
        state.single_user = updatedUser;
        console.log("updatedUser", updateUser);
        const index = current(state).users.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
          console.log("Usuario actualizad", state.users[index]);
        } else {
          console.log("Usuario no encontrado");
        }
      })
      .addCase(updateUser.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
        console.log("Update user rejected");
      })
      .addCase(addUser.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const new_user = action.payload;
        state.users.push(new_user);
        console.log("add new user fullfiled", new_user);
      })
      .addCase(addUser.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
        console.log("add user rejected");
      })
      .addCase(localAuthenticateUser.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(localAuthenticateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        /* isValidUser será true or false dependiendo de la existencia del usuario*/
        state.isValidUser = action.payload;
        //console.log("Local Authentication process (done)");
      })
      .addCase(localAuthenticateUser.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
        console.log("rejected");
      })
      .addCase(userLogout.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        console.log("logout pending");
      })
      .addCase(userLogout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.user = null;
        localStorage.removeItem("user");
        console.log("logout fulfilled");
      })
      .addCase(userLogout.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
        console.log("logout rejected");
      })
      .addCase(checkUserExistence.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        console.log("Checking user existence pending");
      })
      .addCase(checkUserExistence.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const userExists = action.payload;
        state.userExists = userExists;
      })
      .addCase(checkUserExistence.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = true;
        console.log("Checking user existence rejected");
      })
      .addCase(getLocalUser.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        //console.log("Get local user pending");
      })
      .addCase(getLocalUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        console.log("userSlice action payload", action.payload);
        state.user = action.payload;
        /* console.log("userSlice user", current(state).user); */
        /* console.log("Get local user fulfilled", state.user); */
      })
      .addCase(getLocalUser.rejected, (state, action) => {
        state.isLoading = false;
        state.hasError = true;
        //console.log("Get local user rejected");
      })
      .addCase(retrieveAllUsers.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        //console.log("Retrieve all users from DB pending");
      })
      .addCase(retrieveAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        let users = action.payload;
        state.users = users.map((user) => {
          return {
            id: user.id,
            firtName: user.firstname,
            lastname: user.lastname,
            phone: user.phone,
            role: user.role,
            email: user.email,
          };
        });
        //console.log("Retrieve all users from DB fulfilled", state.users);
      })
      .addCase(retrieveAllUsers.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
        //console.log("Retrieve all users from DB rejected");
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
        console.log("delete user pending");
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const deleted_user = action.payload;
        state.users = state.users.filter((user) => user.id !== deleted_user.id);

        console.log("Delete user Succesfully done:", deleted_user);
      })
      .addCase(deleteUser.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
        console.log("delete user rejected");
      })
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        const single_user = action.payload;
        state.single_user = single_user;
      })
      .addCase(getUserById.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      })
      .addCase(getSellers.pending, (state) => {
        state.isLoading = true;
        state.hasError = false;
      })
      .addCase(getSellers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasError = false;
        state.sellers = action.payload;
      })
      .addCase(getSellers.rejected, (state) => {
        state.isLoading = false;
        state.hasError = true;
      });
  },
});

export default usersSlice.reducer;
