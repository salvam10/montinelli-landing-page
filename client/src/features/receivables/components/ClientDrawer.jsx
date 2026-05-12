import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClientInvoices, clearInvoices } from "../../slices/clientInvoicesSlice";
import ClientAvatar from "./ClientAvatar";
import { StatusPill } from "./StatusDot";
import { fmtMoney, bucketOf } from "../receivablesHelpers";

// ─── Iconos inline SVG (ligeros, sin dependencia externa) ────────────────────
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" /><path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 3.5A11 11 0 0 0 3 18l-1 4 4.1-1A11 11 0 1 0 20.5 3.5z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6A2 2 0 0 1 22 16.9z" />
  </svg>
);

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5 9-11" />
  </svg>
);

const XSmallIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

const PAYMENT_TYPE_LABELS = {
  pago_factura: "Pago de factura",
  retencion: "Retención",
  ambos: "Ambos",
};

// ─── Tabs del drawer ─────────────────────────────────────────────────────────
const DrawerTabs = ({ client, invoices, invoicesLoading, sellerPayments }) => {
  const [tab, setTab] = useState("facturas");

  const clientPayments = sellerPayments.filter(
    (p) => String(p.client_id) === String(client.client_id)
  );

  const tabs = [
    { id: "facturas", label: `Facturas (${invoices.length})` },
    { id: "pagos", label: `Pagos reportados (${clientPayments.length})` },
  ];

  return (
    <>
      <div className="flex border-b border-gray-200 px-5 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 bg-transparent cursor-pointer ${
              tab === t.id
                ? "border-orange-500 text-gray-900"
                : "border-transparent text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-5">
        {tab === "facturas" && (
          <>
            {invoicesLoading ? (
              <div className="text-center text-gray-400 py-8 text-sm">
                Cargando facturas...
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm border border-dashed border-gray-200 rounded-lg">
                No hay facturas pendientes para este cliente.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {invoices.map((inv) => {
                  const overdue = inv.status === "vencida";
                  return (
                    <div
                      key={inv.order_id}
                      className="border border-gray-200 rounded-lg p-2.5 grid grid-cols-[1fr_auto] gap-2"
                    >
                      <div>
                        <div className="font-semibold text-[13px] font-mono">
                          {inv.invoice_number}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Emitida {inv.date} · Vence {inv.due}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm tabular-nums">
                          {fmtMoney(inv.amount)}
                        </div>
                        <div className="mt-1">
                          {overdue ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600">
                              {inv.days_overdue} días vencida
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "pagos" && (
          <div className="flex flex-col gap-2">
            {clientPayments.length === 0 ? (
              <div className="text-center text-gray-400 py-8 text-sm border border-dashed border-gray-200 rounded-lg">
                No has reportado pagos para este cliente aún.
              </div>
            ) : (
              clientPayments.map((p) => {
                const st = p.status || "pendiente_validacion";
                const stMeta =
                  st === "validado"
                    ? { color: "text-green-600", bg: "bg-green-50", label: "Validado", Icon: CheckIcon }
                    : st === "rechazado"
                      ? { color: "text-red-600", bg: "bg-red-50", label: "Rechazado", Icon: XSmallIcon }
                      : { color: "text-blue-600", bg: "bg-blue-50", label: "En revisión", Icon: ClockIcon };
                return (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-2.5">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <div className="min-w-0">
                        <div className="font-bold text-sm tabular-nums">
                          {fmtMoney(p.amount)}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {p.payment_date || p.created_at?.slice(0, 10)} ·{" "}
                          {p.method?.replace("_", " ")}
                          {p.reference && ` · Ref. ${p.reference}`}
                          {p.payment_type && PAYMENT_TYPE_LABELS[p.payment_type] && ` · ${PAYMENT_TYPE_LABELS[p.payment_type]}`}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${stMeta.bg} ${stMeta.color}`}
                      >
                        <stMeta.Icon /> {stMeta.label}
                      </span>
                    </div>
                    {p.notes && st === "rechazado" && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-[11px] text-red-600">
                        {p.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ─── Componente principal del drawer ──────────────────────────────────────────
const ClientDrawer = ({ client, onClose, onReportPayment, sellerPayments = [] }) => {
  const dispatch = useDispatch();
  const { items: invoices, isLoading: invoicesLoading } = useSelector(
    (state) => state.clientInvoices
  );

  const open = !!client;

  useEffect(() => {
    if (client?.client_id) {
      dispatch(fetchClientInvoices(client.client_id));
    }
    return () => {
      dispatch(clearInvoices());
    };
  }, [dispatch, client?.client_id]);

  const bucket = client ? bucketOf(client) : null;

  return (
    <>
      {/* Scrim */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[420px] max-w-full bg-gray-50 z-50 shadow-2xl flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {client && (
          <>
            {/* Header */}
            <div className="p-5 border-b border-gray-200 flex items-start gap-3.5">
              <ClientAvatar name={client.client_name} size={44} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[15px] leading-tight">
                  {client.client_name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Crédito {client.credit_days || 0} días
                  {client.last_payment && ` · Último pago ${client.last_payment}`}
                </div>
                <div className="mt-2">
                  <StatusPill bucket={bucket} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-200 text-gray-500"
                aria-label="Cerrar"
              >
                <XIcon />
              </button>
            </div>

            {/* Metrics */}
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2 mb-3 bg-gray-100 border border-gray-200 rounded-lg p-2.5">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                    Bruto
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    {fmtMoney(client.gross_debt || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                    − Crédito
                  </div>
                  <div
                    className={`text-sm font-bold tabular-nums ${
                      Number(client.client_credits) > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {Number(client.client_credits) > 0
                      ? fmtMoney(client.client_credits)
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                    = Neto
                  </div>
                  <div
                    className={`text-sm font-extrabold tabular-nums ${
                      Number(client.net_debt) < 0
                        ? "text-green-600"
                        : "text-gray-900"
                    }`}
                  >
                    {fmtMoney(client.net_debt)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Vencido
                  </div>
                  <div
                    className={`text-xl font-extrabold tabular-nums ${
                      Number(client.overdue_amount) > 0
                        ? "text-red-600"
                        : "text-gray-400"
                    }`}
                  >
                    {fmtMoney(client.overdue_amount || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Mora máxima
                  </div>
                  <div
                    className={`text-xl font-extrabold tabular-nums ${
                      client.max_morosidad_days >= 60
                        ? "text-red-600"
                        : client.max_morosidad_days >= 30
                          ? "text-orange-500"
                          : "text-gray-900"
                    }`}
                  >
                    {client.max_morosidad_days}{" "}
                    <span className="text-xs font-medium text-gray-400">
                      días
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3.5 flex gap-2 flex-wrap border-b border-gray-200">
              <button
                onClick={() => onReportPayment && onReportPayment(client)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                <ReceiptIcon /> Reportar pago
              </button>
              {client.phone && (
                <a
                  href={`https://wa.me/${client.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <WhatsAppIcon /> WhatsApp
                </a>
              )}
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PhoneIcon /> Llamar
                </a>
              )}
            </div>

            {/* Tabs */}
            <DrawerTabs
              client={client}
              invoices={invoices}
              invoicesLoading={invoicesLoading}
              sellerPayments={sellerPayments}
            />
          </>
        )}
      </aside>
    </>
  );
};

export default ClientDrawer;
