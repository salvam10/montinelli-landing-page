import PropTypes from "prop-types";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

/**
 * Botón/menú de "más opciones" para editar condiciones de pago.
 * Reutilizable en listas, cards, etc.
 */
const PaymentTermsMenu = ({ onEdit }) => (
  <div className="border-transparent rounded-full px-[4px] hover:bg-[#EBEBEB]">
    <span className="text-[10px] cursor-pointer" onClick={onEdit}>
      <MoreHorizIcon style={{ color: "#000000" }} />
    </span>
  </div>
);

PaymentTermsMenu.propTypes = {
  onEdit: PropTypes.func.isRequired,
};

export default PaymentTermsMenu;
