import { format, parseISO, addDays, differenceInCalendarDays } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Convierte un string o Date en un objeto Date válido.
 * - Si recibe null/undefined -> devuelve null.
 * - Si recibe string -> intenta parsear con parseISO.
 * - Si la fecha es inválida -> devuelve null.
 *
 * Ejemplo:
 *   safeDate("2025-09-12") -> Date válido
 *   safeDate("fecha-mala") -> null
 */
export const safeDate = (d) => {
  if (!d) return null;
  const v = typeof d === "string" ? parseISO(d) : new Date(d);
  return isNaN(v.getTime()) ? null : v;
};

/**
 * Formatea una fecha en español con el patrón dado.
 * - Por defecto, formato "dd/MM/yyyy".
 * - Usa la configuración regional "es" (español).
 *
 * Ejemplo:
 *   formatEs(new Date(2025, 8, 12)) -> "12/09/2025"
 *   formatEs(new Date(), "EEEE d 'de' MMMM") -> "viernes 12 de septiembre"
 */
export const formatEs = (d, pattern = "dd/MM/yyyy") =>
  format(d, pattern, { locale: es });

/**
 * Calcula la diferencia en días de calendario entre 2 fechas.
 * - Si `a` es después de `b` -> devuelve número positivo.
 * - Si `a` es antes de `b` -> devuelve número negativo.
 *
 * Ejemplo:
 *   daysDiff(new Date("2025-09-15"), new Date("2025-09-12")) -> 3
 *   daysDiff(new Date("2025-09-10"), new Date("2025-09-12")) -> -2
 */
export const daysDiff = (a, b) => differenceInCalendarDays(a, b);

/**
 * Calcula la fecha de vencimiento a partir de una fecha de despacho
 * sumando la cantidad de días de crédito (termDays).
 *
 * Ejemplo:
 *   dueFrom(new Date("2025-09-12"), 30) -> "2025-10-12"
 */
export const dueFrom = (dispatchDate, termDays) =>
  addDays(dispatchDate, termDays);
