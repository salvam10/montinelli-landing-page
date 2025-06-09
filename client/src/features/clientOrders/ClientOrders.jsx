import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getClientOrders } from "../../features/slices/ordersSlice";
import DeleteOrderModal from "../../features/modals/DeleteOrderModal";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";
import DataTable from "../../features/dataTable/DataTable";
import { orderTableFilters } from "../../dummy";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const columns = [
  {
    header: "Pedido",
    accessorKey: "id",
    footer: "ID",
    meta: { width: "w-[80px] min-w-[80px]" },
  },
  {
    header: "Fecha",
    accessorKey: "created_at",
    footer: "Fecha de Creación",
    cell: (info) =>
      format(info.getValue(), "dd 'de' MMMM 'de' yyyy", { locale: es }),
    meta: { width: "w-[160px] min-w-[160px]" },
  },
  {
    header: "Cliente",
    accessorKey: "client_name",
    footer: "Cliente",
    meta: { width: "w-[300px] min-w-[200px]" },
  },
  {
    header: "Total",
    accessorKey: "total",
    footer: "Total",
    cell: (info) => `$${parseFloat(info.getValue()).toFixed(2)}`,
    meta: { width: "w-[100px] min-w-[100px] pr-4" },
  },
  {
    header: "Estado del Pago",
    accessorKey: "payment_status",
    cell: (info) => {
      const { payment_status } = info.row.original;
      let bg = "bg-gray-100";
      switch (payment_status) {
        case "Pagado":
          bg = "bg-[rgba(112,181,0,0.5)]";
          break;
        case "Vencido":
        case "En reclamo":
          bg = "bg-[rgba(235,90,70,0.5)]";
          break;
        case "Pendiente de pago":
          bg = "bg-[rgba(242,214,0,0.5)]";
          break;
        default:
          break;
      }

      return (
        <span className={`responsive-text py-[1px] px-2 rounded-lg ${bg}`}>
          {payment_status}
        </span>
      );
    },
    meta: { width: "w-[180px] min-w-[180px]" },
  },
  {
    header: "# Factura",
    accessorFn: (row) => row.invoice_number || "",
    footer: "Factura",
    cell: (info) => (
      <span className="responsive-text py-[1px] px-2 rounded-lg bg-[rgba(0,121,191,0.5)]">
        {info.row.original.invoice_number}
      </span>
    ),
    meta: { width: "w-[100px] min-w-[180px]" },
  },
  {
    header: "Estado de la entrega",
    accessorKey: "shipping_status",
    cell: (info) => {
      const { shipping_status, scheduled_dispatch_date } = info.row.original;
      let bg = "bg-gray-100";
      if (shipping_status === "Despachado") bg = "bg-[rgba(112,181,0,0.5)]";
      else if (shipping_status === "Despacho agendado")
        bg = "bg-[rgba(242,214,0,0.5)]";
      else if (
        shipping_status === "Rechazado por cliente" ||
        shipping_status === "Sin despacho asignado"
      )
        bg = "bg-[rgba(235,90,70,0.5)]";

      const text =
        shipping_status === "Despacho agendado" && scheduled_dispatch_date
          ? `Programado: ${format(scheduled_dispatch_date, "dd MMMM", {
              locale: es,
            })}`
          : shipping_status;

      return (
        <span className={`responsive-text py-[1px] px-2 rounded-lg ${bg}`}>
          {text}
        </span>
      );
    },
    meta: { width: "w-[180px] min-w-[180px]" },
  },
];

const ClientOrders = ({ client, productCatId }) => {
  const { clientCleaningOrders, clientFoodOrders } = useSelector(
    (state) => state.orders
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(client).length > 0 && productCatId) {
      dispatch(
        getClientOrders({
          clientId: client.id,
          product_category_id: productCatId,
        })
      );
    }
  }, [client, productCatId, dispatch]);

  const handleOnEdit = (id) => navigate(`/admin/orders/${id}`);

  return (
    <div className="section-container">
      <div className="w-full flex-between items-center">
        <span className="client-detail-label mb-0">
          {productCatId === 34 ? "Pedidos de alimentos" : "Pedidos de Limpieza"}
        </span>
      </div>
      <div className="w-[100%]">
        <DataTable
          columns={columns}
          data={productCatId === 34 ? clientFoodOrders : clientCleaningOrders}
          onEdit={handleOnEdit}
          onDelete={() => {}}
          onRowClick={handleOnEdit}
        />
      </div>
    </div>
  );
};

export default ClientOrders;
