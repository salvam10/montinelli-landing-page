import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export const clientOptions = [
  {
    value: "crear",
    label: "Crear",
  },
  {
    value: "usar existente",
    label: "Usar existente",
  },
];

export const paymentOptions = [
  {
    value: "efectivo",
    label: "Efectivo",
  },
  {
    value: "zelle",
    label: "Zelle",
  },
  {
    value: "pago movil",
    label: "Pago Móvil",
  },
  {
    value: "transferencia",
    label: "transferencia",
  },
  {
    value: "crédito",
    label: "credito",
  },
];

export const states = [
  { label: "Anzoátegui", value: "Anzoátegui" },
  { label: "Aragua", value: "Aragua" },
  { label: "Carabobo", value: "Carabobo" },
  { label: "Distrito Capital", value: "Distrito Capital" },
  { label: "La Guaira", value: "La Guaira" },
  { label: "Miranda", value: "Miranda" },
  { label: "Bolivar", value: "Ciudad Bolivar" },
];

export const cities = [
  { label: "Barcelona", value: "Barcelona" },
  { label: "Caracas", value: "Caracas" },
  { label: "Carrizal", value: "Carrizal" },
  { label: "Catia La Mar", value: "Catia La Mar" },
  { label: "Caucagua", value: "Caucagua" },
  { label: "Charallave", value: "Charallave" },
  { label: "Guarenas", value: "Guarenas" },
  { label: "Guatire", value: "Guatire" },
  { label: "Higuerote", value: "Higuerote" },
  { label: "La Victoria", value: "La Victoria" },
  { label: "Los Teques", value: "Los Teques" },
  { label: "Maracay", value: "Maracay" },
  { label: "San Antonio de los altos", value: "San Antonio de los altos" },
  { label: "Santa Teresa del Tuy", value: "Santa Teresa del Tuy" },
  { label: "Valencia", value: "Valencia" },
  { label: "Ciudad Bolivar", value: "Ciudad Bolivar" },
].sort((a, b) => a.label.localeCompare(b.label));

export const phoneAreaCodes = [
  { label: "414", value: "414" },
  { label: "412", value: "412" },
  { label: "416", value: "416" },
  { label: "424", value: "424" },
  { label: "426", value: "426" },
  { label: "212", value: "212" },
];

export const rifTypes = [
  { label: "J", value: "J" },
  { label: "V", value: "V" },
  { label: "E", value: "E" },
];

export const municipalities = [
  { label: "Angostura", value: "Angostura" },
  { label: "Angostura del Orinoco", value: "Angostura del Orinoco" },
  { label: "Baruta", value: "Baruta" },
  { label: "Brión", value: "Brión" },
  { label: "Caroní", value: "Caroní" },
  { label: "Carrizal", value: "Carrizal" },
  { label: "Cedeño", value: "Cedeño" },
  { label: "Chacao", value: "Chacao" },
  { label: "Cristóbal Rojas", value: "Cristóbal Rojas" },
  { label: "El Callao", value: "El Callao" },
  { label: "El Hatillo", value: "El Hatillo" },
  { label: "Girardot", value: "Girardot" },
  { label: "Guaicaipuro", value: "Guaicaipuro" },
  { label: "Gran Sabana", value: "Gran Sabana" },
  { label: "Independencia", value: "Independencia" },
  { label: "Libertador", value: "Libertador" },
  { label: "Los Salias", value: "Los Salias" },
  { label: "Naguanagua", value: "Naguanagua" },
  { label: "Padre Pedro Chien", value: "Padre Pedro Chien" },
  { label: "Piar", value: "Piar" },
  { label: "Plaza", value: "Plaza" },
  { label: "Ribas", value: "Ribas" },
  { label: "Roscio", value: "Roscio" },
  { label: "Sifontes", value: "Sifontes" },
  { label: "Simón Bolívar", value: "Simón Bolívar" },
  { label: "Sucre", value: "Sucre" },
  { label: "Valencia", value: "Valencia" },
  { label: "Vargas", value: "Vargas" },
  { label: "Zamora", value: "Zamora" },
].sort((a, b) => a.label.localeCompare(b.label));

export const orderStatuses = [
  { label: "Pendiente", value: "pendiente" },
  { label: "Facturada", value: "facturada" },
  { label: "Despachada", value: "despachada" },
  { label: "Recibida", value: "recibida" },
  { label: "Cancelada", value: "cancelada" },
  { label: "Eliminada", value: "eliminada" },
  { label: "Pagada", value: "pagada" },
];

export const paymentTerms = [
  { label: "En un plazo de 7 días", value: 7 },
  { label: "En un plazo de 15 días", value: 15 },
  { label: "En un plazo de 30 días", value: 30 },
  { label: "Fecha Fija", value: 0 },
  { label: "Contado", value: 0 },
];

/* STATUSES */

export const managerApprovalStatuses = [
  {
    icon: (
      <CheckCircleOutlinedIcon
        style={{
          fontSize: "large",
          transform: "scaleX(-1)",
          color: "mediun-gray-bg",
        }}
      />
    ),
    text: "Aprobado",
    value: "aprobado",
  },
  {
    icon: (
      <CancelOutlinedIcon
        style={{
          fontSize: "large",
          color: "mediun-gray-bg",
        }}
      />
    ),
    text: "Negado",
    value: "negado",
  },
  {
    icon: (
      <HourglassEmptyOutlinedIcon
        style={{
          fontSize: "large",
          color: "mediun-gray-bg",
        }}
      />
    ),
    text: "Pendiente",
    value: "pendiente",
  },
];

export const paymentStatuses = [
  { text: "Pendiente de pago", value: 1 },
  { text: "Pagado", value: 2 },
  { text: "Vencido", value: 3 },
  { text: "En reclamo", value: 4 },
];

export const debtStatuses = [
  { text: "Al día", value: false },
  { text: "Con deuda", value: true },
  { text: "Deuda no verificada", value: null },
];

export const dispatchStatuses = [
  { text: "Sin despacho asignado" },
  { text: "Rechazado por cliente" },
  { text: "Despachado" },
];

export const combinedStatuses = [
  {
    title: "Estado de cuenta",
    statuses: [
      { text: "Al dia", value: false },
      { text: "Con deuda", value: true },
    ],
    handleOnClick: (value) => {
      return "";
    },
  },
  {
    title: "Aprobación de gerencia",
    statuses: [
      {
        icon: (
          <CheckCircleOutlinedIcon
            style={{
              fontSize: "large",
              transform: "scaleX(-1)",
              color: "mediun-gray-bg",
            }}
          />
        ),
        text: "Aprobado",
        value: "aprobado",
      },
      {
        icon: (
          <CancelOutlinedIcon
            style={{
              fontSize: "large",
              color: "mediun-gray-bg",
            }}
          />
        ),
        text: "Negado",
        value: "negado",
      },
      {
        icon: (
          <HourglassEmptyOutlinedIcon
            style={{
              fontSize: "large",
              color: "mediun-gray-bg",
            }}
          />
        ),
        text: "Pendiente",
        value: "pendiente",
      },
    ],
  },
];

export const shippingCompanies = [
  { label: "GSM 747", value: "GSM 747" },
  { label: "Sr Tereso", value: "Sr Tereso" },
];

export const adminSidebarItems = [
  {
    label: "Pedidos",
    icon: <InboxOutlinedIcon style={{ fontSize: "20px" }} />,
    route: "/admin/orders",
    subItems: [
      { label: "Alimentos", route: "/admin/orders/category/34" },
      { label: "Limpieza", route: "/admin/orders/category/35" },
    ],
  },
  {
    label: "Clientes",
    icon: <PersonOutlineOutlinedIcon style={{ fontSize: "20px" }} />,
    route: "/admin/clients",
  },
];

export const orderTableFilters = [
  { label: "Pendientes", value: "pendiente" },
  { label: "Aprobados", value: "aprobado" },
  { label: "Rechazados", value: "negado" },
];
