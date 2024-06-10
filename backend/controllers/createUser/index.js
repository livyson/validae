const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const { connect, disconnect } = require("../../config/database");
const userSchema = require("../../models/User");
const schema = require("./schema");
const { validate } = require("gerador-validador-cpf");

app.post("/user", async (req, res) => {
  const params = schema.validate(req.body);

  if (params.error) {
    return res
      .status(422)
      .send({ error: true, message: params.error.details[0].message });
  }

  const cpfNumbers = params.value.cpf.replace(/\D+/g, "");

  const validCPF = validate(cpfNumbers);

  if (!validCPF) {
    return res.status(422).send({ error: true, message: "CPF not valid" });
  }

  const mongoConnect = await connect();
  try {
    const userModel = mongoConnect.model("User", userSchema);
    const userExits = await userModel.findOne({ cpf: cpfNumbers }).lean();

    if (userExits) {
      return res
        .status(400)
        .send({ error: true, message: "User already exists on databse" });
    }

    const cryptoPass = await bcrypt.hash(params.value.password, 10);
    const newUser = await userModel.create({
      ...params.value,
      cpf: cpfNumbers,
      password: cryptoPass,
      validated: false,
      create_date: new Date(),
      update_date: new Date(),
      score: 0,
    });

    await disconnect(mongoConnect);
    return res
      .status(200)
      .send({ message: `Usuário ${newUser.fullname} criado!` });
  } catch (error) {
    console.log(error);
    await disconnect(mongoConnect);
    return res.status(500).send({ error: true, message: `error` });
  }
});

module.exports = app;
