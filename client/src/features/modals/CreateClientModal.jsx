import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import CustomSelect from "../customSelect/CustomSelect";
import {
  cities,
  municipalities,
  phoneAreaCodes,
  states,
  rifTypes,
} from "../../dummy";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomTextInput from "../customTextInput/CustomTextInput";
import CloseIcon from "@mui/icons-material/Close";
import FileUploader from "../fileUploader/FileUploader";
import { createClient, getSingleClient } from "../slices/clientsSlice";

const CreateClientModal = ({ setOpenModal }) => {
  const [legalRepresentative, setLegalRepresentative] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [streetAddress, setStreetAddress] = useState("");
  const [municipality, setMunicipality] = useState(
    municipalities[0]?.value || ""
  );
  const [mobilePhone, setMobilePhone] = useState("");
  const [mobileCode, setMobileCode] = useState(phoneAreaCodes[0]?.value || "");
  const [rifType, setRifType] = useState(rifTypes[0]?.value || "");
  const [localPhone, setLocalPhone] = useState("");
  const [localCode, setLocalCode] = useState("212");
  const [state, setState] = useState(states[0]?.value || "");
  const [name, setName] = useState("");
  const [city, setCity] = useState(cities[0]?.value || "");
  const [rif, setRif] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [sicaCode, setSicaCode] = useState("");

  const dispatch = useDispatch();

  const handleCloseClick = () => {
    setOpenModal(false);
  };

  const handleSubmitClick = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    const clientData = {
      rif: `${rifType}${rif.toLowerCase()}`,
      name: name.toLowerCase(),
      phone: `${mobileCode}${mobilePhone}`,
      legal_representative: legalRepresentative.toLowerCase(),
      street_address: streetAddress.toLowerCase(),
      city: city.toLowerCase(),
      municipality: municipality.toLowerCase(),
      state: state.toLowerCase(),
      sunagro_code: sicaCode.toLowerCase(),
      formData,
    };

    await dispatch(createClient(clientData));
    dispatch(getSingleClient({ rif: `${rifType}${rif.toLowerCase()}` }));
    setOpenModal(false);
  };

  useEffect(() => {
    // Validar si todos los campos están completos
    const isValid =
      rif.trim() &&
      name.trim() &&
      mobilePhone.trim() &&
      legalRepresentative.trim() &&
      city.trim() &&
      municipality.trim() &&
      state.trim() &&
      sicaCode.trim() &&
      selectedFile !== null;

    setIsFormValid(isValid);
  }, [
    rif,
    name,
    mobilePhone,
    legalRepresentative,
    streetAddress,
    city,
    municipality,
    state,
    selectedFile,
    sicaCode,
  ]);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="text-[20px]">Agregar cliente</h3>
          <button className="modal-close-button" onClick={handleCloseClick}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmitClick} className="modal-inputs-container">
          <CustomTextInput
            label="Nombre del negocio *"
            type="text"
            value={name}
            setValue={setName}
          />
          <div className="w-full flex flex-col gap-2 ">
            <div className="w-full flex gap-2">
              <CustomSelect
                options={rifTypes}
                label="Tipo de rif *"
                width="w-full"
                value={rifType}
                setValue={setRifType}
              />
              <CustomTextInput
                label="Rif *"
                width="w-full"
                type="text"
                value={rif}
                setValue={setRif}
              />
            </div>
            <div className="w-full flex justify-center">
              <FileUploader
                setSelectedFile={setSelectedFile}
                selectedFile={selectedFile}
              />
            </div>
          </div>
          <CustomTextInput
            label="Representante legal *"
            type="text"
            value={legalRepresentative}
            setValue={setLegalRepresentative}
          />
          <CustomTextInput
            label="Código Sica *"
            type="text"
            value={sicaCode}
            setValue={setSicaCode}
          />
          <CustomSelect
            options={states}
            label="Estado *"
            value={state}
            setValue={setState}
          />
          <CustomSelect
            options={cities}
            label="Ciudad *"
            value={city}
            setValue={setCity}
          />
          <CustomSelect
            options={municipalities}
            label="Municipio *"
            value={municipality}
            setValue={setMunicipality}
          />
          <div className="flex gap-2">
            <CustomSelect
              options={phoneAreaCodes}
              label="Código *"
              value={mobileCode}
              setValue={setMobileCode}
            />
            <CustomTextInput
              label="Telf móvil *"
              type="phone"
              width="w-full"
              value={mobilePhone}
              setValue={setMobilePhone}
            />
          </div>
          <div className="w-full flex-center">
            <CustomFormButton type="submit" disabled={!isFormValid} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;
