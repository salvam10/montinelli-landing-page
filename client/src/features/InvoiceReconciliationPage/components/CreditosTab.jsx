import React from "react";
import { fmtMoney } from "../utils";

const CreditosTab = ({ creditsByClient, updateClientCredit, updatingClientCredits }) => {
  if (!creditsByClient.length) {
    return (
      <div className="bg-white border rounded-md p-8 text-center text-sm text-slate-500">
        No hay créditos para mostrar con el archivo cargado.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-md overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left text-sm font-bold text-slate-700">Cliente</th>
            <th className="px-3 py-2 text-left text-sm font-bold text-slate-700">
              Crédito Profit
            </th>
            <th className="px-3 py-2 text-left text-sm font-bold text-slate-700">
              Crédito Sistema
            </th>
            <th className="px-3 py-2 text-left text-sm font-bold text-slate-700">Diferencia</th>
            <th className="px-3 py-2 text-left text-sm font-bold text-slate-700">Actualizar</th>
          </tr>
        </thead>
        <tbody>
          {creditsByClient.map((group) => {
            const isUpdating = Boolean(updatingClientCredits[group.clientId]);
            const hasMatch = Boolean(group.clientId);

            return (
              <React.Fragment key={group.clientKey}>
                <tr className="border-b">
                  <td className="px-3 py-2 text-sm text-slate-700">
                    <p className="font-medium">{group.clientName}</p>
                    <p className="text-xs text-slate-500">
                      Código cliente: {group.codigoCliente || "-"}
                    </p>
                    {!hasMatch && (
                      <p className="text-xs text-amber-600">
                        Cliente sin match en sistema (por profit_code)
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-700">
                    {fmtMoney(group.creditoProfit)}
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-700">
                    {fmtMoney(group.creditoSistema)}
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <span
                      className={`font-medium ${
                        Number(group.diferencia) === 0 ? "text-green-700" : "text-amber-700"
                      }`}
                    >
                      {fmtMoney(group.diferencia)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-slate-700">
                    <button
                      type="button"
                      onClick={() => updateClientCredit(group)}
                      disabled={!hasMatch || isUpdating}
                      className="bg-blue-600 text-white rounded-md px-3 py-2 text-xs disabled:opacity-50"
                    >
                      {isUpdating ? "Actualizando..." : "Actualizar"}
                    </button>
                  </td>
                </tr>
                <tr className="border-b bg-slate-50/50">
                  <td colSpan={5} className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                      Detalle de documentos
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] border-collapse text-xs">
                        <thead>
                          <tr>
                            <th className="text-left py-1 pr-2 text-slate-500">Tipo</th>
                            <th className="text-left py-1 pr-2 text-slate-500">Número</th>
                            <th className="text-left py-1 pr-2 text-slate-500">Neto</th>
                            <th className="text-left py-1 pr-2 text-slate-500">Saldo</th>
                            <th className="text-left py-1 pr-2 text-slate-500">Crédito</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.documents.map((document) => (
                            <tr key={document.rowId}>
                              <td className="py-1 pr-2 text-slate-600">{document.tipoDocumento}</td>
                              <td className="py-1 pr-2 text-slate-600">#{document.numero}</td>
                              <td className="py-1 pr-2 text-slate-600">{fmtMoney(document.neto)}</td>
                              <td className="py-1 pr-2 text-slate-600">{fmtMoney(document.saldo)}</td>
                              <td className="py-1 pr-2 text-slate-700 font-medium">
                                {fmtMoney(document.montoCredito)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CreditosTab;
