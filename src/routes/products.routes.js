import passport from "passport";
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
import auth from "../middleware/auth.js";

const router = Router();

router.get("/", getProducts);

router.get(
  "/no-render",
  passport.authenticate("jwt"),
  auth(["user", "admin"]),
  getProductsNoRender
);

router.get(
  "/realtimeproducts",
  passport.authenticate("jwt"),
  auth(["user", "admin"]),
  getRealTimeProducts
);

router.post("/", validateBody, auth(["admin"]), createProduct);
router.get("/render-create-products", auth(["admin"]), (req, res) => {
  res.render("createProduct", {});
});
router.put(
  "/:pid",
  validateParams,
  validateBody,
  auth(["admin"]),
  updateProduct
);

router.delete("/:pid", validateParams, auth(["admin"]), deleteProduct);

export default router;
