const { Schema } = require("mongoose");

const Validations = new Schema({
  name: String,
  score: Number,
  validation_date: Date,
  validator_cpf: String,
  validated_cpf: String,
});

module.exports = Validations;
