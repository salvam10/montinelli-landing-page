import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import ReportPaymentModal from "./ReportPaymentModal";
import { getClients } from "../../slices/clientsSlice";
import { submitAdminPaymentReport } from "../../slices/pendingReceiptsSlice";

const AdminReportPaymentModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { clients, isLoading } = useSelector((state) => state.clients);
  const { isSubmittingPayment } = useSelector((state) => state.pendingReceipts);

  useEffect(() => {
    if (!clients.length) {
      dispatch(getClients());
    }
  }, [clients.length, dispatch]);

  const options = useMemo(
    () =>
      clients.map((client) => ({
        ...client,
        client_id: client.client_id ?? client.id,
        client_name: client.client_name ?? client.name,
      })),
    [clients]
  );

  return (
    <ReportPaymentModal
      clients={options}
      initialClient={null}
      onClose={onClose}
      isSubmitting={isSubmittingPayment}
      submitPayment={(paymentData) =>
        dispatch(submitAdminPaymentReport(paymentData)).unwrap()
      }
      onSuccess={onSuccess}
      stepCopy={{
        upload: "Subí el comprobante enviado por el cliente",
        details: "Elegí el cliente y verificá los datos",
        review: "Revisá y registrá el pago",
      }}
      successCopy={{
        title: "Pago registrado",
        description: ({ client }) =>
          `El pago de ${client?.client_name || "este cliente"} quedó listo para validación administrativa.`,
      }}
      renderClientSelector={({ client, setClient }) => (
        <div>
          <label className="block text-[11px] text-gray-400 uppercase tracking-wide font-bold mb-1.5">
            Cliente
          </label>
          <Autocomplete
            options={options}
            value={client}
            onChange={(_event, value) => setClient(value)}
            loading={isLoading}
            getOptionLabel={(option) =>
              `${option.client_name || ""}${option.profit_code ? ` · ${option.profit_code}` : ""}`
            }
            isOptionEqualToValue={(option, value) =>
              String(option.client_id) === String(value?.client_id)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Buscar cliente por nombre o código"
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.client_id}>
                <div className="flex w-full items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{option.client_name}</div>
                    <div className="text-xs text-gray-500">
                      {option.profit_code || option.client_id} · {option.seller_name || "Sin vendedor"}
                    </div>
                  </div>
                </div>
              </li>
            )}
          />
        </div>
      )}
    />
  );
};

export default AdminReportPaymentModal;
