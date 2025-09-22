import React, { useState, useEffect } from "react";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useNavigate } from "react-router-dom";
import { changePillBgColor } from "../../helpers/changePillColor";

const SellerOrderItem = ({ order }) => {
  const [managerPillBg, setManagerPillBg] = useState();
  const [shippingPillBg, setShippingPillbg] = useState();
  const navigate = useNavigate();

  // --- Helpers (en inglés) ---
  const normalizeStr = (v) => (v || "").toString().trim().toLowerCase();

  const formatShortDate = (d) => (d ? format(new Date(d), "dd/MM/yyyy") : null);
  const formatDispatchDate = (d) =>
    d ? format(new Date(d), "dd 'de' LLL 'de' yyyy", { locale: es }) : null;

  const shippingBase = (() => {
    const raw = normalizeStr(order?.shipping_status);
    return raw.startsWith("despacho ")
      ? raw.replace("despacho ", "").trim()
      : raw;
  })();

  const shippingLabel = (() => {
    if (shippingBase === "despachado") {
      const date = order?.actual_dispatch_date || order?.updated_at;
      const f = formatDispatchDate(date);
      return f ? `despachado el ${f}` : "despachado";
    }
    if (!shippingBase) return "";
    if (shippingBase === "pendiente") return "despacho pendiente";
    if (shippingBase === "agendado") return "despacho agendado";
    return `despacho ${shippingBase}`;
  })();

  // Due label: only if due_date exists AND paid_at is null
  const dueMeta = (() => {
    if (!order?.due_date) return null;
    if (order?.paid_at) return null;

    const due = startOfDay(new Date(order.due_date));
    const today = startOfDay(new Date());
    const days = differenceInCalendarDays(due, today);

    let text = "";
    if (days > 0) text = `Vence en ${days} días (${formatShortDate(due)})`;
    else if (days === 0) text = `Vence hoy (${formatShortDate(due)})`;
    else text = `Venció hace ${Math.abs(days)} días (${formatShortDate(due)})`;

    // color semantics
    let tone = "text-emerald-700"; // default OK-ish (lejos)
    if (days <= 0) tone = "text-red-600";
    else if (days <= 3) tone = "text-amber-600";
    else tone = "text-neutral-600";

    return { text, tone };
  })();

  useEffect(() => {
    changePillBgColor(
      setManagerPillBg,
      normalizeStr(order?.manager_approval_status)
    );
    changePillBgColor(setShippingPillbg, shippingBase);
  }, [order, shippingBase]);

  const goToOrderDetail = () => navigate(`/orders/${order.id}`);

  // UI helpers
  const Pill = ({ className = "", children }) => (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium " +
        className
      }
    >
      {children}
    </span>
  );

  const SectionLabel = ({ children }) => (
    <span className="text-[11px] uppercase tracking-wide text-neutral-500">
      {children}
    </span>
  );

  return (
    <li key={order.id} className="mb-3">
      <div
        onClick={goToOrderDetail}
        className="group cursor-pointer rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 transition hover:bg-neutral-100"
      >
        {/* Top row: title + menu */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[15px] font-semibold text-neutral-900 leading-tight">
            {order.client_name}
          </h2>
          <button
            type="button"
            className="rounded-full p-1.5 hover:bg-neutral-200"
            aria-label="Más opciones"
            title="Más opciones"
            onClick={(e) => {
              e.stopPropagation();
              // aquí tu handler de menú contextual
            }}
          >
            <MoreHorizIcon fontSize="small" />
          </button>
        </div>

        {/* Meta row */}
        <div className="mt-2 grid grid-cols-1 gap-2 text-[13px] text-neutral-700 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <SectionLabel>Fecha</SectionLabel>
              <span className="text-neutral-800">
                {format(
                  new Date(order.created_at),
                  "dd 'de' MMMM 'de' yyyy, 'a las' HH:mm",
                  { locale: es }
                )}
              </span>
            </div>

            {!!order?.invoice_number && (
              <div className="flex items-center gap-1">
                <SectionLabel># Factura</SectionLabel>
                <span className="text-neutral-800">{order.invoice_number}</span>
              </div>
            )}

            {dueMeta && (
              <div className={`mt-0.5 font-medium ${dueMeta.tone}`}>
                {dueMeta.text}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex items-center gap-1">
              <SectionLabel>Monto total</SectionLabel>
              <span className="text-[15px] font-semibold text-neutral-900">
                $
                {Number(order.total).toLocaleString("es-VE", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Pill className={`badge ${managerPillBg}`}>
                {/* ícono check */}
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414l2.293 2.293 6.543-6.543a1 1 0 0 1 1.414 0z" />
                </svg>
                pedido {normalizeStr(order?.manager_approval_status)}
              </Pill>

              {normalizeStr(order?.manager_approval_status) === "aprobado" && (
                <Pill className={`badge ${shippingPillBg}`}>
                  {/* ícono camión */}
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 7a2 2 0 0 1 2-2h9v8h-2a3 3 0 0 0-3 3H7a3 3 0 0 0-3 3H3V7zm11 0h3.586A2 2 0 0 1 19 7.586L21.414 10A2 2 0 0 1 22 11.414V16h-1a3 3 0 1 1-6 0h-2a3 3 0 1 1-6 0H3" />
                  </svg>
                  {shippingLabel}
                </Pill>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default SellerOrderItem;
