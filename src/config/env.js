export const config = {
  COOKIE_SECRET: process.env.COOKIE_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT || 8080,
  SESSION_SECRET: process.env.SESSION_SECRET,
  MONGO_URL: process.env.MONGO_URL,
};
