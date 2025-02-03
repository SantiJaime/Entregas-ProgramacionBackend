import { Router } from "express";
import {
  validateCartParams,
  validateMultipleCartParams,
  validateCartBody,
} from "../middleware/carts-middleware.js";
import {
  getAllCarts,
  getAllCartsNoRender,
  getOneCart,
  createCart,
  addProductInCart,
  editProductsInCart,
  updateProductQuantityInCart,
  deleteProductInCart,
  deleteCart,
} from "../controllers/carts.controller.js";

const router = Router();

router.get("/", getAllCarts);
router.get("/no-render", getAllCartsNoRender);

router.get("/:cid", validateCartParams, getOneCart);

router.post("/", createCart);

router.post("/:cid/products/:pid", addProductInCart);

router.put("/:cid", validateCartParams, editProductsInCart);

router.put(
  "/:cid/products/:pid",
  validateMultipleCartParams,
  validateCartBody,
  updateProductQuantityInCart
);

router.delete(
  "/:cid/products/:pid",
  validateMultipleCartParams,
  deleteProductInCart
);

router.delete("/:cid", validateCartParams, deleteCart);

export default router;
