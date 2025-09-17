const cron = require("node-cron");
const { updateClientsDebt } = require("../services/clientsService");

const checkClientsDebt = async () => {
  const stats = await updateClientsDebt();
  console.log(
    `[checkClientsDebt] Total de clientes revisados: ${stats.total_clients}`
  );
  console.log(`[checkClientsDebt] Clientes con deuda: ${stats.with_debt}`);
  console.log(`[checkClientsDebt] Clientes sin deuda: ${stats.without_debt}`);
};

// Corre todos los días a medianoche
cron.schedule("*/30 * * * *", () => {
  console.log("[cron] ejecutando checkClientsDebt…");
  checkClientsDebt().catch(console.error);
});

module.exports = { checkClientsDebt };
