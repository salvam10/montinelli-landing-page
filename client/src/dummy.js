import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
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
  { label: "Distrito Capital", value: "Distrito Capital" },
  { label: "Miranda", value: "Miranda" },
  { label: "La Guaira", value: "La Guaira" },
];

export const cities = [
  { label: "Caracas", value: "Caracas" },
  { label: "San Antonio de los altos", value: "San Antonio de los altos" },
  { label: "Los Teques", value: "Los Teques" },
  { label: "Maracay", value: "Maracay" },
  { label: "La Victoria", value: "La Victoria" },
  { label: "Carrizal", value: "Carrizal" },
  {
    label: "Catia La Mar",
    value: "Catia La Mar",
  },
  { label: "Guarenas", value: "Guarenas" },
  { label: "Guatire", value: "Guatire" },
  { label: "Higuerote", value: "Higuerote" },
  { label: "Caucagua", value: "Caucagua" },
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
  { label: "Chacao", value: "Chacao" },
  { label: "El Hatillo", value: "El Hatillo" },
  { label: "Baruta", value: "Baruta" },
  { label: "Sucre", value: "Sucre" },
  { label: "Libertador", value: "Libertador" },
  { label: "Los Salias", value: "Los Salias" },
  { label: "Carrizal", value: "Carrizal" },
  { label: "Girardot", value: "Girardot" },
  { label: "Guaicaipuro", value: "Guaicaipuro" },
  { label: "Ribas", value: "Ribas" },
  { label: "Vargas", value: "Vargas" },
  { label: "Plaza", value: "Plaza" },
  { label: "Zamora", value: "Zamora" },
  { label: "Brión", value: "Brión" },
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
  { text: "Pagado", value: 2 },
  { text: "Pendiente de pago", value: 1 },
  { text: "Vencido", value: 3 },
  { text: "En reclamo", value: 4 },
];

export const debtStatuses = [
  { text: "Al dia", value: false },
  { text: "Con deuda", value: true },
  { text: "Deuda no verificada", value: true },
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
  // Puedes agregar más secciones aquí fácilmente
];

export const orderTableFilters = [
  { label: "Pendientes", value: "pendiente" },
  { label: "Aprobados", value: "aprobado" },
  { label: "Rechazados", value: "negado" },
];
