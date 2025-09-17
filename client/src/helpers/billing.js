import { safeDate, formatEs, dueFrom, daysDiff } from "./dates";

/**
 * Computa información de pago lista para UI (mensaje, si está vencida, fecha de vencimiento)
 * Reutilizable desde cualquier lugar (no depende de React).
 */
export const computePaymentInfo = (order, today = new Date()) => {
  if (!order) return { msg: "", overdue: false, dueDate: null };

  const status = order.payment_status || "";
  const dispatchDate = safeDate(order.actual_dispatch_date);
  const termDays = Number(order.payment_term_days) || 0;

  if (!dispatchDate) {
    return {
      msg: "Aún no se ha registrado la entrega. No corren días de crédito.",
      overdue: false,
      dueDate: null,
    };
  }

  const due = order.due_date
    ? safeDate(order.due_date)
    : dueFrom(dispatchDate, termDays);
  const formattedDue = due ? formatEs(due) : "";

  // Pagado
  if (status === "Pagado" || order.payment_status_id === 2) {
    const paidAt = safeDate(order.paid_at);
    if (!paidAt || !due)
      return { msg: "Pagada.", overdue: false, dueDate: due || null };

    const lateDays = daysDiff(paidAt, due); // >0 tardío
    const formattedPaid = formatEs(paidAt);

    if (lateDays > 0) {
      return {
        msg: `Pagada con ${lateDays} día${
          lateDays === 1 ? "" : "s"
        } de retraso (pagada el ${formattedPaid}; vencía el ${formattedDue})`,
        overdue: false,
        dueDate: due,
      };
    }
    if (lateDays === 0) {
      return {
        msg: `Pagada a tiempo (pagada el ${formattedPaid}; vencía el ${formattedDue})`,
        overdue: false,
        dueDate: due,
      };
    }
    const early = Math.abs(lateDays);
    return {
      msg: `Pagada ${early} día${
        early === 1 ? "" : "s"
      } antes (pagada el ${formattedPaid}; vencía el ${formattedDue})`,
      overdue: false,
      dueDate: due,
    };
  }

  // Contado
  if (termDays === 0) {
    return {
      msg: "El pago debe realizarse de contado.",
      overdue: false,
      dueDate: null,
    };
  }

  // Pendiente
  if (!due)
    return {
      msg: "Fecha de vencimiento inválida.",
      overdue: false,
      dueDate: null,
    };

  const diff = daysDiff(due, today);
  if (diff > 0) {
    return {
      msg: `Vence en ${diff} día${diff === 1 ? "" : "s"} (${formattedDue})`,
      overdue: false,
      dueDate: due,
    };
  }
  if (diff === 0) {
    return { msg: `Vence hoy (${formattedDue})`, overdue: false, dueDate: due };
  }

  const overdue = Math.abs(diff);
  return {
    msg: `Venció el ${formattedDue} (tiene ${overdue} día${
      overdue === 1 ? "" : "s"
    } vencida)`,
    overdue: true,
    dueDate: due,
  };
};
