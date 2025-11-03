const dotenv = require("dotenv");
dotenv.config();
/* Librerias para configurar el servidor */
const PORT = process.env.PORT || 5001;
const express = require("express");
const app = express();
const path = require("path");

/* Cron Jobs */
require("./jobs/checkOverdueOrders");
require("./jobs/checkClientsDebt");

/* Librerias para gestionar sesiones e inicio de sesión */
var cookieParser = require("cookie-parser");
var passport = require("passport");
var session = require("express-session");
const cors = require("cors");
var SQLiteStore = require("connect-sqlite3")(session);

/* inicializar enrutadores */

const productVariationAttsRouter = require("./routes/prodVariationAttributes");
const productVariationsRouter = require("./routes/product_variations");
const attributesValuesRouter = require("./routes/attributesValues");
const marketCheckItemsRouter = require("./routes/marketCheckItems");
const categoriesRouter = require("./routes/product_categories");
const marketProductsRouter = require("./routes/marketProducts");
const paymentTermsRouter = require("./routes/paymentTerms");
const marketBrandsRouter = require("./routes/marketBrands");
const marketChecksRouter = require("./routes/marketChecks");
const attributesRouter = require("./routes/attributes");
const brandsRouter = require("./routes/product_brands");
const orderItemsRouter = require("./routes/orderitems");
const analyticsRoutes = require("./routes/analytics");
const firebaseRouter = require("./routes/firebase");
const productsRouter = require("./routes/products");
const clientsRouter = require("./routes/clients");
const paymentsRouter = require("./routes/payments")
const ordersRouter = require("./routes/orders");
const cartsRouter = require("./routes/carts");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");

const CLIENT_URL = process.env.CLIENT_URL;

/* React como motor de vistas */
/* app.use(express.static("client/build")); */
// Define las rutas que deseas que sean manejadas por React Router

const reactRouterRoutes = [
  "/", // Página principal
  "/signin", // Inicio de sesión
  "/privacy-policy", // Política de privacidad

  // Categorías
  "/categorias",
  "/categorias/:name",

  // Carrito y proceso de compra
  "/carrito",
  "/checkout",
  "/order-confirmation",

  // Pedidos del usuario
  "/mis-pedidos",
  "/orders",
  "/orders/:orderId",
  "/orders/category/:prodCategoryId",

  //Estudio de mercado
  "/market-check",
  "/market-check-confirmation",

  // Panel de administración
  "/admin",
  "/admin/orders",
  "/admin/orders/:orderId",
  "/admin/competitor-dashboard",
];

// Middleware para las rutas manejadas por React Router
const reactRouterMiddleware = (req, res, next) => {
  const url = req.url.replace(/\/$/, ""); // Elimina el slash final si existe
  if (
    reactRouterRoutes.some(
      (route) => url === route || url.startsWith(route + "/")
    )
  ) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  } else {
    next();
  }
};

// Aplica el middleware para las rutas manejadas por React Router
app.use(reactRouterMiddleware);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.use(cookieParser());
app.use(passport.initialize());
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" }),
  })
);
app.use(passport.authenticate("session"));

app.use(
  cors({
    origin: `${CLIENT_URL}`,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/api/product-variation-attributes", productVariationAttsRouter);
app.use("/api/product-variations", productVariationsRouter);
app.use("/api/attributes-values", attributesValuesRouter);
app.use("/api/market-products", marketProductsRouter);
app.use("/api/payment-terms", paymentTermsRouter);
app.use("/api/market-brands", marketBrandsRouter);
app.use("/api/market-checks", marketChecksRouter);
app.use("/api/market-check-items", marketCheckItemsRouter);
app.use("/api/order-items", orderItemsRouter);
app.use("/api/attributes", attributesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payments", paymentsRouter);
app.use("/api/products", productsRouter);
app.use("/api/firebase", firebaseRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartsRouter);
app.use("/api/auth", authRouter);

app.get("/", async (req, res, next) => {
  res.send("Welcome to GSM.");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, async () => {
  console.log(`Servidor escuchando en el puerto seleccionado!: ${PORT}`);
});

module.exports = app;
