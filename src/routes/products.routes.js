import { Router } from "express";
import {
  validateBody,
  validateParams,
} from "../middleware/products-middleware.js";
import fs from "fs/promises";

const router = Router();

let products = [];

fs.readFile("./src/json/products.json", "utf-8")
  .then((data) => {
    products = JSON.parse(data);
  })
  .catch((err) => console.error(err));

router.get("/", (req, res) => {
  if (products.length === 0) {
    return res.status(404).send({ msg: "Productos no encontrados" });
  }
  const { limit } = req.query;
  const productsLimit = limit ? products.slice(0, parseInt(limit)) : products;
  
  res.status(200).send({ msg: "Productos encontrados", products: productsLimit });
});

router.get("/:pid", validateParams, (req, res) => {
  const prod = products.find(
    (product) => product.id === parseInt(req.params.pid)
  );
  if (!prod) return res.status(404).send({ msg: "Producto no encontrado" });

  res.status(200).send({ msg: "Producto encontrado", prod });
});

router.post("/", validateBody, async (req, res) => {
  try {
    const id = products.length + 1;
    const newProduct = { id, ...req.body };

    products.push(newProduct);

    await fs.writeFile("./src/json/products.json", JSON.stringify(products));

    res.status(201).send({ msg: "Producto creado correctamente", newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error al crear el producto", error });
  }
});

router.put("/:pid", validateParams, validateBody, async (req, res) => {
  try {
    const prodIndex = products.findIndex(
      (product) => product.id === parseInt(req.params.pid)
    );

    if (prodIndex === -1) {
      return res.status(404).send({
        msg: `El producto con ID ${req.params.pid} no existe`,
      });
    }
    products[prodIndex] = { ...products[prodIndex], ...req.body };

    await fs.writeFile("./src/json/products.json", JSON.stringify(products));
    res.status(200).send({
      msg: "Producto actualizado correctamente",
      product: products[prodIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error al actualizar el producto", error });
  }
});

router.delete("/:pid", validateParams, async (req, res) => {
  try {
    const filteredProducts = products.filter(
      (product) => product.id !== parseInt(req.params.pid)
    );

    if (filteredProducts.length === products.length) {
      return res.status(404).send({
        msg: `El producto con ID ${req.params.pid} no existe`,
      });
    }
    products = [...filteredProducts];

    await fs.writeFile(
      "./src/json/products.json",
      JSON.stringify(filteredProducts)
    );

    res.status(200).send({ msg: "Producto eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error al eliminar el producto", error });
  }
});

export default router;
