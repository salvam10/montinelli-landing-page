import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CustomTextInput from "../customTextInput/CustomTextInput";
import CustomRadioInput from "../customRadioInput/CustomRadioInput";
import CustomSelect from "../customSelect/CustomSelect";
import CustomTextarea from "../customTextarea/CustomTextarea";
import { cities, municipalities, phoneAreaCodes, states } from "../../dummy";
import { AuthContext } from "../../App";

const OrderForm = () => {
  const { user } = React.useContext(AuthContext);
  const [legalRepresentative, setLegalRepresentative] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [municipality, setMunicipality] = useState(municipalities[0].value);
  const [mobilePhone, setMobilePhone] = useState("");
  const [mobileCode, setmobileCode] = useState(phoneAreaCodes[0].value);
  const [localPhone, setLocalPhone] = useState("");
  const [localCode, setLocalCode] = useState("212");
  const [state, setState] = useState(states[0].value);
  const [name, setName] = useState("");
  const [city, setCity] = useState(cities[0].value);
  const [rif, setRif] = useState("");

  return (
    <div className="flex-center flex-col">
      {/* Nombre del vendedor */}
      <div className="flex gap-1">
        <span className="">Vendedor:</span>
        <span className="font-black">
          {user?.firstname} {user?.lastname}
        </span>
      </div>
      <div className="modal-inputs-container">
        {/* rif input */}
        <CustomTextInput
          label="Rif *"
          type="text"
          width="w-full"
          value={rif}
          setValue={setRif}
        />
        <CustomTextInput
          label="Nombre del negocio *"
          type="text"
          width="w-full"
          value={name}
          setValue={setName}
        />
        <CustomTextInput
          label="Representante legal"
          type="text"
          width="w-full"
          value={legalRepresentative}
          setValue={setLegalRepresentative}
        />
        <div className="w-full flex-between">
          <CustomSelect
            options={cities}
            label="Ciudad"
            width="w-[48%]"
            value={city}
            setValue={setCity}
          />
          <CustomSelect
            options={states}
            label="Estado"
            width="w-[48%]"
            value={state}
            setValue={setState}
          />
        </div>

        <CustomSelect
          options={municipalities}
          label="Municipio"
          value={municipality}
          setValue={setMunicipality}
        />
        <CustomTextarea
          label="Dirección *"
          type="text"
          width="w-full"
          height="h-[10%]"
          value={streetAddress}
          setValue={setStreetAddress}
        />
        <div className="flex gap-2">
          <CustomSelect
            options={[{ label: "212", value: "212" }]}
            label="Código"
            width="w-[30%]"
            value={localCode}
            setValue={setLocalCode}
          />
          <CustomTextInput
            label="Telf local"
            type="phone"
            width="w-full"
            value={localPhone}
            setValue={setLocalPhone}
          />
        </div>
        <div className="flex gap-2">
          <CustomSelect
            options={phoneAreaCodes}
            label="Código"
            width="w-[30%]"
            value={mobileCode}
            setValue={setmobileCode}
          />
          <CustomTextInput
            label="Telf móvil "
            type="phone"
            width="w-full"
            value={mobilePhone}
            setValue={setMobilePhone}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
