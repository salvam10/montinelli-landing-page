import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "../../features/dataTable/DataTable";
import { deleteOrder, getOrders } from "../../features/slices/ordersSlice";
import DeleteOrderModal from "../../features/modals/DeleteOrderModal";
import { useNavigate } from "react-router-dom";
import { orderTableFilters } from "../../dummy";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useParams } from "react-router-dom";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";

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
    meta: { width: "w-[250px] min-w-[250]" },
  },
  {
    header: "Vendedor",
    accessorKey: "user_fullname",
    footer: "Usuario",
    meta: { width: "w-[180px] min-w-[180px]" },
  },
  {
    header: "Total",
    accessorKey: "total",
    footer: "Total",
    cell: (info) => `$${parseFloat(info.getValue()).toFixed(2)}`,
    meta: { width: "w-[100px] min-w-[100px] pr-4" },
  },
  {
    header: "Estado de Facturación",
    accessorKey: "billing_status",
    footer: "Estado de Facturación",
    cell: (info) => {
      const invoiceDate = info.row.original.invoice_date;
      const isInvoiced = !!invoiceDate;
      const text = isInvoiced ? "facturado" : "sin facturar";
      const bg = isInvoiced
        ? "bg-[rgba(112,181,0,0.5)]"
        : "bg-[rgba(242,214,0,0.5)]";

      return (
        <span className={`responsive-text py-[1px] px-2 rounded-lg ${bg}`}>
          {text}
        </span>
      );
    },
    meta: { width: "w-[180px] min-w-[180px]" },
  },
  {
    header: "# Factura",
    accessorKey: "invoice_number",
    footer: "Factura",
    cell: (info) => {
      const invoiceNumber = info.row.original.invoice_number;
      return (
        <span
          className={`responsive-text py-[1px] px-2 rounded-lg bg-[rgba(0,121,191,0.5)]`}
        >
          {invoiceNumber}
        </span>
      );
    },
    meta: { width: "w-[180px] min-w-[180px]" },
  },
];

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allOrders, orders } = useSelector((state) => state.orders);

  const [openModal, setOpenModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [managerStatus, setManagerStatus] = useState("pendiente"); // nuevo estado
  const { prodCategoryId } = useParams();

  useEffect(() => {
    dispatch(getOrders({ product_category_id: prodCategoryId }));
  }, [prodCategoryId]);

  useEffect(() => {
    dispatch(
      getOrders({
        manager_approval_status: managerStatus,
        product_category_id: prodCategoryId,
      })
    );
  }, [dispatch, managerStatus, prodCategoryId]);

  useEffect(() => {
    if (isDeleteConfirmed && orderId) {
      dispatch(deleteOrder({ orderId }));
      setIsDeleteConfirmed(false);
    }
  }, [isDeleteConfirmed, orderId, dispatch]);

  const handleOnDelete = (id) => {
    setOrderId(id);
    setOpenModal(true);
  };

  const handleOnEdit = (id) => {
    navigate(`/admin/orders/${id}`);
  };

  const onRowClick = (id) => {
    navigate(`/admin/orders/${id}`);
  };

 const orderCountsByStatus = allOrders.reduce((acc, order) => {
   const status = order.manager_approval_status || "sin_status";
   acc[status] = (acc[status] || 0) + 1;
   return acc;
 }, {});

  return (
    <div className="w-full overflow-x-hidden px-6">
      <div className="flex-between py-6">
        <h3 className="text-xl font-bold">
          Pedidos {prodCategoryId == 34 ? "Alimentos" : "Limpieza"}
        </h3>
        <CustomFormButton
          handleClickFunction={() => navigate("/admin/orders/create")}
          text="Crear pedido"
          fontBold={true}
          color="bg-[#0079bf]"
          textColor="text-white"
          width={"w-[150px]"}
        />
      </div>

      <div className="bg-white rounded-t-md p-2 border-t border-x">
        <ul className="flex gap-2 text-sm">
          {orderTableFilters.map(({ label, value }) => (
            <li
              key={value ?? "todos"}
              onClick={() => setManagerStatus(value)}
              className={`flex gap-1 items-center py-1 px-3 cursor-pointer rounded-md hover:bg-[#EBEBEB] ${
                managerStatus === value ? "bg-[#EBEBEB] font-semibold" : ""
              }`}
            >
              <span>{label}</span>
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#E5E5E5] text text-[10px] font-bold shadow-inner">
                {orderCountsByStatus[value] || 0}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        rows={orders}
        onEdit={handleOnEdit}
        onDelete={handleOnDelete}
        onRowClick={onRowClick}
      />

      {openModal && (
        <DeleteOrderModal
          setOpenModal={setOpenModal}
          setIsDeleteConfirmed={setIsDeleteConfirmed}
        />
      )}
    </div>
  );
};

export default OrdersPage;
