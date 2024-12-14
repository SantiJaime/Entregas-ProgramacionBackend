import { Router } from "express";
import {
  validateBody,
  validateParams,
} from "../middleware/products-middleware.js";
import fs from "fs/promises";
import { Product } from "../models/products.model.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      query = "",
      value = "",
      sort = "asc",
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort: { title: sort === "desc" ? -1 : 1 },
      lean: true,
    };
    const filter =
      query && value ? { [query]: { $regex: value, $options: "i" } } : {};

    const result = await Product.paginate(filter, options);
    const { totalDocs, pagingCounter, ...restResult } = result;

    if (restResult.docs.length === 0) {
      return res.status(404).json({ msg: "Productos no encontrados" });
    }

    res.render("home", {
      ...restResult,
      status: "success",
      prevLink: restResult.hasPrevPage
        ? `/api/products?limit=${limit}&page=${restResult.prevPage}`
        : null,
      nextLink: restResult.hasNextPage
        ? `/api/products?limit=${limit}&page=${restResult.nextPage}`
        : null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al obtener los productos", error: error.message });
  }
});

router.get("/no-render", async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      query = "",
      value = "",
      sort = "asc",
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort: { title: sort === "desc" ? -1 : 1 },
      lean: true,
    };
    const filter =
      query && value ? { [query]: { $regex: value, $options: "i" } } : {};

    const result = await Product.paginate(filter, options);
    const { totalDocs, pagingCounter, ...restResult } = result;

    if (restResult.docs.length === 0) {
      return res.status(404).json({ msg: "Productos no encontrados" });
    }

    res.status(200).json({
      ...restResult,
      status: "success",
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al obtener los productos", error: error.message });
  }
});

router.get("/realtimeproducts", async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      query = "",
      value = "",
      sort = "asc",
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      sort: { title: sort === "desc" ? -1 : 1 },
      lean: true,
    };
    const filter =
      query && value ? { [query]: { $regex: value, $options: "i" } } : {};

    const result = await Product.paginate(filter, options);
    const { totalDocs, pagingCounter, ...restResult } = result;

    if (restResult.docs.length === 0) {
      return res.status(404).json({ msg: "Productos no encontrados" });
    }

    res.render("realTimeProducts", {
      ...restResult,
      status: "success",
      prevLink: restResult.hasPrevPage
        ? `/api/products/realtimeproducts?limit=${limit}&page=${restResult.prevPage}`
        : null,
      nextLink: restResult.hasNextPage
        ? `/api/products/realtimeproducts?limit=${limit}&page=${restResult.nextPage}`
        : null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al obtener los productos", error: error.message });
  }
});

router.post("/", validateBody, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();

    req.io.emit("productCreated", newProduct);

    res.status(201).json({ msg: "Producto creado correctamente", newProduct });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al crear el producto", error: error.message });
  }
});

router.put("/:pid", validateParams, validateBody, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: req.params.pid },
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    res
      .status(200)
      .json({ msg: "Producto actualizado correctamente", updatedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al actualizar el producto", error: error.message });
  }
});

router.delete("/:pid", validateParams, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete({
      _id: req.params.pid,
    });

    if (!deletedProduct) {
      return res.status(404).json({ msg: "Producto no encontrado" });
    }

    req.io.emit("deleteProduct");

    res.status(200).json({ msg: "Producto eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al eliminar el producto", error: error.message });
  }
});

export default router;
