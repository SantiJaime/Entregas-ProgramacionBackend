import bcrypt from "bcrypt";

export const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const validatePassword = (password, hash) => {
  const validPassword = bcrypt.compareSync(password, hash);
  return validPassword;
};
