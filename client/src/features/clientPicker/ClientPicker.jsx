import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getClients, getSingleClient } from "../slices/clientsSlice";
import CustomCombobox from "../customCombobox/CustomCombobox";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";

const ClientPicker = ({ selectedClientId, setSelectedClientId }) => {
  const [options, setOptions] = useState([]);
  const { clients, client } = useSelector((state) => state.clients);
  const dispatch = useDispatch();

  // Cargar todos los clientes al montar
  useEffect(() => {
    dispatch(getClients());
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Cargar detalles del cliente seleccionado (por id)
  useEffect(() => {
    if (selectedClientId) {
      dispatch(getSingleClient({ id: selectedClientId }));
    }
  }, [selectedClientId]);

  // Formatear las opciones del combo
  useEffect(() => {
    if (clients?.length) {
      const formattedClients = clients
        .filter((client) => typeof client.name === "string")
        .map((client) => {
          const formattedName =
            capitalizeFirstLetter(client.name);
          return {
            label: formattedName,
            value: client.id, // <-- ahora usamos client.id como value
          };
        });

      setOptions(formattedClients);

      // Si no hay cliente seleccionado, usa el primero como predeterminado
      if (!selectedClientId && formattedClients[0]) {
        setSelectedClientId(formattedClients[0].value);
      }
    }
  }, [clients]);

  return (
    <div className="section-container">
      <div className="w-full flex">
        <h2 className="font-bold text-[14px]">Cliente</h2>
      </div>
      <div className="w-full relative">
        <CustomCombobox
          options={options}
          selected={selectedClientId}
          setSelected={setSelectedClientId}
        />
      </div>
      <div className="w-full">
        <div className="w-full flex flex-col">
          <span className="responsive-text font-bold">Nombre:</span>
          <span className="responsive-text">
            {capitalizeFirstLetter(client.name || "No disponible")}
          </span>
        </div>
        <div className="w-full flex flex-col">
          <span className="responsive-text font-bold">Rif:</span>
          <a
            className="text-[#0079bf] hover:text-[#ff9f1a] client-detail-label cursor-pointer"
            href={client.rif_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {client.rif || "No disponible"}
          </a>
        </div>
        <div className="w-full flex flex-col">
          <span className="responsive-text font-bold">
            Representante legal:
          </span>
          <span className="responsive-text">
            {capitalizeFirstLetter(
              client.legal_representative || "No disponible"
            )}
          </span>
        </div>
        <div className="w-full flex flex-col">
          <span className="responsive-text font-bold">Teléfono:</span>
          <span className="responsive-text">
            {capitalizeFirstLetter(client.phone || "No disponible")}
          </span>
        </div>
        <div className="w-full flex flex-col">
          <span className="responsive-text font-bold">Código Sica:</span>
          <span className="responsive-text">
            {client.sunagro_code || "No disponible"}
          </span>
        </div>
        <div className="w-full flex flex-col">
          <span className="responsive-text font-bold">Ciudad:</span>
          <span className="responsive-text">
            {capitalizeFirstLetter(client.city || "No disponible")}
          </span>
        </div>
        <div className="w-full flex flex-col">
          <span className="responsive-text font-bold">Estado:</span>
          <span className="responsive-text">
            {capitalizeFirstLetter(client.state || "No disponible")}
          </span>
        </div>
        <div className="w-full flex flex-col">
          <span className="responsive-text font-bold">Municipio:</span>
          <span className="responsive-text">
            {capitalizeFirstLetter(client.municipality || "No disponible")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClientPicker;
