export const validateBody = (req, res, next) => {
  const requiredFields = [
    "title",
    "description",
    "price",
    "stock",
    "status",
    "code",
    "category",
  ];
  const allowedFields = [...requiredFields, "thumbnail"];
  const errors = [];

  requiredFields.forEach((field) => {
    if (!req.body[field]) {
      errors.push(`El campo ${field} es obligatorio`);
    }
  });

  if (isNaN(req.body.price)) {
    errors.push("El precio debe ser un número");
  } else if (req.body.price < 0) {
    errors.push("El precio debe ser mayor a 0");
  }

  if (isNaN(req.body.stock)) {
    errors.push("El stock debe ser un número");
  }

  const extraFields = Object.keys(req.body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (extraFields.length > 0) {
    extraFields.forEach((field) => {
      errors.push(`El campo ${field} no está permitido`);
    });
  }
  if (errors.length > 0) {
    return res.status(422).send(errors);
  }
  next();
};

export const validateParams = (req, res, next) => {
  if (!req.params.pid) {
    return res.status(422).send({ msg: "El parámetro ID es obligatorio" });
  } else if (isNaN(req.params.pid)) {
    return res.status(422).send({ msg: "El parámetro ID debe ser un número" });
  }
  next();
};
