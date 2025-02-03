import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  const token = jwt.sign(payload, "SantiagoJaimeJWTSecret", {
    expiresIn: "24h",
  });
  return token;
};

export const verifyToken = (payload) => {
  const data = jwt.verify(payload, "SantiagoJaimeJWTSecret");
  return data;
};
