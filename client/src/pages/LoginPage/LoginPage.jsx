/* React Redux */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* state */
import { localAuthenticateUser } from "../../features/slices/usersSlice";
/* Context */
import { AuthContext } from "../../App";
/* Bootstrap */
import { Spinner } from "react-bootstrap";
/* React Router */
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const isValidUser = useSelector((state) => state.users.isValidUser);
  /* const [emailValidFormat, setEmailValidFormat] = useState(true); */
  const [isUsername, setIsUsername] = useState(true);
  const [isPassword, setIsPassword] = useState(true);
  //Mientras se consulta en la base de datos por el usuario. IsLoading = tue para que se muestre el Spinner
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  //const user = JSON.parse(localStorage.getItem('user'))

  /*  Obtenemos al usuario a partir del contexto */
  const { user } = React.useContext(AuthContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  //Al recibir usuario navegar a home
  useEffect(() => {
    if (user) {
      setIsLoading(false);
      navigate("/seller");
    }
  }, [user]);

  //Si no se valido correctamente el usuario, entonces isLoading=false
  useEffect(() => {
    if (!isValidUser) {
      setIsLoading(false);
    }
  }, [isValidUser]);

  //Validar formato de email ingresado y que no esté vacío.
  /*  const validateEmail = () => {
    if (email) {
      //Patrón deseado
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = regexEmail.test(email);
      setEmailValidFormat(isValid);
      setIsEmail(true);
    } else {
      setIsEmail(false);
      setEmailValidFormat(true);
    }
  }; */

  //validar que el campo contraseña no este vacío
  const validatePassword = () => {
    if (password) {
      setIsPassword(true);
    } else {
      setIsPassword(false);
    }
  };

  /* Click en iniciar sesión para autenticar al usuario */
  const handleOnClick = async (e) => {
    e.preventDefault();
    try {
      if (username && password) {
        setIsLoading(true);
        await dispatch(localAuthenticateUser({ username, password }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full md:w-5/12 p-8 flex flex-col">
        <form className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
          <div className="flex flex-col">
            <input
              className="form-input mb-0 p-2 border rounded"
              type="text"
              placeholder="Usuario"
              onChange={(e) => setUsername(e.target.value)}
            />
            {!isUsername && (
              <span className="text-red-500 text-sm mt-1">
                Ingresa tú usuario.
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <input
              className="form-input mb-0 p-2 border rounded"
              type="password"
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validatePassword}
            />
            {!isPassword && (
              <span className="text-red-500 text-sm mt-1">
                Ingresa tu contraseña
              </span>
            )}
          </div>
          <button
            className="py-3 bg-[#66CC33] text-white rounded hover:bg-[#FF9933]"
            type="submit"
            onClick={handleOnClick}
          >
            {isLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Iniciar Sesión"
            )}
          </button>
          {!isValidUser && (
            <span className="text-xs text-red-600 font-bold mt-2">
              Revisa tu nombre de usuario o contraseña.
            </span>
          )}
          <div className="my-4 border-t border-gray-300"></div>
          <p className="text-center">
            ¿Aún no te has registrado?{" "}
            <a className="text-blue-500 hover:underline" href="/signup">
              Registrarte
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
