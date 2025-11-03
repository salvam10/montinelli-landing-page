import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddInvoiceModal from "../modals/AddInvoiceModal";
import { updateOrder, getOrderById } from "../slices/ordersSlice";

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
    <div className="bg-white rounded-2xl border p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Información del cliente
        </h2>
        {orderClient.has_debt && (
          <span className="text-xs bg-red-100 text-amber-700 px-2 py-0.5 rounded-full">
            con deuda
          </span>
        )}
      </div>

      {/* Client details grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
        {/* Cliente */}
        <div className="flex flex-col">
          <span className="text-gray-500">Cliente</span>
          <span className="font-medium text-gray-900">
            {orderClient.name || "No disponible"}
          </span>
        </div>

        {/* Teléfono */}
        <div className="flex flex-col">
          <span className="text-gray-500">Teléfono</span>
          <span className="font-medium text-gray-900">
            {orderClient.phone || "No disponible"}
          </span>
        </div>

        {/* RIF */}
        <div className="flex flex-col">
          <span className="text-gray-500">RIF</span>
          <a
            href={orderClient.rif_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            {orderClient.rif || "No disponible"}
          </a>
        </div>

        {/* Vendedor */}
        <div className="flex flex-col">
          <span className="text-gray-500">Vendedor</span>
          <span className="font-medium text-gray-900">
            {order.user_fullname || "No disponible"}
          </span>
        </div>

        {/* Representante legal */}
        <div className="flex flex-col">
          <span className="text-gray-500">Representante legal</span>
          <span className="font-medium text-gray-900">
            {orderClient.legal_representative || "No disponible"}
          </span>
        </div>

        {/* Código Sunagro */}
        <div className="flex flex-col">
          <span className="text-gray-500">Cod. Sunagro</span>
          <span className="font-medium text-gray-900">
            {orderClient.sunagro_code || "No disponible"}
          </span>
        </div>

        {/* Código Profit */}
        <div className="flex flex-col">
          <span className="text-gray-500">Cod. Profit</span>
          <span className="font-medium text-gray-900">
            {orderClient.profit_code || "No disponible"}
          </span>
        </div>

        {/* Dirección */}
        <div className="flex flex-col col-span-2 md:col-span-3">
          <span className="text-gray-500">Dirección</span>
          <span className="font-medium text-gray-900">
            {orderClient.street_address ||
              `${orderClient.city || ""}, ${orderClient.state || ""}, ${
                orderClient.municipality || ""
              }`}
          </span>
        </div>

        {/* Factura (editable si aprobado) */}
        <div className="flex flex-col col-span-2 md:col-span-3">
          <span className="text-gray-500">Factura</span>
          <div className="flex items-center justify-between border rounded-xl px-3 py-2 bg-gray-50">
            <span className="font-medium text-gray-900">
              {invoiceNumber || "Sin factura creada"}
            </span>
            <span
              onClick={() => {
                if (
                  managerStatus &&
                  managerStatus.toLowerCase() === "aprobado"
                ) {
                  setOpenInvoiceModal(true);
                } else {
                  alert("El pedido aún no ha sido aprobado por gerencia.");
                }
              }}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <EditOutlinedIcon fontSize="small" />
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
