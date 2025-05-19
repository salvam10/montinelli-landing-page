/* React Redu/* React Redux */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* State */
import { localAuthenticateUser } from "../../features/slices/usersSlice";
/* Bootstrap */
import { Spinner } from "react-bootstrap";
/* React Router */
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const isValidUser = useSelector((state) => state.users.isValidUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUsername, setIsUsername] = useState(true);
  const [isPassword, setIsPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir al usuario si el login fue exitoso
  useEffect(() => {
    if (isValidUser) {
      setIsLoading(false);
      navigate("/seller");
    } else {
      setIsLoading(false);
    }
  }, [isValidUser]);

  const handleOnClick = async (e) => {
    e.preventDefault();

    const hasUsername = username.trim() !== "";
    const hasPassword = password.trim() !== "";

    setIsUsername(hasUsername);
    setIsPassword(hasPassword);

    if (!hasUsername || !hasPassword) return;

    try {
      setIsLoading(true);
      await dispatch(localAuthenticateUser({ username, password }));
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <div className="w-full md:w-5/12 p-8 flex flex-col">
        <form className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>

          {/* Username */}
          <div className="flex flex-col">
            <input
              className="form-input mb-0 p-2 border rounded"
              type="text"
              placeholder="Usuario"
              onChange={(e) => setUsername(e.target.value)}
            />
            {!isUsername && (
              <span className="text-red-500 text-sm mt-1">
                Ingresa tu usuario.
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <input
              className="form-input mb-0 p-2 border rounded"
              type="password"
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
            />
            {!isPassword && (
              <span className="text-red-500 text-sm mt-1">
                Ingresa tu contraseña.
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            className="py-3 bg-[#66CC33] text-white rounded hover:bg-[#FF9933]"
            type="submit"
            onClick={handleOnClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner animation="border" size="sm" />
                Iniciando...
              </div>
            ) : (
              <Spinner animation="border" size="sm" />
            )}
          </button>

          {/* Error */}
          {!isValidUser && (
            <span className="text-xs text-red-600 font-bold mt-2">
              Revisa tu nombre de usuario o contraseña.
            </span>
          )}

          {/* Registro */}
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
