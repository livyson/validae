const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const { DateTime } = require("luxon");

app.use(async (req, res, next) => {
  const token = req.headers.authorization;
  const decode = jwt.verify(token, process.env.JWT_KEY);
  const iat = DateTime.fromISO(decode.expire_date);
  const nowIso = DateTime.now().toISO();

  if (iat < nowIso) {
    return res.status(401).send({ message: "token expired" });
  }

  next();
});

module.exports = app;
