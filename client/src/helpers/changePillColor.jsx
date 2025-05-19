export const changePillBgColor = (setPillBg, currentStatus) => {
  if (!currentStatus || typeof currentStatus !== "string") {
    return;
  }

  const status = currentStatus.toLowerCase().trim();

  switch (status) {
    case "aprobado":
    case "al dia":
    case "despachado":
      setPillBg("bg-[rgba(112,181,0,0.5)]");
      break;
    case "pendiente":
      setPillBg("bg-[rgba(242,214,0,0.5)]");
      break;
    case "negado":
    case "con deuda":
      setPillBg("bg-[rgba(235,90,70,0.5)]");
      break;
    default:
      console.log("Estado desconocido:", currentStatus);
  }
};
