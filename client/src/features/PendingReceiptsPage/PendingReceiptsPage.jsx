import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchPendingReceipts,
  changePaymentStatus,
} from "../slices/pendingReceiptsSlice";
import { getReceiptUrl } from "../../api/receivablesApi";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

// ─── Helpers ────────────────────────────────────────────────────────────────────

const METHOD_LABELS = {
  transferencia: "Transferencia",
  pago_movil: "Pago móvil",
  zelle: "Zelle",
  efectivo: "Efectivo",
  cheque: "Cheque",
};

const METHOD_STYLES = {
  transferencia: "bg-green-50 text-green-700 border-green-200",
  pago_movil: "bg-orange-50 text-orange-700 border-orange-200",
  zelle: "bg-blue-50 text-blue-700 border-blue-200",
  efectivo: "bg-gray-50 text-gray-700 border-gray-200",
  cheque: "bg-purple-50 text-purple-700 border-purple-200",
};

const fmtMoney = (n) =>
  Number(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toISOString().slice(0, 10);
};

const timeAgo = (d) => {
  if (!d) return "";
  const now = new Date();
  const date = new Date(d);
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
};

// ─── Receipt lightbox ───────────────────────────────────────────────────────────

const ReceiptLightbox = ({ url, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="relative max-h-[90vh] max-w-[90vw]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
      >
        <CloseOutlinedIcon fontSize="small" />
      </button>
      {url.endsWith(".pdf") ? (
        <iframe
          src={url}
          title="Comprobante PDF"
          className="h-[85vh] w-[70vw] rounded-lg bg-white"
        />
      ) : (
        <img
          src={url}
          alt="Comprobante de pago"
          className="max-h-[85vh] rounded-lg object-contain shadow-xl"
        />
      )}
    </div>
  </div>
);

// ─── Filter chips ───────────────────────────────────────────────────────────────

const FILTER_CHIPS = [
  { key: "pendiente_validacion", label: "Pendientes" },
  { key: "validado", label: "Validados" },
  { key: "rechazado", label: "Rechazados" },
];

// ─── Receipt icon (thumbnail placeholder) ───────────────────────────────────────

const ReceiptThumb = ({ hasReceipt }) => (
  <div
    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
      hasReceipt
        ? "bg-amber-50 text-amber-600"
        : "bg-gray-100 text-gray-400"
    }`}
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  </div>
);

// ─── Payment row ────────────────────────────────────────────────────────────────

const PaymentRow = ({
  payment,
  selected,
  onToggle,
  onReview,
  onApprove,
  onReject,
}) => {
  const methodStyle =
    METHOD_STYLES[payment.method] || METHOD_STYLES.efectivo;

  return (
    <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3.5 transition-colors hover:bg-stone-50/50">
      {/* Checkbox */}
      <div className="w-[3%] flex justify-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 accent-gray-800 cursor-pointer"
        />
      </div>

      {/* Reportado */}
      <div className="w-[12%]">
        <div className="text-sm font-medium text-gray-900">
          {fmtDate(payment.created_at)}
        </div>
        <div className="text-[11px] text-gray-400">
          {timeAgo(payment.created_at)}
        </div>
      </div>

      {/* Cliente + Vendedor */}
      <div className="w-[22%] flex items-center gap-2.5 min-w-0">
        <ReceiptThumb hasReceipt={!!payment.receipt_url} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-gray-900">
            {payment.client_name}
          </div>
          <div className="text-[11px] text-gray-400 truncate">
            {payment.reported_by_name || "—"}
          </div>
        </div>
      </div>

      {/* Método */}
      <div className="w-[10%]">
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${methodStyle}`}
        >
          {METHOD_LABELS[payment.method] || payment.method}
        </span>
      </div>

      {/* Monto + Referencia */}
      <div className="w-[16%]">
        <div className="text-sm font-bold text-gray-900 tabular-nums">
          {fmtMoney(payment.amount)}
        </div>
        <div className="text-[11px] text-gray-400 font-mono truncate">
          {payment.reference || "—"}
        </div>
      </div>

      {/* Banco */}
      <div className="w-[10%]">
        <div className="text-sm text-gray-700">{payment.bank || "—"}</div>
        {payment.bank ? (
          <div className="text-[11px] text-green-600 font-medium flex items-center gap-0.5">
            <CheckOutlinedIcon sx={{ fontSize: 12 }} /> Banco
          </div>
        ) : (
          <div className="text-[11px] text-amber-600 font-medium">
            Sin match
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="w-[27%] flex items-center justify-end gap-2">
        <button
          onClick={onReview}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
          Revisar
        </button>
        <button
          onClick={onReject}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white h-8 w-8 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          title="Rechazar"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>
        <button
          onClick={onApprove}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-800"
        >
          <CheckOutlinedIcon sx={{ fontSize: 15 }} />
          Aprobar
        </button>
      </div>
    </div>
  );
};

// ─── Column headers ─────────────────────────────────────────────────────────────

const COL_HEADERS = [
  { label: "", width: "w-[3%]" },
  { label: "Reportado", width: "w-[12%]" },
  { label: "Cliente · Vendedor", width: "w-[22%]" },
  { label: "Método", width: "w-[10%]" },
  { label: "Monto / Referencia", width: "w-[16%]" },
  { label: "Banco", width: "w-[10%]" },
  { label: "Acciones", width: "w-[27%]", align: "right" },
];

// ─── Page ───────────────────────────────────────────────────────────────────────

const PendingReceiptsPage = () => {
  const dispatch = useDispatch();
  const { items, isLoading, hasError, error } = useSelector(
    (state) => state.pendingReceipts
  );

  const [activeFilter, setActiveFilter] = useState("pendiente_validacion");
  const [search, setSearch] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [loadingReceipt, setLoadingReceipt] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    dispatch(fetchPendingReceipts());
  }, [dispatch]);

  // ── Derived data ──

  const sellers = useMemo(() => {
    const names = new Set();
    items.forEach((p) => {
      if (p.reported_by_name) names.add(p.reported_by_name);
    });
    return [...names].sort();
  }, [items]);

  const methods = useMemo(() => {
    const ms = new Set();
    items.forEach((p) => {
      if (p.method) ms.add(p.method);
    });
    return [...ms].sort();
  }, [items]);

  const counts = useMemo(
    () => ({
      pendiente_validacion: items.filter(
        (p) => p.status === "pendiente_validacion"
      ).length,
      validado: items.filter((p) => p.status === "validado").length,
      rechazado: items.filter((p) => p.status === "rechazado").length,
    }),
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (p.status !== activeFilter) return false;
      if (sellerFilter && p.reported_by_name !== sellerFilter) return false;
      if (methodFilter && p.method !== methodFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (p.client_name || "").toLowerCase().includes(q) ||
          (p.reported_by_name || "").toLowerCase().includes(q) ||
          (p.reference || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, activeFilter, sellerFilter, methodFilter, search]);

  // ── Handlers ──

  const handleViewReceipt = useCallback(async (paymentId) => {
    setLoadingReceipt(paymentId);
    try {
      const { url } = await getReceiptUrl(paymentId);
      setLightboxUrl(url);
    } catch {
      // silently fail
    } finally {
      setLoadingReceipt(null);
    }
  }, []);

  const handleApprove = useCallback(
    (paymentId) => {
      dispatch(changePaymentStatus({ paymentId, status: "validado" }));
    },
    [dispatch]
  );

  const handleReject = useCallback(
    (paymentId) => {
      dispatch(changePaymentStatus({ paymentId, status: "rechazado" }));
    },
    [dispatch]
  );

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  }, [selectedIds.size, filtered]);

  const lastUpdated = useMemo(() => {
    const now = new Date();
    return `hoy ${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="w-full px-6 py-8">
        <h3 className="text-2xl font-bold text-gray-900">
          Pagos reportados
        </h3>
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (hasError) {
    return (
      <div className="w-full px-6 py-8">
        <h3 className="text-2xl font-bold text-gray-900">
          Pagos reportados
        </h3>
        <div
          role="alert"
          className="mt-4 text-red-600 bg-red-50 border border-red-200 rounded-md p-4"
        >
          {error || "Error al cargar los datos"}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden px-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between py-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Pagos reportados
          </h3>
          <p className="text-gray-400 text-sm mt-0.5">
            Validación de pagos enviados por vendedores · {items.length} total
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
          Exportar
        </button>
      </div>

      {/* Status chips */}
      <div className="flex gap-1.5 mb-5">
        {FILTER_CHIPS.map(({ key, label }) => {
          const count = counts[key] || 0;
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => {
                setActiveFilter(key);
                setSelectedIds(new Set());
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border transition-colors ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {label}
              <span
                className={`inline-flex items-center justify-center h-5 min-w-[20px] rounded-full px-1.5 text-[11px] font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, vendedor, referencia..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
          />
        </div>

        <select
          value={sellerFilter}
          onChange={(e) => setSellerFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="">Todos los vendedores</option>
          {sellers.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <option value="">Todos los métodos</option>
          {methods.map((m) => (
            <option key={m} value={m}>
              {METHOD_LABELS[m] || m}
            </option>
          ))}
        </select>

        <button className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
          Fecha
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-stone-50/50">
          <div className="w-[3%] flex justify-center">
            <input
              type="checkbox"
              checked={
                filtered.length > 0 && selectedIds.size === filtered.length
              }
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 accent-gray-800 cursor-pointer"
            />
          </div>
          {COL_HEADERS.slice(1).map((col) => (
            <div
              key={col.label}
              className={`text-[11px] uppercase tracking-wide font-bold text-gray-400 ${col.width}`}
              style={{ textAlign: col.align || "left" }}
            >
              {col.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            {search.trim()
              ? `No se encontraron resultados para "${search}"`
              : "No hay pagos en este estado"}
          </div>
        ) : (
          filtered.map((payment) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              selected={selectedIds.has(payment.id)}
              onToggle={() => toggleSelect(payment.id)}
              onReview={() => handleViewReceipt(payment.id)}
              onApprove={() => handleApprove(payment.id)}
              onReject={() => handleReject(payment.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
        <span>
          {filtered.length} de {items.length} pagos
        </span>
        <span>Última actualización: {lastUpdated}</span>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <ReceiptLightbox
          url={lightboxUrl}
          onClose={() => setLightboxUrl(null)}
        />
      )}

      {/* Loading receipt overlay */}
      {loadingReceipt && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-800" />
        </div>
      )}
    </div>
  );
};

export default PendingReceiptsPage;
