const cron = require("node-cron");
const { updateOrderPaymentStatus } = require("../services/ordersService");

const checkOverdueOrders = async () => {
  const updated = await updateOrderPaymentStatus();
  console.log(`[checkOverdueOrders] órdenes actualizadas: ${updated}`);
};

// Corre todos los días a medianoche
cron.schedule("*/30 * * * *", () => {
  console.log("[cron] ejecutando checkOverdueOrders…");
  checkOverdueOrders().catch(console.error);
});

module.exports = { checkOverdueOrders };

