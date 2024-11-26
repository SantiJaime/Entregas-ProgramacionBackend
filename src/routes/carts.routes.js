import Router from "express";
import fs from "fs/promises";
import {
  validateAddCartParams,
  validateCartParams,
} from "../middleware/carts-middleware.js";

const router = Router();

let carts = [];
let products = [];

fs.readFile("./src/json/carts.json", "utf-8")
  .then((data) => {
    carts = JSON.parse(data);
  })
  .catch((error) => console.error(error));

fs.readFile("./src/json/products.json", "utf-8")
  .then((data) => {
    products = JSON.parse(data);
  })
  .catch((error) => console.error(error));

router.get("/:cid", validateCartParams, async (req, res) => {
  const cart = carts.find((cart) => cart.id === parseInt(req.params.cid));
  if (!cart) {
    return res.status(404).send({ msg: `Carrito con ID ${req.params.cid} no encontrado` });
  }

  const productsInCart = cart.products.map((product) => {
    const prod = products.find((prod) => prod.id === product.id);

    const { title, price, category, ...rest } = prod;
    return { title, price, category, quantity: product.quantity };
  });

  res.status(200).send({
    msg: "Carrito encontrado",
    cartId: cart.id,
    products: productsInCart,
  });
});

router.post("/", async (req, res) => {
  try {
    const id = carts.length + 1;
    const newCart = {
      id,
      products: [],
    };
    carts.push(newCart);

    await fs.writeFile("./src/json/carts.json", JSON.stringify(carts));
    res.status(201).send({ msg: "Carrito creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error al crear el carrito", error });
  }
});

router.post("/:cid/product/:pid", validateAddCartParams, async (req, res) => {
  try {
    const cartIndex = carts.findIndex(
      (cart) => cart.id === parseInt(req.params.cid)
    );
    if (cartIndex === -1) {
      return res.status(404).send({
        msg: `Carrito con ID ${req.params.cid} no encontrado`,
      });
    }

    const prodIndexInCart = carts[cartIndex].products.findIndex(
      (product) => product.id === parseInt(req.params.pid)
    );
    if (prodIndexInCart !== -1) {
      carts[cartIndex].products[prodIndexInCart].quantity += 1;
      await fs.writeFile("./src/json/carts.json", JSON.stringify(carts));

      return res.status(200).send({
        msg: `Se ha aumentado la cantidad del producto ${req.params.pid} en el carrito ${req.params.cid}`,
      });
    }
    const product = products.find(
      (product) => product.id === parseInt(req.params.pid)
    )

    if(!product) {
      return res.status(404).send({
        msg: `El producto con ID ${req.params.pid} no existe`,
      });
    }
    
    carts[cartIndex].products.push({ id: product.id, quantity: 1 });
    
    await fs.writeFile("./src/json/carts.json", JSON.stringify(carts));
    res.status(200).send({ msg: "Producto agregado al carrito correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error al agregar el producto al carrito", error });
  }
});

export default router;
