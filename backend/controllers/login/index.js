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

app.post("/login", async (req, res) => {
  const params = schema.validate(req.body);

  if (params.error) {
    return res
      .status(422)
      .send({ error: true, message: params.error.details[0].message });
  }

  const mongoConnect = await connect();

  try {
    const excludedFields = { _id: false };
    const userModel = mongoConnect.model("User", userSchema);
    const logUser = await userModel
      .findOne(
        validateEmail(params.value.user)
          ? { email: params.value.user }
          : { cpf: params.value.user }
      )
      .select(excludedFields)
      .lean();

    if (!logUser) {
      return res
        .status(401)
        .send({ message: "Credenciais inválidas", error: true });
    }

    const equalPass = await bcrypt.compare(
      params.value.password,
      logUser.password
    );

    await disconnect(mongoConnect);
    if (equalPass) {
      delete logUser.password;
      const token = jwt.sign(
        {
          fullname: logUser.fullname,
          expire_date: DateTime.now().plus({ hours: 24 }).toISO(),
        },
        process.env.JWT_KEY
      );

      return res.status(200).send({
        token,
        message: "Usuário logado",
        userInfo: logUser,
      });
    } else {
      return res
        .status(401)
        .send({ message: "Credenciais inválidas", error: true });
    }
  } catch (error) {
    console.log(error);
    await disconnect(mongoConnect);
    return res.status(500).send({ error: true, message: `error` });
  }
});

module.exports = app;
