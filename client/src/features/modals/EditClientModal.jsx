import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import {
  createClient,
  getSingleClient,
  updateClient,
} from "../slices/clientsSlice";
import { capitalizeFirstLetter } from "../../helpers/CapitalizeFirstLetter";

const EditClientModal = ({ setShowModal, client }) => {
  const { isLoading } = useSelector((state) => state.clients);
  const [legalRepresentative, setLegalRepresentative] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [streetAddress, setStreetAddress] = useState("");
  const [municipality, setMunicipality] = useState(
    municipalities[0]?.value || ""
  );
  const [mobilePhone, setMobilePhone] = useState("");
  const [mobileCode, setMobileCode] = useState(phoneAreaCodes[0]?.value || "");
  const [rifType, setRifType] = useState(rifTypes[0]?.value || "");
  const [state, setState] = useState(states[0]?.value || "");
  const [name, setName] = useState("");
  const [city, setCity] = useState(cities[0]?.value || "");
  const [rif, setRif] = useState("");
  const [sicaCode, setSicaCode] = useState("");
  const [profitCode, setProfitCode] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (client && Object.keys(client).length > 0) {
      setName(client?.name || "");
      setLegalRepresentative(client?.legal_representative || "");
      setRif(client?.rif || "");
      setCity(client?.city || "");
      setState(client?.state || "");
      setMunicipality(client?.municipality || "");
      setStreetAddress(client?.street_address || "");
      setSicaCode(client?.sunagro_code || "");
      setProfitCode(client?.profit_code || "");
    }
  }, [client]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleCloseClick = () => {
    setShowModal(false);
  };

  const handleSubmitClick = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    const clientData = {
      id: client.id,
      rif: `${rifType}${rif?.toLowerCase()}`,
      name: capitalizeFirstLetter(name),
      phone: `${mobileCode}${mobilePhone}`,
      legal_representative: legalRepresentative?.toLowerCase(),
      street_address: streetAddress?.toLowerCase(),
      city: city?.toLowerCase(),
      municipality: municipality?.toLowerCase(),
      state: state?.toLowerCase(),
      sunagro_code: sicaCode?.toLowerCase(),
      profit_code: profitCode?.toLowerCase(),
      formData,
    };

    await dispatch(updateClient(clientData));
    await dispatch(getSingleClient({ id: client.id }));

    setShowModal(false);
  };

  useEffect(() => {
    console.log("file", selectedFile);
  }, [selectedFile]);

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
          <div className="flex gap-5">
            <CustomTextInput
              label="Código Profit *"
              type="text"
              value={profitCode}
              width={`w-[48%]`}
              setValue={setProfitCode}
            />
            <CustomTextInput
              label="Código Sica *"
              type="text"
              value={sicaCode}
              width={`w-[48%]`}
              setValue={setSicaCode}
            />
          </div>
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
          <CustomTextInput
            label="Dirección *"
            type="text"
            value={streetAddress}
            setValue={setStreetAddress}
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
            <CustomFormButton type="submit" isLoading={isLoading} />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClientModal;
