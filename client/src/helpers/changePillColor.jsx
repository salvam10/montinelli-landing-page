export const changePillBgColor = (setPillBg, currentStatus) => {
  if (!currentStatus || typeof currentStatus !== "string") {
    return;
  }

  const status = currentStatus.toLowerCase().trim();

  switch (status) {
    case "aprobado":
    case "al dia":
    case "despachado":
    case "pagado":
      setPillBg("bg-[rgba(112,181,0,0.5)]");
      break;
    case "pendiente":
    case "pendiente de pago":
      setPillBg("bg-[rgba(242,214,0,0.5)]");
      break;
    case "negado":
    case "con deuda":
    case "vencido":
    case "en reclamo":
      setPillBg("bg-[rgba(235,90,70,0.5)]");
      break;
    default:
      console.log("Estado desconocido", currentStatus);
  }
};
