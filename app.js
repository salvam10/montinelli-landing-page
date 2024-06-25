const dotenv = require("dotenv");
dotenv.config();
/* Librerias para configurar el servidor */
const PORT = process.env.PORT || 5000;
const express = require("express");
const app = express();
const path = require("path");

/* Librerias para gestionar sesiones e inicio de sesión */
var cookieParser = require("cookie-parser");
var passport = require("passport");
var session = require("express-session");
const cors = require("cors");
var SQLiteStore = require("connect-sqlite3")(session);
 
const CLIENT_URL = process.env.CLIENT_URL;

/* React como motor de vistas */
/* app.use(express.static("client/build")); */

// Define las rutas que deseas que sean manejadas por React Router
const reactRouterRoutes = [
  
];

// Middleware para las rutas manejadas por React Router
const reactRouterMiddleware = (req, res, next) => {
  if (reactRouterRoutes.includes(req.url)) {
    // Si la ruta está en reactRouterRoutes, envía el archivo index.html
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  } else {
    // Si la ruta no está en reactRouterRoutes, continúa con el siguiente middleware
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

app.get("/", async (req, res, next) => {
  res.send("Welcome to GSM");
});

app.listen(PORT, async () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

module.exports = app;
