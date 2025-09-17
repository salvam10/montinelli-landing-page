import { useDispatch, useSelector } from "react-redux";
import { updateOrder, getOrderById } from "../features/slices/ordersSlice";
import { format } from "date-fns";

/**
 * Hook de acciones de pago (pendiente/pagado) reutilizable.
 * Devuelve isLoading y 2 acciones listas para usar en cualquier componente.
 */
export const usePaymentActions = (order) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((s) => s.orders);

  const markAsPending = async () => {
    await dispatch(
      updateOrder({ orderId: order.id, payment_status_id: 1, paid_at: null })
    );
    await dispatch(getOrderById({ orderId: order.id }));
  };

  const markAsPaid = async (date) => {
    await dispatch(
      updateOrder({
        orderId: order.id,
        payment_status_id: 2,
        paid_at: format(date, "yyyy-MM-dd"),
      })
    );
    await dispatch(getOrderById({ orderId: order.id }));
  };

  return { isLoading, markAsPending, markAsPaid };
};
