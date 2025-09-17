import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getClients } from "../../features/slices/clientsSlice";
import DeleteOrderModal from "../../features/modals/DeleteOrderModal";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";
import DataTable from "../../features/dataTable/DataTable";
import { orderTableFilters } from "../../dummy";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const fmtMoney = (v) =>
  isNaN(Number(v))
    ? "$0.00"
    : `$${Number(v).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

    
const columns = [
  {
    header: "Id",
    accessorKey: "id",
    footer: "ID",
    meta: { width: "w-[80px] min-w-[80px]" },
  },
  {
    header: "Rif",
    accessorKey: "rif",
    footer: "Rif",
    meta: { width: "w-[160px] min-w-[160px]" },
  },
  {
    header: "Nombre del cliente",
    accessorKey: "name",
    footer: "Nombre del cliente",
    meta: { width: "w-[350px] min-w-[250px]" },
  },
  {
    header: "Ubicación",
    accessorFn: (row) => {
      const city = row.city || "";
      const municipality = row.municipality || "";
      return [city, municipality].filter(Boolean).join(", ");
    },
    footer: "Ubicación",
    meta: { width: "w-[200px] min-w-[200px]" },
  },
];



const ClientsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clients } = useSelector((state) => state.clients);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getClients());
  }, []);

  const onRowClick = (id) => navigate(`/admin/clients/${id}`);
  const handleOnDelete = () => {
    console.log("Delete client action triggered");
  };

  return (
    <div className="w-full overflow-x-hidden px-6">
      <div className="flex-between py-6">
        <h3 className="text-xl font-bold">Clientes</h3>
        <CustomFormButton
          handleClickFunction={() => navigate("/admin/clients/create")}
          text="Agregar Cliente"
          fontBold={true}
          color="bg-[#0079bf]"
          textColor="text-white"
          width="w-[150px]"
        />
      </div>
      <div className="bg-white border-x border-b p-4">
        <input
          type="text"
          placeholder="Buscar cliente..."
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="w-full md:w-1/3 px-3 py-2 border rounded-md text-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={clients}
        onDelete={handleOnDelete}
        globalFilter={searchTerm}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default ClientsPage;
