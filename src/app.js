import express from "express";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import path from "path";
import { Server } from "socket.io";

const app = express();
const httpServer = app.listen(8080, () => {
  console.log("Servidor en línea");
});
const io = new Server(httpServer)

io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  // Puedes emitir eventos al cliente cuando sea necesario
  socket.emit("welcome", "Bienvenido al servidor");

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json())

app.use("/api/products", (req, res, next) => {
  req.io = io;
  next();
}, productsRouter);
app.use("/api/carts", cartsRouter);


