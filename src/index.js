import express from "express";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import indexRouter from "./routes/index.routes.js";
import sessionsRouter from "./routes/sessions.routes.js";
import __dirname from "./path.js";
import { engine } from "express-handlebars";
import path from "path";
import { Server } from "socket.io";
import { connectDB } from "./database/db-connection.js";
import { initializePassport } from "./config/passport.config.js";
import passport from "passport";
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cookieParser from "cookie-parser"

const app = express();

const httpServer = app.listen(8080, () => {
  console.log("Servidor en línea");
});
const io = new Server(httpServer);

connectDB();

io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  socket.emit("welcome", "Bienvenido al servidor");

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

app.engine("handlebars", engine({
  helpers: {
    json: (context) => JSON.stringify(context)
  },
}));
app.set("view engine", "handlebars");

app.use(cookieParser("SantiagoJaimeCookieSecret"));
app.use(session({
  store: MongoStore.create({
      mongoUrl: "mongodb+srv://santij03:6zxoy7ehrRwJ7ncu@cluster0.1weaa.mongodb.net/",
      mongoOptions: {},
      ttl: 15
  }),
  secret: 'SantiagoJaimeSessionSecret',
  resave: true,
  saveUninitialized: true
}))

app.set("views", path.join(__dirname, "views"));
app.use(passport.initialize());
app.use(passport.session());
initializePassport();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.use("/", indexRouter);

app.use(
  "/api/products",
  (req, res, next) => {
    req.io = io;
    next();
  },
  productsRouter
);

app.use(
  "/api/carts",
  (req, res, next) => {
    req.io = io;
    next();
  },
  cartsRouter
);

app.use("/api/sessions", sessionsRouter);