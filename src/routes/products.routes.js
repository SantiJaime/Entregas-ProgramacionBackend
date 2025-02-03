import { Router } from "express";
import {
  validateBody,
  validateParams,
} from "../middleware/products-middleware.js";
import {
  getProducts,
  getProductsNoRender,
  getRealTimeProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", getProducts);

router.get("/no-render", getProductsNoRender);

router.get("/realtimeproducts", getRealTimeProducts);

router.post("/", validateBody, createProduct);

router.put("/:pid", validateParams, validateBody, updateProduct);

router.delete("/:pid", validateParams, deleteProduct);

export default router;
