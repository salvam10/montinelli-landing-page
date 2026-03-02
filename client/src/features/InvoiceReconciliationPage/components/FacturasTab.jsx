import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import ArrowDropUpOutlinedIcon from "@mui/icons-material/ArrowDropUpOutlined";
import UnfoldMoreOutlinedIcon from "@mui/icons-material/UnfoldMoreOutlined";

const StatusPill = ({ children, color = "gray" }) => {
  const colors = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs ${colors[color]}`}>
      {children}
    </span>
  );
};

const getProfitStatusColor = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "pagada") return "green";
  if (normalized === "pendiente") return "yellow";
  return "gray";
};

const getDbStatusColor = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "pagada") return "green";
  if (normalized === "vencida") return "red";
  if (normalized === "pendiente") return "yellow";
  return "gray";
};

const hasAmountMismatch = (row) =>
  Math.abs(Number(row.dbTotal || 0) - Number(row.excelNeto || 0)) > 0.009;

const fmtFacturaMoney = (value) => {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return `$${(0).toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${number.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const FacturasTab = ({ rows, toggleApprove }) => {
  const [sorting, setSorting] = useState([]);

  const matchedRows = useMemo(
    () => rows.filter((row) => Boolean(row.matchedOrderId)),
    [rows],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "excelInvoiceNumber",
        header: "Factura #",
        cell: ({ row }) => (
          <span className="font-medium">#{row.original.excelInvoiceNumber || "-"}</span>
        ),
      },
      {
        accessorKey: "dbClientName",
        header: "Cliente",
        meta: {
          width: "min-w-[240px]",
        },
      },
      {
        accessorKey: "emision",
        header: "Emisión",
        cell: ({ row }) => <span>{row.original.emision || "-"}</span>,
      },
      {
        accessorKey: "dbTotal",
        header: "Monto",
        cell: ({ row }) => (
          <span className={hasAmountMismatch(row.original) ? "text-red-600" : ""}>
            {fmtFacturaMoney(row.original.dbTotal)}
          </span>
        ),
      },
      {
        accessorKey: "excelNeto",
        header: "Monto Profit",
        cell: ({ row }) => (
          <span className={hasAmountMismatch(row.original) ? "text-red-600" : ""}>
            {fmtFacturaMoney(row.original.excelNeto)}
          </span>
        ),
      },
      {
        accessorKey: "dbPending",
        header: "Saldo BD",
        cell: ({ row }) => <span>{fmtFacturaMoney(row.original.dbPending)}</span>,
      },
      {
        accessorKey: "excelSaldo",
        header: "Saldo Profit",
        cell: ({ row }) => <span>{fmtFacturaMoney(row.original.excelSaldo)}</span>,
      },
      {
        accessorKey: "dbStatus",
        header: "Estado BD",
        cell: ({ row }) => (
          <StatusPill color={getDbStatusColor(row.original.dbStatus)}>
            {row.original.dbStatus || "-"}
          </StatusPill>
        ),
      },
      {
        accessorKey: "excelStatus",
        header: "Estado Profit",
        cell: ({ row }) => (
          <StatusPill color={getProfitStatusColor(row.original.excelStatus)}>
            {row.original.excelStatus || "-"}
          </StatusPill>
        ),
      },
      {
        id: "approve",
        header: "Aprobar",
        enableSorting: false,
        cell: ({ row }) => (
          <label className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleApprove(row.original.rowId)}
              disabled={!row.original.canToggle}
              className={`w-12 h-7 rounded-full relative transition ${
                row.original.approved ? "bg-blue-600" : "bg-gray-300"
              } ${!row.original.canToggle ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition ${
                  row.original.approved ? "left-5" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-slate-600">
              {!row.original.canToggle
                ? "N/A"
                : row.original.approved
                  ? "Aprobada"
                  : "Pendiente"}
            </span>
          </label>
        ),
      },
    ],
    [toggleApprove],
  );

  const table = useReactTable({
    data: matchedRows,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-white border rounded-md overflow-x-auto">
      <table className="min-w-[1200px] w-full border-collapse text-sm">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`px-3 py-2 whitespace-nowrap text-left text-sm font-bold text-slate-700 ${
                    header.column.columnDef.meta?.width || ""
                  }`}
                >
                  {header.isPlaceholder ? null : (
                    <div className="inline-flex items-center gap-1">
                      <span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="text-slate-500 hover:text-slate-700"
                          aria-label={`Ordenar por ${String(
                            header.column.columnDef.header || "",
                          )}`}
                        >
                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowDropUpOutlinedIcon fontSize="small" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDropDownOutlinedIcon fontSize="small" />
                          ) : (
                            <UnfoldMoreOutlinedIcon fontSize="small" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50 text-sm">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`px-3 py-2 whitespace-nowrap text-left text-sm text-slate-700 ${
                    cell.column.columnDef.meta?.width || ""
                  }`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {!matchedRows.length && (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-sm text-slate-500">
                {rows.length
                  ? "No hay facturas con match entre Profit y base de datos."
                  : "Carga un archivo para iniciar la conciliación de facturas."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FacturasTab;
