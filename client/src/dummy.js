import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbDownOffAltOutlinedIcon from "@mui/icons-material/ThumbDownOffAltOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

export const categories = [
  {
    id: 1,
    name: "Todas",
  },
  {
    id: 1,
    name: "Panaderia",
  },
  {
    id: 2,
    name: "Confiteria",
  },
  {
    id: 3,
    name: "Reposteria",
  },
  {
    id: 4,
    name: "Miel",
  },
  {
    id: 5,
    name: "Panaderia",
  },
];

export const brands = [
  {
    id: 1,
    name: "Decowhip",
  },
  {
    id: 2,
    name: "Stephany",
  },
  {
    id: 3,
    name: "Flower",
  },
  {
    id: 4,
    name: "Cravo",
  },
];

export const products = [
  {
    id: 1,
    name: "Crema Chantilly Decowhip 1ltx12",
    description: "Crema de alta calidad para decorar tortas",
    price: 10,
    stock: 5,
    media_url:
      "https://firebasestorage.googleapis.com/v0/b/corporacion-gsm.appspot.com/o/DecoWhip%20Chantilly.png?alt=media&token=80c17724-6363-49b4-9cfe-badd391ccb53",
    brand_id: 1,
    category_id: 1,
  },
  {
    id: 2,
    name: "Azúcar Pulverizada Flower",
    description:
      "Azúcar pulverizada en sacos de 10 kg, la opción conveniente para la repostería comercial.",
    price: 20,
    stock: 2,
    media_url:
      "https://firebasestorage.googleapis.com/v0/b/corporacion-gsm.appspot.com/o/azucar%20pulverizada%20flower.png?alt=media&token=53d6b6ae-fe62-4f43-aa23-e457996fc762",
    brand_id: 3,
    category_id: 3,
  },
  {
    id: 3,
    name: "Margarina con sal Stephany",
    description:
      "Margarina con sal para aplicaciones industriales, proporciona sabor y textura",
    price: 10,
    stock: 3,
    media_url:
      "https://firebasestorage.googleapis.com/v0/b/corporacion-gsm.appspot.com/o/margarina%20con%20sal%20stephany.png?alt=media&token=8d19af1e-fc5d-4501-b39c-ba224f25a2ec",
    brand_id: 2,
    category_id: 1,
  },
  {
    id: 4,
    name: "Margarina sin sal Stephany",
    description:
      "Margarina sin sal de uso industrial, diseñada para aplicaciones culinarias y de panificación.",
    price: 30,
    stock: 1,
    media_url:
      "https://firebasestorage.googleapis.com/v0/b/corporacion-gsm.appspot.com/o/margarina%20sin%20sal%20stephany.png?alt=media&token=15940501-0b3c-4567-aab9-ad77dd6d3285",
    brand_id: 2,
    category_id: 1,
  },
  {
    id: 5,
    name: "Margarina Cravo",
    description: "la mejor margarina de Venezuela se llama cravo",
    price: 4,
    stock: 100,
    media_url:
      "https://firebasestorage.googleapis.com/v0/b/corporacion-gsm.appspot.com/o/margarina-cravo.png?alt=media&token=123db82d-5506-4fe4-9b42-0a7d25196493",
    brand_id: 4,
    category_id: 1,
  },
];

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
  { label: "Catia La Mar", value: "Catia La Mar" },
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

export const debtStatuses = [
  { text: "Al dia", value: false },
  { text: "Con deuda", value: true },
];

export const shippingCompanies = [
  { label: "GSM 747", value: "GSM 747" },
  { label: "Sr Tereso", value: "Sr Tereso" },
];

export const dispatchStatuses = [
  { text: "Sin despacho asignado" },
  { text: "Rechazado por cliente" },
  { text: "Despachado" },
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
