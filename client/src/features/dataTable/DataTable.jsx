import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import ArrowDropUpOutlinedIcon from "@mui/icons-material/ArrowDropUpOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import ArrowForwardIosOutlinedIcon from "@mui/icons-material/ArrowForwardIosOutlined";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";

const DataTable = ({ data, columns, onEdit, onDelete, onRowClick }) => {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filtering,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
  });

  return (
    <div className="flex flex-col gap-4 bg-white rounded-b-md border py-2">
      {data.length > 0 ? (
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="responsive-text text-left pl-2"
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1">
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <span>
                          {
                            {
                              asc: <ArrowDropUpOutlinedIcon />,
                              desc: <ArrowDropDownOutlinedIcon />,
                            }[header.column.getIsSorted() ?? null]
                          }
                        </span>
                      </div>
                    )}
                  </th>
                ))}
                <th className="responsive-text text-left">Acciones</th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                className="responsive-text border-b cursor-pointer hover:bg-gray-100"
                key={row.id}
                onClick={() => onRowClick(row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2 pl-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="py-2 pl-4" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => onDelete(row.original.id)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex-center">
          <span className="font-bold">No hay Pedidos</span>
        </div>
      )}

      {data.length > 0 && (
        <div className="flex gap-2 mt-2 ml-2">
          {/* <button onClick={() => table.setPageIndex(0)}>⏮ Primer Página</button> */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="w-[28px] h-[28px] py-1 pl-2 pr-1 bg-[rgba(235,235,235,1)] rounded-tl-full rounded-bl-full cursor-pointer">
              <ArrowBackIosOutlinedIcon
                style={{
                  fontSize: "small",
                  color: "#B3B3B3",
                  fontWeight: "600",
                }}
              />
            </span>
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="w-[28px] h-[28px] py-1 pl-1 pr-2 bg-[rgba(235,235,235,1)] rounded-tr-full rounded-br-full cursor-pointer">
              <ArrowForwardIosOutlinedIcon
                style={{
                  fontSize: "small",
                  color: "#B3B3B3",
                  fontWeight: "600",
                }}
              />
            </span>
          </button>
          {/*  <button onClick={() => table.setPageIndex(table.getPageCount() - 1)}>
          ⏭ Última Página
        </button> */}
        </div>
      )}
    </div>
  );
};

export default DataTable;
