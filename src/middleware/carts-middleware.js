export const validateAddCartParams = (req, res, next) => {
  const requiredFields = ["cid", "pid"];

  const errors = [];

  requiredFields.forEach((field) => {
    if (isNaN(req.params[field])) {
      errors.push(`El parámetro ${field} debe ser numérico`);
    }
  });

  if (errors.length > 0) {
    return res.status(422).send(errors);
  }
  next();
};

export const validateCartParams = (req, res, next) => {
  if (isNaN(req.params.cid)) {
    return res.status(422).send({ msg: "El parámetro ID debe ser un número" });
  }
  next();
};
