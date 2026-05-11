const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const getSellerClients = async (userId) => {
  const response = await fetch(
    `${SERVER_URL}/api/clients/seller/${userId}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al obtener clientes del vendedor");
  }

  return response.json();
};
