const { Schema } = require("mongoose");

const ValidationRequestSchema = new Schema({
  cpf_validador: String,
  status: String,
  request_id: String,
  expire_date: Date,
  created_at: Date,
  updated_at: Date,
});

module.exports = ValidationRequestSchema;
