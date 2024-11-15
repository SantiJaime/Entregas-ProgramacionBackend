export const validateBody = (req, res, next) => {
  const requiredFields = ["title", "description", "price", "stock", "status", "category"];
  const errors = [];

  requiredFields.forEach((field) => {
    if (!req.body[field]) {
      errors.push(`El campo ${field} es obligatorio`);
    }
  });

  if (errors.length > 0) {
    return res.send(errors);
  }
  next();
};

export const validateParams = (req, res, next) => {
  if (!req.params.pid) {
    return res.send({ msg: "El parámetro ID es obligatorio" });
  } else if (isNaN(req.params.pid)) {
    return res.send({ msg: "El parámetro ID debe ser un número" });
  }
  next();
};
