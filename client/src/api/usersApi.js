const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const fetchAddUser = async (
  firstname,
  lastname,
  phone,
  access_token,
  role,
  email,
  password
) => {
  try {
    const response = await fetch(`${SERVER_URL}/users/signup`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        firstname,
        lastname,
        phone,
        access_token,
        role,
        email,
        secret_password: password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.log(error);
  }
};

export const fetchAuthLocalUser = async (username, password) => {
  
  try {
    const response = await fetch(`${SERVER_URL}/api/auth/local`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        username,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
    });
    const status = await response.json();
    return status;
  } catch (error) {
    console.log(error);
  }
};
