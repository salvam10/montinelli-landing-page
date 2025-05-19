import React, { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import { getClients, getSingleClient } from "../slices/clientsSlice";
import CustomSelect from "../customSelect/CustomSelect";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomCombobox from "../customCombobox/CustomCombobox";

const ExistingClientModal = ({ setOpenModal }) => {
  const [options, setOptions] = useState([]);
  const [selectedRif, setSelectedRif] = useState("");
  const { clients } = useSelector((state) => state.clients);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getClients());
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


  const handleCloseClick = () => {
    setOpenModal(false);
  };

  const handleSubmitClick = () => {
    dispatch(getSingleClient({ rif: selectedRif }));
    setOpenModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="text-[20px]">Selecciona un cliente</h3>
        </div>
        <div className="modal-inputs-container">
         {/*  <CustomSelect
            options={options}
            label="Clientes"
            value={selectedRif}
            setValue={setSelectedRif}
          /> */}
          <CustomCombobox
            options={options}
            selected={selectedRif}
            setSelected={setSelectedRif}
            label="Clientes"
          />
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

export default ExistingClientModal;
