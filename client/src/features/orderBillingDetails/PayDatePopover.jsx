import PropTypes from "prop-types";
import CustomDatePicker from "../../features/customDatePicker/CustomDatePicker";

/**
 * Popover genérico para elegir fecha (no acoplado a pagos).
 * Puedes reusarlo para seleccionar fechas en otros flujos.
 */
const PayDatePopover = ({
  date,
  onChange,
  onAssign,
  onCancel,
  title = "Selecciona la fecha de pago",
}) => (
  <div className="absolute bottom-12 right-0 bg-white border rounded-lg shadow-lg p-3 z-20 w-[280px]">
    <div className="text-xs font-medium text-gray-700 mb-2">{title}</div>
    <CustomDatePicker selectedDate={date} onChange={onChange} inline />
    <div className="flex justify-between gap-2 mt-2">
      <button
        className="text-xs px-3 py-1 rounded-md border hover:font-bold"
        onClick={onCancel}
      >
        Cancelar
      </button>
      <button
        className="text-xs px-3 py-1 rounded-md blue-bg text-white hover:font-bold"
        onClick={onAssign}
      >
        Asignar
      </button>
    </div>
  </div>
);

PayDatePopover.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
  onAssign: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default PayDatePopover;
