const auth = (roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) next();
  else {
    return res.status(403).json({ msg: "Acceso denegado" });
  }
};

export default auth;
