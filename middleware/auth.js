const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.sendStatus(401);
  }
};
