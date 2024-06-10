const express = require("express");
const app = express();
const { v4 } = require("uuid");
const auth = require("../../midddleware/auth");
const { connect, disconnect } = require("../../config/database");
const validationRequestSchema = require("../../models/ValidationRequest");
const userSchema = require("../../models/User");
const schema = require("./schema");
const { DateTime } = require("luxon");

app.post("/validation", auth, async (req, res) => {
  const params = schema.validate(req.body);

  if (params.error) {
    return res
      .status(422)
      .send({ error: true, message: params.error.details[0].message });
  }

  const mongoConnect = await connect();

  try {
    const validationModel = mongoConnect.model(
      "ValidationRequest",
      validationRequestSchema
    );
    const userModel = mongoConnect.model("User", userSchema);

    const user = await userModel.findOne({ cpf: params.value.cpf });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    } else if (!user.validated) {
      return res
        .status(403)
        .send({ message: "Only validated users can create validations" });
    }

    const data = {
      cpf_validador: params.value.cpf,
      request_id: v4(),
      expire_date: DateTime.now().plus({ days: 5 }).toISO(),
      created_at: DateTime.now().toISO(),
      updated_at: DateTime.now().toISO(),
      status: "pending",
    };

    const validation = await validationModel.create(data);

    await disconnect(mongoConnect);
    return res.status(200).send({ created: true, request_id: validation });
  } catch (error) {
    console.log(error);
    await disconnect(mongoConnect);
    return res.status(500).send({ error: true, message: `error` });
  }
});

module.exports = app;
