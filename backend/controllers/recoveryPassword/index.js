const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
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

app.get("/user/recovery/:user", async (req, res) => {
  const params = schema.validate(req.params.user);

  if (params.error) {
    return res
      .status(422)
      .send({ error: true, message: params.error.details[0].message });
  }

  const mongoConnect = await connect();

  try {
    const userModel = mongoConnect.model("User", userSchema);
    const logUser = await userModel.findOne(
      validateEmail(params.value)
        ? { email: params.value }
        : { cpf: params.value }
    );

    if (!logUser) {
      return res
        .status(404)
        .send({ message: "Usuário não encontrado", error: true });
    }

    await disconnect(mongoConnect);
    const token = jwt.sign(
      {
        fullname: logUser.fullname,
        validator: logUser.password,
        expire_date: DateTime.now().plus({ hours: 4 }).toISO(),
      },
      process.env.JWT_KEY
    );
    //Send email to user email address
    return res.status(200).send({ message: "Email enviado" });
  } catch (error) {
    console.log(error);
    await disconnect(mongoConnect);
    return res.status(500).send({ error: true, message: `error` });
  }
});

module.exports = app;
