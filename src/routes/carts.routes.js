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
  checkout,
} from "../controllers/carts.controller.js";
import auth from "../middleware/auth.js";
import passport from "passport";

const router = Router();

router.get("/", getAllCarts);
router.get("/no-render", getAllCartsNoRender);

router.get(
  "/:cid",
  validateCartParams,
  passport.authenticate("jwt"),
  auth(["user"]),
  getOneCart
);

router.post("/", createCart);

router.post(
  "/:cid/products/:pid",
  passport.authenticate("jwt"),
  auth(["user"]),
  addProductInCart
);

router.post(
  "/:cid/purchase",
  passport.authenticate("jwt"),
  auth(["user"]),
  checkout
);

router.put(
  "/:cid",
  validateCartParams,
  passport.authenticate("jwt"),
  auth(["user"]),
  editProductsInCart
);

router.put(
  "/:cid/products/:pid",
  validateMultipleCartParams,
  validateCartBody,
  passport.authenticate("jwt"),
  auth(["user"]),
  updateProductQuantityInCart
);

router.delete(
  "/:cid/products/:pid",
  validateMultipleCartParams,
  passport.authenticate("jwt"),
  auth(["user"]),
  deleteProductInCart
);

router.delete(
  "/:cid",
  validateCartParams,
  passport.authenticate("jwt"),
  auth(["user"]),
  deleteCart
);

export default router;
