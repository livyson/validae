const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcryptjs");
const schema = require("./schema");
const userSchema = require("../../models/User");
const { connect, disconnect } = require("../../config/database");
const { DateTime } = require("luxon");

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

app.post("/user/newPassword", async (req, res) => {
  const params = schema.validate(req.params);

  if (params.error) {
    return res
      .status(422)
      .send({ error: true, message: params.error.details[0].message });
  }

  const mongoConnect = await connect();

  try {
    const userModel = mongoConnect.model("User", userSchema);
    const user = await userModel.findOne(
      validateEmail(params.value)
        ? { email: params.value }
        : { cpf: params.value }
    );

    if (!user) {
      return res
        .status(404)
        .send({ message: "Usuário não encontrado", error: true });
    }

    const token = req.headers.authorization;

    const decode = jwt.verify(token, process.env.JWT_KEY);
    const iat = DateTime.fromISO(decode.expire_date);
    const nowIso = DateTime.now().toISO();

    if (iat < nowIso) {
      return res.status(401).send({ message: "token expired" });
    } else if (decode.validator != user.password) {
      return res.status(401).send({ message: "Wrong validator" });
    } else if (decode.fullname != user.fullname) {
      return res.status(401).send({ message: "Different users" });
    }

    const cryptoPass = await bcrypt.hash(params.value.password, 10);

    await userModel.updateOne({ id: user.id }, { password: cryptoPass });

    await disconnect(mongoConnect);
    return res.status(200).send({ message: "Senha alterada" });
  } catch (error) {
    console.log(error);
    await disconnect(mongoConnect);
    return res.status(500).send({ error: true, message: `error` });
  }
});

module.exports = app;
