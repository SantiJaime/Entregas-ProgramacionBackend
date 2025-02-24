import { generateToken } from "../middleware/jwt.config.js";
import { config } from "../config/env.js";

export const createUser = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(400)
        .send("El correo electrónico ya se encuentra registrado");
    }

    res.status(201).json({ redirect: "/api/sessions/view-login" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Error al registrar el usuario", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send("Usuario o contraseña no válidos");
    }

    const token = generateToken({
      email: req.user.email,
      _id: req.user._id,
      full_name: `${req.user.first_name} ${req.user.last_name}`,
      role: req.user.role,
      cartId: req.user.cart,
    });

    req.session.user = {
      email: req.user.email,
      _id: req.user._id,
      full_name: `${req.user.first_name} ${req.user.last_name}`,
      role: req.user.role,
      cartId: req.user.cart,
    };

    res.cookie(config.COOKIE_SECRET, token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    res
      .status(200)
      .json({
        msg: "Usuario logueado correctamente",
        redirect: "/api/products/realtimeproducts",
        cartId: req.user.cart,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Error al iniciar sesión", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    req.session.destroy(() => {
      res.clearCookie(config.COOKIE_SECRET, {
        httpOnly: true,
        secure: false,
      });

      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: false,
      });

      res.status(200).redirect("/api/products");
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Error al cerrar sesion", error: error.message });
  }
};
