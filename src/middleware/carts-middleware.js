export const validateMultipleCartParams = (req, res, next) => {
  const requiredFields = ["cid", "pid"];

  const errors = [];

  requiredFields.forEach((field) => {
    if (!req.params[field]) {
      errors.push(`El parámetro ${field} es obligatorio`);
    }
  });

  if (errors.length > 0) {
    return res.status(422).send(errors);
  }
  next();
};

export const validateCartParams = (req, res, next) => {
  if (!req.params.cid) {
    return res
      .status(422)
      .send({ msg: "El parámetro ID de carrito es obligatorio" });
  }
  next();
};

export const validateCartBody = (req, res, next) => {
  if (!req.body.quantity) {
    return res
      .status(422)
      .send({ msg: "Debe indicar una nueva cantidad para el producto" });
  } else if (isNaN(req.body.quantity)) {
    return res
      .status(422)
      .send({ msg: "La nueva cantidad debe ser un número" });
  } else if (req.body.quantity <= 0) {
    return res
      .status(422)
      .send({ msg: "La nueva cantidad debe ser mayor a 0" });
  }
  next();
};
