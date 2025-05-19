import React from "react";
import CloseIcon from "@mui/icons-material/Close";

const DeleteOrderModal = ({ setOpenModal, setIsDeleteConfirmed }) => {
  const handleCloseClick = () => {
    setOpenModal(false);
  };

  const handleDeleteConfirmation = () => {
    setIsDeleteConfirmed(true);
    setOpenModal(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmed(false);
    setOpenModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div className="flex-center flex-col gap-2">
            <h3 className="text-[20px]">Alerta!</h3>
            <p>Confirmas que deseas borrar esta orden?</p>
          </div>

          <button className="modal-close-button" onClick={handleCloseClick}>
            <CloseIcon />
          </button>
        </div>
        <div className="flex gap-4">
          <button
            className="border px-2 py-1 rounded-md"
            onClick={handleDeleteConfirmation}
          >
            Aceptar
          </button>
          <button
            className="border px-2 py-1 rounded-md"
            onClick={handleDeleteCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;
