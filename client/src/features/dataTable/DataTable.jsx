import React, { useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const DataTable = ({ columns, rows, slug, deleteItem, rowId}) => {
  const actionColumn = {
    field: "action",
    headerName: "Action",
    width: 200,
    renderCell: (params) => {
      return (
        <div className="flex items-center cursor-pointer gap-2">
          <Link to={`/admin/${slug}/${params.row.id}`}>
            <EditNoteOutlinedIcon style={{ fontSize: "20px", color:'green' }} />
          </Link>
          <div
            className="delete"
            onClick={() => {
              deleteItem(params.row.id);
            }}
          >
            <DeleteOutlineOutlinedIcon style={{ fontSize: "20px", color: 'red' }} />
          </div>
        </div>
      );
    },
  };

  return (
    <div className="dataTable">
      <DataGrid
        className="bg-white flex"
        rows={rows}
        columns={[...columns, actionColumn]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        columnVisibilityModel={{
          password: false,
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        pageSizeOptions={[5]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </div>
  );
};

export default DataTable;
