import { useDispatch, useSelector } from "react-redux";
import { updateOrder, getOrderById } from "../features/slices/ordersSlice";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";


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

  const registerDebtCheck = async (date) => {
    try {
      // Formatea la fecha actual a la zona horaria de Caracas
      const caracasTime = formatInTimeZone(
        date,
        "America/Caracas",
        "yyyy-MM-dd'T'HH:mm:ssXXX" // formato con fecha y hora local
      );

      // Actualiza la orden con el nuevo timestamp
      await dispatch(
        updateOrder({
          orderId: order.id,
          last_debt_check: caracasTime,
        })
      );

      // Refresca los datos de la orden actualizada
      await dispatch(getOrderById({ orderId: order.id }));

      console.log(`✅ Revisión registrada a las ${caracasTime} (hora Caracas)`);
    } catch (error) {
      console.error("❌ Error al registrar revisión de deuda:", error);
    }
  };

  return { isLoading, markAsPending, markAsPaid, registerDebtCheck };
};
