import React from "react";
import { useSelector, useDispatch } from "react-redux";
import CustomButton from "../customButton/customButton";
import clientsSlice, { resetClient } from "../slices/clientsSlice";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";

const ClientInfoSection = ({ client }) => {
  const dispatch = useDispatch();

  const handleOnClick = () => {
    dispatch(resetClient());
  };

  return (
    <div className="section-container !gap-1">
      <div className="w-full flex flex-col">
        <span className="responsive-text font-bold">Cliente:</span>
        <span className="responsive-text">
          {capitalizeFirstLetter(client.name)}
        </span>
      </div>
      <div className="w-full flex ">
        <div className="w-[80%]">
          <div className="flex flex-col">
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
          <div className="flex gap-2">
            <div className="flex gap-1">
              <span className="responsive-text font-bold">Ciudad:</span>
              <span className="responsive-text">
                {capitalizeFirstLetter(client.city || "No disponible")}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="responsive-text font-bold">Estado:</span>
              <span className="responsive-text">
                {capitalizeFirstLetter(client.state || "No disponible")}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="responsive-text font-bold">Municipio:</span>
              <span className="responsive-text">
                {capitalizeFirstLetter(client.municipality || "No disponible")}
              </span>
            </div>
          </div>
        </div>
        <div className="w-[20%] flex-center">
          <CustomButton
            title="Cambiar"
            xsWidth="w-[10%]"
            mdWidth="auto"
            handleOnClick={handleOnClick}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientInfoSection;
