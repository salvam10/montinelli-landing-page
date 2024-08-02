import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import DataTable from "../../features/dataTable/DataTable";
import { deleteOrder, getOrders } from "../../features/slices/ordersSlice";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const columns = [
  { field: "id", headerName: "ID", width: 90, type: "number" },
  {
    field: "created_at",
    headerName: "Fecha",
    width: 150,
    type: "string",
    valueFormatter: (params) => {
      const date = new Date(params);
      if (!isNaN(date)) {
        return format(date, "dd MMM yyyy", { locale: es });
      }
      return params;
    },
  },
  { field: "client_name", headerName: "Cliente", width: 150, type: "string" },
  {
    field: "payment_status",
    headerName: "Status",
    width: 150,
    type: "string",
  },
  {
    field: "payment_method",
    headerName: "Método de pago",
    width: 200,
    type: "string",
  },
  {
    field: "total",
    headerName: "Total $",
    width: 90,
    type: "number",
    valueFormatter: (params) => `${params} $`,
  },
  {
    field: "user_fullname",
    headerName: "Vendedor",
    width: 200,
    type: "string",
    valueFormatter: (params) => {
      return params;
    }
      
  },
];

const OrdersPage = () => {
  const { orders } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  useEffect(() => {
    try {
      dispatch(getOrders({}));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const handleOnDelete = (orderId) => {
    dispatch(deleteOrder({orderId}))
  }

  return (
    <div className="w-full overflow-x-hidden !px-6">
      <div className="py-6">
        <h3 className="text-[20px] font-bold">Pedidos</h3>
      </div>
      <div className="">
        <DataTable
          slug="orders"
          columns={columns}
          rows={orders}
          deleteItem={handleOnDelete}
        />
      </div>
    </div>
  );
};

export default OrdersPage;
