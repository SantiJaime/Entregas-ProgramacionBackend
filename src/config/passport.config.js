import passport from "passport";
import local from "passport-local";
import { UserModel } from "../models/users.model.js";
import { hashPassword, validatePassword } from "../utils/bcrypt.js";
import { Cart } from "../models/carts.model.js";
import jwt from "passport-jwt";
import { config } from "./env.js";

const localStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies[config.COOKIE_SECRET];
  }

  return token;
};

export const initializePassport = () => {
  passport.use(
    "register",
    new localStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age, role } = req.body;
        try {
          const user = await UserModel.findOne({ email: username });

          if (user) {
            console.log(
              "El correo electrónico ingresado ya se encuentra registrado"
            );
            return done(null, false);
          }

          const newCart =
            role !== "admin" ? await new Cart() : "";

          const newUser = await UserModel.create({
            first_name,
            last_name,
            email,
            age,
            role,
            password: hashPassword(password),
            cart: newCart._id,
          });

          newCart.userId = newUser._id;
          await newCart.save();

          return done(null, newUser);
        } catch (error) {
          return done(`Error al crear el usuario: ${error}`, false);
        }
      }
    )
  );
  passport.use(
    "login",
    new localStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await UserModel.findOne({ email: username });

          if (user && validatePassword(password, user.password)) {
            return done(null, user);
          } else {
            return done(new Error("Usuario y/o contraseña no válidos"), false);
          }
        } catch (error) {
          return done(`Error al iniciar sesión: ${error}`, false);
        }
      }
    )
  );

  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: config.JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          return done(null, jwt_payload);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await UserModel.findById(id);
    done(null, user);
  });
};
