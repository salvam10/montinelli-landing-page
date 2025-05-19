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

const columns = [
  {
    header: "Pedido",
    accessorKey: "id",
    footer: "ID",
  },
  {
    header: "Fecha",
    accessorKey: "created_at",
    footer: "Fecha de Creación",
    cell: (info) =>
      format(info.getValue(), "dd 'de' MMMM 'de' yyyy", { locale: es }),
  },
  {
    header: "Cliente",
    accessorKey: "client_name",
    footer: "Cliente",
  },
  {
    header: "Vendedor",
    accessorKey: "user_fullname",
    footer: "Usuario",
  },
  {
    header: "Total",
    accessorKey: "total",
    footer: "Total",
    cell: (info) => `$${parseFloat(info.getValue()).toFixed(2)}`,
  },
  {
    header: "Estatus de Aprobación",
    accessorKey: "manager_approval_status",
    footer: "Estatus de Aprobación",
  },
];

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders } = useSelector((state) => state.orders);

  const [openModal, setOpenModal] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [managerStatus, setManagerStatus] = useState("pendiente"); // nuevo estado
  const { prodCategoryId } = useParams();

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

  return (
    <div className="w-full overflow-x-hidden px-6">
      <div className="py-6">
        <h3 className="text-xl font-bold">Pedidos</h3>
      </div>

      <div className="bg-white rounded-t-md p-2 border-t border-x">
        <ul className="flex gap-2 text-sm">
          {orderTableFilters.map(({ label, value }) => (
            <li
              key={value ?? "todos"}
              onClick={() => setManagerStatus(value)}
              className={`py-1 px-3 cursor-pointer rounded-md hover:bg-[#EBEBEB] ${
                managerStatus === value ? "bg-[#EBEBEB] font-semibold" : ""
              }`}
            >
              {label}
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
