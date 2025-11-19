import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getClients } from "../../features/slices/clientsSlice";
import DeleteOrderModal from "../../features/modals/DeleteOrderModal";
import CustomCombobox from "../../features/customCombobox/CustomCombobox";
import CustomFormButton from "../../features/customFormButton/CustomFormButton";
import DataTable from "../../features/dataTable/DataTable";
import { orderTableFilters } from "../../dummy";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

const fmtMoney = (v) =>
  isNaN(Number(v))
    ? "$0.00"
    : `$${Number(v).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

const SELLER_STORAGE_KEY = "ar_selectedSeller";

const columns = [
  {
    header: "Id",
    accessorKey: "id",
    footer: "ID",
    meta: { width: "w-[80px] min-w-[80px]" },
  },
  {
    header: "Nombre del cliente",
    accessorKey: "name",
    footer: "Nombre del cliente",
    meta: { width: "w-[350px] min-w-[250px]" },
  },
  {
    header: "Deuda Total",
    accessorFn: (row) => fmtMoney(row.debt_total),
    footer: "Total Deuda",
    meta: { width: "w-[130px] min-w-[160px]", align: "right" },
  },
  {
    header: "Morosidad (días)",
    accessorKey: "max_days_overdue",
    footer: "Atraso",
    meta: { width: "w-[160px] min-w-[160px]", align: "center" },
  },
  {
    header: "Monto Vencido",
    accessorFn: (row) => fmtMoney(row.overdue_amount),
    footer: "Vencido",
    cell: (info) => {
      const amount = info.row.original.overdue_amount || 0;
      const hasOverdue = amount > 0;

      const bg = hasOverdue ? "bg-[rgba(235,90,70,0.5)] font-bold" : "";

      return (
        <span className={`responsive-text py-[1px] px-2 rounded-lg ${bg}`}>
          {fmtMoney(amount)}
        </span>
      );
    },
    meta: { width: "w-[150px] min-w-[150px]", align: "right" },
  },
  {
    header: "Facturas Vencidas",
    accessorKey: "invoices_overdue",
    footer: "Vencidas",
    meta: { width: "w-[150px] min-w-[110px]", align: "center" },
  },
  {
    header: "Monto Pendiente",
    accessorFn: (row) => fmtMoney(row.pending_amount),
    footer: "Pendiente",
    meta: { width: "w-[150px] min-w-[150px]", align: "right" },
  },
  {
    header: "Facturas Pendientes",
    accessorKey: "invoices_pending",
    footer: "Pendientes",
    meta: { width: "w-[180px] min-w-[110px]", align: "center" },
  },
  {
    header: "Crédito (días)",
    accessorKey: "credit_days",
    footer: "Crédito",
    meta: { width: "w-[140px] min-w-[140px]", align: "center" },
  },
  {
    header: "Facturas Pagadas",
    accessorKey: "invoices_paid",
    footer: "Pagadas",
    meta: { width: "w-[150px] min-w-[100px]", align: "center" },
  },
  {
    header: "Facturas Totales",
    accessorKey: "invoices_total",
    footer: "Totales",
    meta: { width: "w-[150px] min-w-[120px]", align: "center" },
  },
  {
    header: "Última actualización",
    accessorKey: "last_debt_check",
    footer: "Última actualización",
    cell: (info) => {
      const value = info.getValue();
      if (!value) return "—"; // o "Sin revisión", "No registrada", etc.
      return formatInTimeZone(
        value, // Date | string | number
        "America/Caracas", // zona objetivo
        "dd 'de' MMM 'de' yyyy, hh:mm a",
        { locale: es }
      );
    },
    meta: { width: "w-[250px] min-w-[250px]" },
  },
];

const AccountsReceivablePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clients } = useSelector((state) => state.clients);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getClients());
  }, []);

  // Cargar vendedor desde localStorage al iniciar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SELLER_STORAGE_KEY);
      if (stored) {
        const parsed = Number(stored);
        if (!Number.isNaN(parsed)) {
          setSelectedSellerId(parsed);
        }
      }
    } catch (err) {
      console.error("Error leyendo vendedor desde localStorage", err);
    }
  }, []);

  // Guardar vendedor en localStorage cuando cambie
  useEffect(() => {
    try {
      if (selectedSellerId) {
        localStorage.setItem(SELLER_STORAGE_KEY, String(selectedSellerId));
      } else {
        localStorage.removeItem(SELLER_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Error guardando vendedor en localStorage", err);
    }
  }, [selectedSellerId]);

  // Lista de vendedores disponibles (deduplicados) a partir de los clientes
  const sellers = useMemo(() => {
    const map = new Map();
    (clients || []).forEach((c) => {
      if (c.user_id && !map.has(c.user_id)) {
        map.set(c.user_id, {
          id: c.user_id,
          name: c.seller_name || `Vendedor ${c.user_id}`,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.name).localeCompare(String(b.name), "es", {
        sensitivity: "base",
      })
    );
  }, [clients]);

  // Clientes filtrados por vendedor y totales calculados solo con ese filtro
  const { filteredClients, totals } = useMemo(() => {
    const acc = { total: 0, overdue: 0, pending: 0 };
    let list = clients || [];

    if (selectedSellerId) {
      const sellerIdNumber = Number(selectedSellerId);
      list = list.filter((c) => Number(c.user_id) === sellerIdNumber);
    }

    list.forEach((c) => {
      acc.total += Number(c?.debt_total) || 0;
      acc.overdue += Number(c?.overdue_amount) || 0;
      acc.pending += Number(c?.pending_amount) || 0;
    });

    return { filteredClients: list, totals: acc };
  }, [clients, selectedSellerId]);

  const onRowClick = (id) => navigate(`/admin/clients/${id}`);
  const handleOnDelete = () => {
    console.log("Delete client action triggered");
  };

  return (
    <div className="w-full overflow-x-hidden px-6">
      <div className="flex-between py-6">
        <h3 className="text-xl font-bold">Cuentas por Cobrar</h3>
        <CustomFormButton
          handleClickFunction={() => navigate("/admin/clients/create")}
          text="Agregar Cliente"
          fontBold={true}
          color="bg-[#0079bf]"
          textColor="text-white"
          width="w-[150px]"
        />
      </div>

      <div className="bg-white border rounded-md p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center justify-between border rounded-md p-3">
            <span className="text-sm text-gray-600">Monto Total</span>
            <span className="text-base font-semibold">
              {fmtMoney(totals.total)}
            </span>
          </div>
          <div className="flex items-center justify-between border rounded-md p-3">
            <span className="text-sm text-gray-600">Monto Vencido</span>
            <span className="text-base font-semibold">
              {fmtMoney(totals.overdue)}
            </span>
          </div>
          <div className="flex items-center justify-between border rounded-md p-3">
            <span className="text-sm text-gray-600">Monto Pendiente</span>
            <span className="text-base font-semibold">
              {fmtMoney(totals.pending)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border-x border-b p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="block mb-1 text-xs text-gray-500">
              Buscar cliente
            </label>
            <input
              type="text"
              placeholder="Buscar cliente..."
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="block mb-1 text-xs text-gray-500">Vendedor</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <CustomCombobox
                  options={[
                    { value: "", label: "Todos los vendedores" },
                    ...sellers.map((s) => ({
                      value: s.id,
                      label: s.name,
                    })),
                  ]}
                  selected={selectedSellerId ?? ""}
                  setSelected={(val) => {
                    const parsed = val === "" ? null : Number(val);
                    setSelectedSellerId(parsed);
                  }}
                  px="px-3 "
                  py="py-2 "
                />
              </div>

              {selectedSellerId && (
                <button
                  type="button"
                  onClick={() => setSelectedSellerId(null)}
                  className="px-3 py-2 text-sm border rounded-md hover:bg-gray-100"
                >
                  X
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredClients}
        onDelete={handleOnDelete}
        globalFilter={searchTerm}
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default AccountsReceivablePage;
