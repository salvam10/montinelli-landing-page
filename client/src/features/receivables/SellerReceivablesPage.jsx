import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSellerReceivables } from "../slices/sellerReceivablesSlice";
import { fetchSellerPayments } from "../slices/sellerPaymentsSlice";
import CircularProgress from "@mui/material/CircularProgress";
import SummaryCard from "./components/SummaryCard";
import ClientAvatar from "./components/ClientAvatar";
import StatusDot from "./components/StatusDot";
import Sparkline from "./components/Sparkline";
import ClientDrawer from "./components/ClientDrawer";
import ReportPaymentModal from "./components/ReportPaymentModal";
import {
  fmtMoney,
  fmtMoneyShort,
  bucketOf,
  calculateTotalNetDebt,
  calculateTotalGrossDebt,
  calculateTotalCredits,
  calculateTotalOverdue,
  BUCKET_META,
} from "./receivablesHelpers";

// ─── Iconos inline SVG ────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z" /><path d="M9 7h6M9 11h6M9 15h4" />
  </svg>
);

// ─── Pure helpers — exportados para tests ─────────────────────────────────────
export { calculateTotalNetDebt };

const getUserFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
};

// ─── Fila de cliente ──────────────────────────────────────────────────────────
const ClientRow = ({ client, onClick }) => {
  const bucket = bucketOf(client);
  const meta = BUCKET_META[bucket];
  const overdue = Number(client.overdue_amount) || 0;

  return (
    <button
      onClick={() => onClick(client)}
      className="w-full flex items-center gap-3.5 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left cursor-pointer"
    >
      <ClientAvatar name={client.client_name} size={38} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[13px] text-gray-900 truncate">
            {client.client_name}
          </span>
          <StatusDot bucket={bucket} />
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          {meta?.label}
          {client.max_morosidad_days > 0 && ` · ${client.max_morosidad_days}d mora`}
          {client.credit_days > 0 && ` · ${client.credit_days}d crédito`}
        </div>
      </div>

      {/* Sparkline */}
      <div className="hidden sm:block shrink-0">
        <Sparkline
          values={client.trend}
          color={overdue > 0 ? "#c54a3a" : "#9ca3af"}
          w={56}
          h={16}
        />
      </div>

      {/* Monto neto */}
      <div className="text-right shrink-0 w-24">
        <div className="text-sm font-bold tabular-nums text-gray-900">
          {fmtMoney(client.net_debt)}
        </div>
        {overdue > 0 && (
          <div className="text-[11px] font-semibold text-red-500 tabular-nums">
            {fmtMoney(overdue)} venc.
          </div>
        )}
      </div>
    </button>
  );
};

// ─── Page component ───────────────────────────────────────────────────────────
const SellerReceivablesPage = ({ user: propUser }) => {
  const dispatch = useDispatch();
  const user = propUser ?? getUserFromLocalStorage();
  const userId = user?.id;

  const { items, isLoading, hasError, error } = useSelector(
    (s) => s.sellerReceivables
  );
  const { items: sellerPayments } = useSelector((s) => s.sellerPayments);

  const [search, setSearch] = useState("");
  const [activeBucket, setActiveBucket] = useState("todos");
  const [drawerClient, setDrawerClient] = useState(null);
  const [paymentClient, setPaymentClient] = useState(null);

  useEffect(() => {
    if (userId) {
      dispatch(fetchSellerReceivables(userId));
      dispatch(fetchSellerPayments(userId));
    }
  }, [dispatch, userId]);

  // ── Conteos por bucket (siempre desde items completos) ──
  const bucketCounts = useMemo(() => {
    const counts = { todos: items.length };
    for (const key of Object.keys(BUCKET_META)) counts[key] = 0;
    for (const c of items) counts[bucketOf(c)] = (counts[bucketOf(c)] || 0) + 1;
    return counts;
  }, [items]);

  // ── Pipeline: bucket primero, búsqueda después ──
  const filtered = useMemo(() => {
    let list = items;
    if (activeBucket !== "todos") {
      list = list.filter((c) => bucketOf(c) === activeBucket);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.client_name.toLowerCase().includes(q));
    }
    return list;
  }, [items, activeBucket, search]);

  const totalNet = calculateTotalNetDebt(items);
  const totalGross = calculateTotalGrossDebt(items);
  const totalCredits = calculateTotalCredits(items);
  const totalOverdue = calculateTotalOverdue(items);
  const overdueCount = items.filter(
    (c) => Number(c.overdue_amount) > 0
  ).length;

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <CircularProgress role="progressbar" />
      </div>
    );
  }

  // ── Error ──
  if (hasError) {
    return (
      <div className="w-full px-6 py-8">
        <div role="alert" className="text-red-600 bg-red-50 border border-red-200 rounded-md p-4">
          {error || "Error al cargar los datos"}
        </div>
      </div>
    );
  }

  // ── Empty ──
  if (items.length === 0) {
    return (
      <div className="w-full px-6 py-8">
        <h3 className="text-xl font-bold mb-6">Cuenta por Cobrar</h3>
        <div className="flex justify-center py-8 text-gray-500 font-bold">
          Sin clientes con deudas registradas
        </div>
      </div>
    );
  }

  // ── Data ──
  return (
    <div className="w-full overflow-x-hidden px-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between py-6">
        <h3 className="text-xl font-bold">Cuenta por Cobrar</h3>
        <button
          onClick={() => setPaymentClient({})}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 text-white text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          <ReceiptIcon /> Reportar pago
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SummaryCard
          label="Deuda neta"
          value={fmtMoneyShort(totalNet)}
          sub={`${items.length} clientes`}
          emphasize
          prefix=""
        />
        <SummaryCard
          label="Deuda bruta"
          value={fmtMoneyShort(totalGross)}
          sub={`Créditos: ${fmtMoneyShort(totalCredits)}`}
        />
        <SummaryCard
          label="Vencido"
          value={fmtMoneyShort(totalOverdue)}
          sub={`${overdueCount} clientes en mora`}
        />
        <SummaryCard
          label="Peor mora"
          value={`${Math.max(...items.map((c) => Number(c.max_morosidad_days) || 0))} días`}
          sub="Máx. días de mora"
        />
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
        />
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-1.5 mb-4" data-testid="quick-filters">
        {[{ key: "todos", label: "Todos" }, ...Object.entries(BUCKET_META).map(([key, m]) => ({ key, label: m.label }))].map(
          ({ key, label }) => {
            const count = bucketCounts[key] || 0;
            const isActive = activeBucket === key;
            const meta = BUCKET_META[key];
            const isMuted = count === 0 && key !== "todos";

            let chipClass =
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer";

            if (isActive && meta) {
              chipClass += ` border-transparent`;
            } else if (isActive) {
              chipClass += " bg-gray-900 text-white border-gray-900";
            } else if (isMuted) {
              chipClass += " bg-white border-gray-100 text-gray-300 cursor-default";
            } else {
              chipClass += " bg-white border-gray-200 text-gray-600 hover:border-gray-400";
            }

            return (
              <button
                key={key}
                onClick={() => !isMuted && setActiveBucket(key)}
                className={chipClass}
                style={
                  isActive && meta
                    ? { backgroundColor: meta.bg, color: meta.color, borderColor: meta.bg }
                    : undefined
                }
                data-testid={`filter-${key}`}
                aria-pressed={isActive}
                disabled={isMuted}
              >
                {label}
                <span
                  className={`tabular-nums ${
                    isActive
                      ? "opacity-80"
                      : isMuted
                        ? "text-gray-300"
                        : "text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Client list */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            {activeBucket !== "todos" && search.trim()
              ? `No se encontraron clientes "${search}" en ${BUCKET_META[activeBucket]?.label || activeBucket}`
              : activeBucket !== "todos"
                ? `No hay clientes en ${BUCKET_META[activeBucket]?.label || activeBucket}`
                : `No se encontraron clientes para "${search}"`}
          </div>
        ) : (
          filtered.map((client) => (
            <ClientRow
              key={client.client_id}
              client={client}
              onClick={setDrawerClient}
            />
          ))
        )}
      </div>

      {/* Footer total */}
      <div className="mt-4 bg-gray-900 text-white rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm font-medium text-white/70">
          Deuda Neta Total ({items.length} clientes)
        </span>
        <span
          className="text-lg font-extrabold tabular-nums"
          data-testid="footer-total-net-debt"
        >
          {fmtMoney(totalNet)}
        </span>
      </div>

      {/* Drawer */}
      <ClientDrawer
        client={drawerClient}
        onClose={() => setDrawerClient(null)}
        onReportPayment={(c) => {
          setDrawerClient(null);
          setPaymentClient(c);
        }}
        sellerPayments={sellerPayments}
      />

      {/* Report payment modal */}
      {paymentClient && (
        <ReportPaymentModal
          clients={items}
          initialClient={paymentClient.client_id ? paymentClient : null}
          onClose={() => setPaymentClient(null)}
          userId={userId}
        />
      )}
        </div>
  );
};

export default SellerReceivablesPage;
