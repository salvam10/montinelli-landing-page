import React from "react";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import FacturasTab from "./components/FacturasTab";
import CreditosTab from "./components/CreditosTab";
import SummaryCards from "./components/SummaryCards";
import { useReconciliation } from "./hooks/useReconciliation";

const InvoiceReconciliationPage = () => {
  const {
    file,
    activeTab,
    invoiceRows,
    creditsByClient,
    normalizationSummary,
    isPreviewLoading,
    isApplying,
    updatingClientCredits,
    resultMsg,
    approvedCount,
    summary,
    setActiveTab,
    handleFileChange,
    toggleApprove,
    applyApprovedChanges,
    updateClientCredit,
  } = useReconciliation();

  return (
    <div className="w-full overflow-x-hidden px-6">
      <div className="flex-between py-6">
        <div>
          <h3 className="text-3xl font-bold text-slate-800">Conciliación de Facturas</h3>
          <p className="text-slate-500 mt-1">
            Cargue el Excel de Profit para conciliar facturas y créditos por cliente.
          </p>
        </div>
        <button className="border rounded-md px-4 py-2 bg-white hover:bg-gray-50 flex items-center gap-2">
          <HistoryOutlinedIcon fontSize="small" />
          Ver Historial
        </button>
      </div>

      <div className="bg-white border rounded-md p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="font-medium">{file?.name || "No hay archivo cargado"}</p>
          <p className="text-sm text-slate-500">
            {file
              ? `${normalizationSummary.normalizedRows} filas normalizadas · ${normalizationSummary.droppedRows} descartadas · ${normalizationSummary.excludedTypeRows} excluidas`
              : "Seleccione un .xlsx o .xls para iniciar"}
          </p>
        </div>
        <label className="border rounded-md px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2">
          <UploadFileOutlinedIcon fontSize="small" />
          Cargar archivo
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <SummaryCards summary={summary} />

      <div className="bg-white border rounded-md p-1 mb-4 inline-flex">
        <button
          type="button"
          onClick={() => setActiveTab("facturas")}
          className={`px-4 py-2 rounded-md text-sm ${
            activeTab === "facturas"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Facturas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("creditos")}
          className={`px-4 py-2 rounded-md text-sm ${
            activeTab === "creditos"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Créditos
        </button>
      </div>

      {isPreviewLoading ? (
        <div className="bg-white border rounded-md p-6 text-sm text-slate-600">
          Procesando archivo...
        </div>
      ) : activeTab === "facturas" ? (
        <FacturasTab rows={invoiceRows} toggleApprove={toggleApprove} />
      ) : (
        <CreditosTab
          creditsByClient={creditsByClient}
          updateClientCredit={updateClientCredit}
          updatingClientCredits={updatingClientCredits}
        />
      )}

      {activeTab === "facturas" && (
        <div className="flex justify-end mt-6">
          <button
            onClick={applyApprovedChanges}
            disabled={!approvedCount || isApplying}
            className="bg-blue-600 text-white rounded-md px-6 py-3 disabled:opacity-50"
          >
            {isApplying
              ? "Aplicando..."
              : `Aplicar cambios aprobados (${approvedCount})`}
          </button>
        </div>
      )}

      {resultMsg && <p className="mt-3 text-sm text-slate-600">{resultMsg}</p>}
    </div>
  );
};

export default InvoiceReconciliationPage;
