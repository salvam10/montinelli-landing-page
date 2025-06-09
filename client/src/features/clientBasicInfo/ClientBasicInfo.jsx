import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateClient } from "../slices/clientsSlice";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";

const ClientBasicInfo = ({ client, setShowModal }) => {

  return (
    <div className="section-container">
      <div className="w-full flex flex-col justify-between gap-5">
        {/* Header */}
        <div className="w-full flex-between items-center">
          <span className="client-detail-label mb-0">Información Básica</span>
          <div className="text-[10px] cursor-pointer">
            <span
              className="text-[#B3B3B3] cursor-pointer hover:bg-[#EBEBEB] hover:text-[#000000] hover:rounded-lg"
              onClick={() => {
                setShowModal(true);
              }}
            >
              <EditOutlinedIcon style={{ fontSize: "large" }} />
            </span>
          </div>
        </div>
        {/* Body */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Nombre</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(client?.name || "No disponible")}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Rif:</span>
            <a
              className="text-[#0079bf] hover:text-[#ff9f1a] client-detail-label mb-0 cursor-pointer"
              href={client?.rif_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {client?.rif || "No disponible"}
            </a>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">
              Representante legal:
            </span>
            <span className="responsive-text">
              {capitalizeFirstLetter(
                client?.legal_representative || "No disponible"
              )}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Teléfono:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(client?.phone || "No disponible")}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Código Profit:</span>
            <span className="responsive-text">
              {client?.profit_code || "No disponible"}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Código Sica:</span>
            <span className="responsive-text">
              {client?.sunagro_code || "No disponible"}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Ciudad:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(client?.city || "No disponible")}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Estado:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(client?.state || "No disponible")}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Municipio:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(client?.municipality || "No disponible")}
            </span>
          </div>
          <div className="w-full flex flex-col">
            <span className="responsive-text font-bold">Dirección:</span>
            <span className="responsive-text">
              {capitalizeFirstLetter(client?.street_address || "No disponible")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBasicInfo;
