import React from "react";
import { useSelector, useDispatch } from "react-redux";
import CustomButton from "../customButton/customButton";
import { resetClient } from "../slices/clientsSlice";

const ClientInfoSection = ({ client }) => {
  const dispatch = useDispatch();

  const handleOnClick = () => {
    dispatch(resetClient());
  };

  return (
    <div className="section-container !gap-1">
      <div className="w-full flex">
        <h3 className="font-bold">
          <span>[{client.city}]</span> {client.name}
        </h3>
      </div>
      <div className="w-full flex ">
        <div className="w-[80%]">
          <p className="">{client.street_address}</p>
          <div className="flex gap-5">
            <span>Municipio {client.municipality}</span>
            <span>Estado {client.state}</span>
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
