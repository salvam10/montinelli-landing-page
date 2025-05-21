import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CustomFormButton from "../customFormButton/CustomFormButton";
import CustomTextInput from "../customTextInput/CustomTextInput";
import { updateOrder, getOrderById } from "../slices/ordersSlice";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddInvoiceModal from "../modals/AddInvoiceModal";

const OrderClientDetails = ({ orderClient, order }) => {
  const [managerStatus, setManagerStatus] = useState(null);
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(order.invoice_number);
  const dispatch = useDispatch();

  useEffect(() => {
    setInvoiceNumber(order.invoice_number);
    setManagerStatus(order.manager_approval_status);
  }, [order]);

  return (
    <div className="w-full flex justify-between py-5 px-5 bg-white gap-2">
      <div className="w-full flex flex-col justify-between gap-2">
        {/* Client Basic Details */}
        <div className="w-full flex-center flex-col gap-2">
          <div className="w-full flex flex-col">
            <span className="client-detail-label">Cliente</span>
            <div className="flex gap-1">
              <span className="responsive-text">{orderClient.name}</span>
              <span className="responsive-text text-[rgba(235,90,70,1)] font-bold">
                {orderClient.has_debt && "(con deuda)"}
              </span>
            </div>
          </div>
          <div className="w-full flex flex-col">
            <span className="client-detail-label">Representante legal</span>
            <span className="responsive-text">
              {orderClient.legal_representative || 'No disponible'}
            </span>
          </div>
          <div className="w-full flex flex-col ">
            <span className="client-detail-label">Teléfono</span>
            <span className="responsive-text">{orderClient.phone || 'No disponible'}</span>
          </div>
          <div className="w-full flex flex-col ">
            <span className="client-detail-label">Cod Sunagro</span>
            <span className="responsive-text">{orderClient.sunagro_code || 'No disponible'}</span>
          </div>
          <div className="w-full flex flex-col">
            <span className="client-detail-label">Rif</span>
            <a
              className="text-[#0079bf] hover:text-[#ff9f1a] client-detail-label cursor-pointer"
              href={orderClient.rif_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {orderClient.rif}
            </a>
          </div>
          <div className="w-full flex flex-col">
            <span className="client-detail-label">Vendedor</span>
            <span className="responsive-text">{order.user_fullname}</span>
          </div>
        </div>
        {/* Client Address */}
        <div className="w-full flex flex-col">
          <span className="client-detail-label">Dirección</span>
          <div className="flex flex-col gap-1">
            <span className="responsive-text">Estado: {orderClient.state}</span>
            <span className="responsive-text">Ciudad: {orderClient.city}</span>
            <span className="responsive-text gap-1">
              Municipio: {orderClient.municipality}
            </span>
          </div>
        </div>
        {/* Invoice Number*/}
        <div className="flex flex-col">
          <span className="client-detail-label">Factura</span>
          <div className="flex flex-between items-baseline gap-2">
            <span className="responsive-text">
              {invoiceNumber || "Sin factura creada"}
            </span>
            <span
              className="p-1 text-[#B3B3B3] cursor-pointer hover:bg-[#EBEBEB] hover:text-[#000000] hover:rounded-lg"
              onClick={() => {
                if (managerStatus.toLowerCase() === "aprobado") {
                  setOpenInvoiceModal(!openInvoiceModal);
                } else {
                  alert("El pedido aún no ha sido aprobado por gerencia.");
                }
              }}
            >
              <EditOutlinedIcon style={{ fontSize: "large" }} />
            </span>
          </div>
          {openInvoiceModal && (
            <AddInvoiceModal
              setOpenModal={setOpenInvoiceModal}
              order={order}
              invoiceNumber={invoiceNumber}
              setInvoiceNumber={setInvoiceNumber}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderClientDetails;
