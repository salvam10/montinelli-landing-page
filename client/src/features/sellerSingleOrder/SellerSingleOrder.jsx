import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getOrderById,
  getProductsByOrderId,
  getClientByOrderId,
} from "../slices/ordersSlice";
import { getPaymentTerms } from "../../features/slices/paymentTermsSlice";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ArrowBackIosOutlinedIcon from "@mui/icons-material/ArrowBackIosOutlined";
import { format, differenceInCalendarDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { changePillBgColor } from "../../helpers/changePillColor";
import ProductsList from "../productsList/ProductsList";

const SellerSingleOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { orderProducts, orderClient, order, isLoading } = useSelector(
    (state) => state.orders
  );
  const { paymentTerms } = useSelector((state) => state.paymentTerms || {});

  useEffect(() => {
    dispatch(getOrderById({ orderId }));
    dispatch(getProductsByOrderId({ orderId }));
    dispatch(getClientByOrderId({ orderId }));
    dispatch(getPaymentTerms());
  }, [dispatch, orderId]);

  useEffect(() => {
    console.log("Order data:", order);
  }, [order]);

  // ---- helpers (en inglés) ----
  const normalize = (v) => (v || "").toString().trim().toLowerCase();
  const fmtMoney = (v) =>
    isNaN(Number(v))
      ? "$0.00"
      : `$${Number(v).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;

  const formatDispatchDate = (d) =>
    d ? format(new Date(d), "dd 'de' LLL 'de' yyyy", { locale: es }) : null;

  const shippingBase = useMemo(() => {
    const raw = normalize(order?.shipping_status);
    return raw.startsWith("despacho ")
      ? raw.replace("despacho ", "").trim()
      : raw;
  }, [order]);

  const shippingLabel = useMemo(() => {
    if (!shippingBase) return "";
    if (shippingBase === "despachado") {
      const date = order?.actual_dispatch_date || order?.updated_at;
      const f = formatDispatchDate(date);
      return f ? `despachado el ${f}` : "despachado";
    }
    if (shippingBase === "pendiente") return "despacho pendiente";
    if (shippingBase === "agendado") return "despacho agendado";
    return `despacho ${shippingBase}`;
  }, [shippingBase, order]);

  // Due label: solo si hay due_date y paid_at es null
  const dueMeta = useMemo(() => {
    if (!order?.due_date || order?.paid_at) return null;
    const due = startOfDay(new Date(order.due_date));
    const today = startOfDay(new Date());
    const days = differenceInCalendarDays(due, today);

    let text = "";
    if (days > 0) text = `Vence en ${days} días (${format(due, "dd/MM/yyyy")})`;
    else if (days === 0) text = `Vence hoy (${format(due, "dd/MM/yyyy")})`;
    else
      text = `Venció hace ${Math.abs(days)} días (${format(
        due,
        "dd/MM/yyyy"
      )})`;

    let tone = "text-neutral-700";
    if (days <= 0) tone = "text-red-600";
    else if (days <= 3) tone = "text-amber-600";

    return { text, tone };
  }, [order]);

  // Map de payment term (si lo necesitas visible)
  const paymentTermName = useMemo(() => {
    if (!paymentTerms || !order?.payment_term_id) return null;
    const term = paymentTerms.find((t) => t.id === order.payment_term_id);
    return term?.name || null;
  }, [paymentTerms, order]);

  // Pills (clases desde tu helper)
  const managerPill = useMemo(() => {
    const classes = [];
    changePillBgColor(
      (c) => classes.push(c),
      normalize(order?.manager_approval_status)
    );
    return classes[0];
  }, [order]);

  const shippingPill = useMemo(() => {
    const classes = [];
    changePillBgColor((c) => classes.push(c), shippingBase);
    return classes[0];
  }, [shippingBase]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="relative mx-auto flex max-w-6xl items-center justify-center py-3">
          <button
            className="absolute left-4 rounded-full p-1.5 hover:bg-neutral-100"
            onClick={() => navigate("/mis-pedidos")}
            aria-label="Volver"
            title="Volver"
          >
            <ArrowBackIosOutlinedIcon sx={{ fontSize: 18, color: "#6B7280" }} />
          </button>
          <h1 className="text-base font-semibold text-neutral-900">
            {order?.client_name || "Detalle de pedido"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-3">
        {/* Left: info principal */}
        <div className="md:col-span-2 space-y-4">
          {/* Order meta card */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <div className="text-neutral-500">Fecha del pedido</div>
                <div className="font-medium text-neutral-900">
                  {order?.created_at
                    ? format(
                        new Date(order.created_at),
                        "dd 'de' MMMM 'de' yyyy, 'a las' HH:mm",
                        { locale: es }
                      )
                    : "—"}
                </div>
              </div>

              {!!order?.invoice_number && (
                <div className="space-y-1 text-sm">
                  <div className="text-neutral-500"># Factura</div>
                  <div className="font-medium text-neutral-900">
                    {order.invoice_number}
                  </div>
                </div>
              )}

              <div className="space-y-1 text-sm">
                <div className="text-neutral-500">Método de pago</div>
                <div className="font-medium capitalize text-neutral-900">
                  {normalize(order?.payment_method) || "—"}
                </div>
              </div>

              {!!paymentTermName && (
                <div className="space-y-1 text-sm">
                  <div className="text-neutral-500">Término de pago</div>
                  <div className="font-medium text-neutral-900">
                    {paymentTermName}
                  </div>
                </div>
              )}
            </div>

            {/* Estado de cobranza / despacho */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`badge inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${managerPill}`}
              >
                pedido {normalize(order?.manager_approval_status)}
              </span>

              {!!shippingLabel &&
                normalize(order?.manager_approval_status) === "aprobado" && (
                  <span
                    className={`badge inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${shippingPill}`}
                  >
                    {shippingLabel}
                  </span>
                )}

              {dueMeta && (
                <span className={`ml-1 text-sm font-medium ${dueMeta.tone}`}>
                  {dueMeta.text}
                </span>
              )}
            </div>
          </div>

          {/* Product list */}
          <div className="rounded-xl border border-neutral-200">
            <ProductsList orderProducts={orderProducts} />
          </div>
        </div>

        {/* Right: resumen */}
        <aside className="space-y-4">
          {/* Cliente */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
            <div className="text-sm text-neutral-500">Cliente</div>
            <div className="mt-1 text-[15px] font-semibold text-neutral-900">
              {order?.client_name || orderClient?.name || "—"}
            </div>
            {/* Si tienes dirección/ciudad/telefono en orderClient, muéstralos aquí */}
          </div>

          {/* Totales */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
            <div className="mb-2 text-sm font-semibold text-neutral-900">
              Resumen
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium text-neutral-900">
                  {fmtMoney(order?.subtotal ?? 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Envío</span>
                <span className="font-medium text-neutral-900">
                  {fmtMoney(order?.shipping_cost ?? 0)}
                </span>
              </div>
              <div className="mt-2 border-t pt-2 text-base">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-900">
                    Total con I.V.A
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {fmtMoney(order?.total ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas (opcional) */}
          {/* <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4">
            <button className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800">
              Generar PDF
            </button>
          </div> */}
        </aside>
      </div>
    </div>
  );
};

export default SellerSingleOrder;
