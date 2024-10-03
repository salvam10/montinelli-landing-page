import React, { useState } from "react";
import { useDispatch } from "react-redux";
import CustomSelect from "../customSelect/CustomSelect";
import { cities, municipalities, phoneAreaCodes, states } from "../../dummy";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomTextInput from "../customTextInput/CustomTextInput";
import CloseIcon from "@mui/icons-material/Close";
import { createClient } from "../slices/clientsSlice";
import CustomTextarea from "../customTextarea/CustomTextarea";

const CreateClientModal = ({ setOpenModal }) => {
  /* local states */
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

  const dispatch = useDispatch();

  const handleCloseClick = () => {
    setOpenModal(false);
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    dispatch(
      createClient({
        rif: rif.toLowerCase(),
        name: name.toLowerCase(),
        mobile_phone: mobilePhone.toLowerCase(),
        local_phone: localPhone.toLowerCase(),
        legal_representative: legalRepresentative.toLowerCase(),
        street_address: streetAddress.toLowerCase(),
        city: city.toLowerCase(),
        municipality: municipality.toLowerCase(),
        state: state.toLowerCase(),
      })
    );
    setOpenModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="text-[20px]">Agregar cliente</h3>
        </div>
        <div className="modal-inputs-container">
          <CustomTextInput
            label="Nombre del negocio *"
            type="text"
            width="w-full"
            value={name}
            setValue={setName}
          />
          <CustomTextInput
            label="Rif *"
            type="text"
            width="w-full"
            value={rif}
            setValue={setRif}
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
          <div className="w-full flex-center">
            <CustomFormButton handleClickFunction={handleSubmitClick} />
          </div>
          <button className="modal-close-button" onClick={handleCloseClick}>
            <CloseIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClientModal;
