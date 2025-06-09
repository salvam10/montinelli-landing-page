import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import CloseIcon from "@mui/icons-material/Close";
import { getClients, getSingleClient } from "../slices/clientsSlice";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomCombobox from "../customCombobox/CustomCombobox";

const ExistingClientModal = ({ setOpenModal }) => {
  const [options, setOptions] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const { clients, isLoading } = useSelector((state) => state.clients);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getClients());
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (clients?.length) {
      const formattedClients = clients
        .filter((client) => typeof client.name === "string")
        .map((client) => {
          const formattedName =
            client.name.charAt(0).toUpperCase() +
            client.name.slice(1).toLowerCase();
          return {
            label: formattedName,
            value: client.id, // ahora usamos el ID como valor único
          };
        });

      setOptions(formattedClients);
      if (!selectedClientId && formattedClients[0]) {
        setSelectedClientId(formattedClients[0].value);
      }
    }
  }, [clients]);

  const handleCloseClick = () => {
    setOpenModal(false);
  };

  const handleSubmitClick = () => {
    dispatch(getSingleClient({ id: selectedClientId }));
    setOpenModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="text-[20px]">Selecciona un cliente</h3>
        </div>
        <div className="modal-inputs-container">
          <CustomCombobox
            options={options}
            selected={selectedClientId}
            setSelected={setSelectedClientId}
            label="Clientes"
          />
          <div className="w-full flex-center">
            <CustomFormButton
              isLoading={isLoading}
              handleClickFunction={handleSubmitClick}
            />
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
