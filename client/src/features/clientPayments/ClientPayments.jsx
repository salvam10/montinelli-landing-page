import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import DataTable from "../dataTable/DataTable";
import { es } from "date-fns/locale";
import CustomFormButton from "../customFormButton/CustomFormButton";
import AddPaymentModal from "../modals/AddPaymentModal";

const columns = [
  {
    header: "Id",
    accessorKey: "id",
    footer: "ID",
    meta: { width: "w-[80px] min-w-[80px]" },
  },
  {
    header: "Monto",
    accessorKey: "amount",
    footer: "Monto",
    cell: (info) => `$${parseFloat(info.getValue()).toFixed(2)}`,
    meta: { width: "w-[100px] min-w-[100px] pr-4" },
  },
  {
    header: "Fecha",
    accessorKey: "created_at",
    footer: "Fecha de Creación",
    cell: (info) =>
      format(info.getValue(), "dd 'de' MMM 'de' yyyy", { locale: es }),
    meta: { width: "w-[100px] min-w-[100px]" },
  },
];

const ClientPayments = ({ client, clientPayments, isLoading }) => {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [payDate, setPayDate] = useState(() => new Date());

  return (
    <div className="section-container">
      <div className="w-full flex-between items-center">
        <span className="client-detail-label mb-0">
          Abonos realizados por {client?.name}
        </span>
      </div>
      <div className="w-full flex-between items-center">
        <div className="w-[100%]">
          <DataTable
            columns={columns}
            data={clientPayments}
            onDelete={() => {}}
            onRowClick={() => {}}
            onEdit={() => {}}
            notFoundMessage={"No se encontraron abonos para este cliente."}
          />
        </div>
      </div>
      <div className="w-full flex justify-end relative">
        <div className="w-[50%] flex">
          <CustomFormButton
            isLoading={isLoading}
            text="Registrar Abono"
            handleClickFunction={() => setShowAddPayment(true)}
          />
        </div>

        {showAddPayment && (
          <AddPaymentModal
            title="Registrar Abono"
            client={client}
            setShowAddPayment={setShowAddPayment}
          />
        )}
      </div>
    </div>
  );
};

export default ClientPayments;
