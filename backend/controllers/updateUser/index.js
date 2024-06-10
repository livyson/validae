const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const { connect, disconnect } = require("../../config/database");
const userSchema = require("../../models/User");
const schema = require("./schema");
const { validate } = require("gerador-validador-cpf");
const auth = require("../../midddleware/auth");

app.patch("/user", auth, async (req, res) => {
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

    if (!userExits) {
      return res.status(404).send({ error: true, message: "User not found" });
    }

    const updatedUser = await userModel
      .findOneAndUpdate(
        { cpf: cpfNumbers },
        {
          ...params.value.newData,
        },
        {
          new: true,
        }
      )
      .select({ password: false, _id: false })
      .lean();

    await disconnect(mongoConnect);
    return res.status(200).send({ updated: true, userInfo: updatedUser });
  } catch (error) {
    console.log(error);
    await disconnect(mongoConnect);
    return res.status(500).send({ error: true, message: `error` });
  }
});

module.exports = app;
