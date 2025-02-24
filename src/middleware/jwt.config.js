import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateToken = (payload) => {
  const token = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};

export const verifyToken = (payload) => {
  const data = jwt.verify(payload, config.JWT_SECRET);
  return data;
};
