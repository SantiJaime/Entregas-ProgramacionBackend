import passport from "passport";
import { Router } from "express";
import {
  createUser,
  loginUser,
  logoutUser
} from "../controllers/users.controller.js";

const router = Router();

router.post("/register", passport.authenticate("register"), createUser);
router.post("/login", passport.authenticate("login"), loginUser);
router.get("/current", passport.authenticate("jwt"), (req, res) => {
  res.status(200).json({ msg: "Usuario encontrado", user: req.user });
});
router.get("/logout", passport.authenticate("jwt"), logoutUser);
router.get("/view-register", (req, res) => res.render("register", {}));
router.get("/view-login", (req, res) => res.render("login", {}));

export default router;
