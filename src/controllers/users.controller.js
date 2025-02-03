import { generateToken } from "../middleware/jwt.config.js";

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
      return res.status(401).send("Usuario o contraseña no validos");
    }

    const token = generateToken({
      email: req.user.email,
      _id: req.user._id,
      full_name: `${req.user.first_name} ${req.user.last_name}`,
    });

    req.session.user = {
      email: req.user.email,
      first_name: req.user.first_name,
      full_name: `${req.user.first_name} ${req.user.last_name}`,
    };

    res.cookie("SantiagoJaimeCookieSecret", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    res.status(200).json({
      msg: "Sesión iniciada correctamente",
      redirect: "/api/products/realtimeproducts",
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
      res.clearCookie("SantiagoJaimeCookieSecret", {
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
