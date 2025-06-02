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

const DataTable = ({
  data,
  columns,
  onEdit,
  onDelete,
  onRowClick,
  globalFilter,
}) => {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter: globalFilter || "",
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4 bg-white rounded-b-md border py-2">
      {data.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto">
            <table className="min-w-[900px] w-full table-fixed border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`text-left pl-2 py-2 whitespace-nowrap text-sm font-semibold ${
                          header.column.columnDef.meta?.width || ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {!header.isPlaceholder && (
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
                    <th className="text-left py-2 pl-2 whitespace-nowrap text-sm font-semibold w-[80px] min-w-[80px]">
                      Acciones
                    </th>
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => onRowClick(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`py-2 pl-2 whitespace-nowrap ${
                          cell.column.columnDef.meta?.width || ""
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    <td
                      className="py-2 pl-4 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button onClick={() => onDelete(row.original.id)}>
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 mt-2 ml-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="w-[28px] h-[28px] py-1 pl-2 pr-1 bg-[#EBEBEB] rounded-tl-full rounded-bl-full cursor-pointer">
                <ArrowBackIosOutlinedIcon fontSize="small" />
              </span>
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="w-[28px] h-[28px] py-1 pl-1 pr-2 bg-[#EBEBEB] rounded-tr-full rounded-br-full cursor-pointer">
                <ArrowForwardIosOutlinedIcon fontSize="small" />
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="flex justify-center py-4">
          <span className="font-bold text-gray-500">No hay Pedidos</span>
        </div>
      )}
    </div>
  );
};

export default DataTable;
