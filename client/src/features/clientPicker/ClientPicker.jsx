import React, { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import { getClients } from "../slices/clientsSlice";
import CustomCombobox from "../customCombobox/CustomCombobox";
import ClientInfoSection from "../clientInfoSection/ClientInfoSection";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";
import { getSingleClient } from "../slices/clientsSlice";

const ClientPicker = ({ selectedClientId, setSelectedClientId }) => {
  const [options, setOptions] = useState([]);
  const [selectedRif, setSelectedRif] = useState("");
  const { clients, client } = useSelector((state) => state.clients);
  const dispatch = useDispatch();

  useEffect(() => {
    setSelectedClientId(selectedRif);
    dispatch(getSingleClient({ rif: selectedRif }));
  }, [selectedRif]);

  useEffect(() => {
    if (Object.keys(client).length > 0) {
      setSelectedClientId(client.id);
    }
  },[client])

  useEffect(() => {
    dispatch(getClients());
    // Al montar: deshabilita el scroll de la página de fondo del modal
    document.body.style.overflow = "hidden";
    // Al desmontar: restaura el scroll
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (clients?.length) {
      const formattedClients = clients
        .filter((client) => typeof client.name === "string")
        .map((client) => {
          const name = client.name.toLowerCase();
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
          return {
            label: formattedName,
            value: client.rif,
          };
        });

      setOptions(formattedClients);
      if (!selectedRif && formattedClients[0]) {
        setSelectedRif(formattedClients[0].value); // solo si no está ya seteado
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
          selected={selectedRif}
          setSelected={setSelectedRif}
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
