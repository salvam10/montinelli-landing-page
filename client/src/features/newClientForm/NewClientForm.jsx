import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  cities,
  municipalities,
  phoneAreaCodes,
  states,
  rifTypes,
} from "../../dummy";
import CustomTextInput from "../customTextInput/CustomTextInput";
import CustomSelect from "../customSelect/CustomSelect";
import FileUploader from "../fileUploader/FileUploader";

const NewClientForm = forwardRef(({ handleCreateClient }, ref) => {
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
  const [isFormValid, setIsFormValid] = useState(false);
  const [sicaCode, setSicaCode] = useState("");
  const [profitCode, setProfitCode] = useState("");

  const handleSubmitClick = async (e) => {
    if (e?.preventDefault) e.preventDefault();

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
      profit_code: profitCode.toLowerCase(),
      formData,
    };

    handleCreateClient(clientData);
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitClick,
  }));

  useEffect(() => {
    const isValid =
      rif.trim() &&
      name.trim() &&
      mobilePhone.trim() &&
      city.trim() &&
      municipality.trim() &&
      state.trim();
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
    profitCode,
  ]);

  return (
    <form onSubmit={handleSubmitClick} className="modal-inputs-container">
      <CustomTextInput
        label="Nombre del negocio *"
        type="text"
        value={name}
        setValue={setName}
      />
      <div className="w-full flex flex-col gap-2">
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
      <div className="flex gap-10">
        <CustomTextInput
          label="Código Sica *"
          type="text"
          value={sicaCode}
          setValue={setSicaCode}
        />
        <CustomTextInput
          label="Código Profit *"
          type="text"
          value={profitCode}
          setValue={setProfitCode}
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
    </form>
  );
});

export default NewClientForm;
