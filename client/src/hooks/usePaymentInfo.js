import { useMemo } from "react";
import { computePaymentInfo } from "../helpers/billing";

/**
 * Hook que devuelve información de pago lista para UI.
 * Puede usarse en cualquier componente que reciba un `order`.
 */
export const usePaymentInfo = (order) =>
  useMemo(() => computePaymentInfo(order, new Date()), [order]);
