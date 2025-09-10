import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useDispatch } from "react-redux";
import { dispatchStatuses } from "../../dummy";
import { updateOrder, getOrderById } from "../slices/ordersSlice";
import CustomDatePicker from "../customDatePicker/CustomDatePicker";
import { addDays, format } from "date-fns";

const SHIPPING_STATUS = {
  DESPACHADO: "Despachado",
  RECHAZADO_CLIENTE: "Rechazado por cliente",
};

const FINAL_STATUSES = new Set([
  SHIPPING_STATUS.DESPACHADO,
  SHIPPING_STATUS.RECHAZADO_CLIENTE,
]);

// Helpers
const toYMD = (d) => format(new Date(d), "yyyy-MM-dd"); // '2025-09-10'
const calculateInvoiceDueDate = (dispatchDate, paymentTermDays) =>
  format(
    addDays(new Date(dispatchDate), Number(paymentTermDays) || 0),
    "yyyy-MM-dd"
  );

const DispatchDropdown = ({ order, setOpenDropdown: setDropdownOpen }) => {
  const dispatch = useDispatch();

  const containerRef = useRef(null);
  const [view, setView] = useState("list");

  const initialDispatchDate = useMemo(
    () =>
      order?.actual_dispatch_date
        ? new Date(order.actual_dispatch_date)
        : new Date(),
    [order?.actual_dispatch_date]
  );
  const [dispatchDate, setDispatchDate] = useState(initialDispatchDate);
  const [submitting, setSubmitting] = useState(false);

  const close = useCallback(() => setDropdownOpen(false), [setDropdownOpen]);

  const applyStatus = useCallback(
    async (shippingStatus) => {
      const isFinal = FINAL_STATUSES.has(shippingStatus);

      const payload = {
        orderId: order.id,
        shipping_status: shippingStatus,
        actual_dispatch_date: isFinal ? toYMD(dispatchDate) : null,
        scheduled_dispatch_date: isFinal ? order.scheduled_dispatch_date : null,
        // ✅ calcula correctamente el due_date como YYYY-MM-DD
        due_date: isFinal
          ? calculateInvoiceDueDate(dispatchDate, order.payment_term_days)
          : null,
        shipping_company: isFinal ? order.shipping_company : null,
      };

      try {
        setSubmitting(true);
        await dispatch(updateOrder(payload));
        await dispatch(getOrderById({ orderId: order.id }));
        close();
      } catch (err) {
        console.error("Error al actualizar el estado de envío:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [dispatchDate, order, dispatch, close]
  );

  const onStatusOptionClick = useCallback(
    (statusText) => {
      if (statusText === SHIPPING_STATUS.DESPACHADO) {
        setView("date");
        setDispatchDate(initialDispatchDate);
        return;
      }
      applyStatus(statusText);
    },
    [applyStatus, initialDispatchDate]
  );

  const confirmDispatch = useCallback(async () => {
    const payload = {
      orderId: order.id,
      shipping_status: SHIPPING_STATUS.DESPACHADO,
      actual_dispatch_date: toYMD(dispatchDate),
      // ✅ aquí también
      due_date: calculateInvoiceDueDate(dispatchDate, order.payment_term_days),
      scheduled_dispatch_date: order.scheduled_dispatch_date,
      shipping_company: order.shipping_company,
    };

    try {
      setSubmitting(true);
      await dispatch(updateOrder(payload));
      await dispatch(getOrderById({ orderId: order.id }));
      setView("list");
      close();
    } catch (err) {
      console.error("Error al asignar fecha de despacho:", err);
    } finally {
      setSubmitting(false);
    }
  }, [dispatchDate, order, dispatch, close]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close]);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Cambiar estado de despacho"
      className="absolute flex flex-col gap-2 bg-white top-7 -right-5 shadow-lg py-4 px-2 rounded-lg border z-10 min-w-56"
      onClick={(e) => e.stopPropagation()}
    >
      {view === "list" ? (
        <div role="menu" aria-label="Opciones de estado de envío">
          {dispatchStatuses?.map((status, index) => (
            <button
              key={index}
              role="menuitem"
              className="w-full text-left flex gap-1 responsive-text items-center hover:bg-[#EBEBEB] rounded-lg py-1 px-2 disabled:opacity-60"
              onClick={() => onStatusOptionClick(status.text)}
              disabled={submitting}
            >
              <span>{status.text}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-1 p-2 border rounded-lg">
          <div className="mb-2 text-xs font-medium text-gray-700">
            Asigna la fecha de despacho
          </div>

          <CustomDatePicker
            selectedDate={dispatchDate}
            onChange={setDispatchDate}
            inline
          />

          <div className="flex justify-between gap-2 mt-2">
            <button
              className="text-xs px-3 py-1 rounded-md border hover:font-bold disabled:opacity-60"
              onClick={() => setView("list")}
              disabled={submitting}
            >
              Volver
            </button>
            <button
              className="text-xs px-3 py-1 rounded-md blue-bg text-white hover:font-bold disabled:opacity-60"
              onClick={confirmDispatch}
              disabled={submitting}
            >
              {submitting ? "Guardando..." : "Asignar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchDropdown;
