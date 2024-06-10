const { Schema } = require("mongoose");

const User = new Schema({
  fullname: String,
  birth_date: Date,
  cpf: String,
  doc_image_link: String,
  face_image_link: String,
  address: String,
  liveness_approve: Boolean,
  last_liveness: Date,
  phone: String,
  email: String,
  score: Number,
  input_data: {},
  extracted_data: {},
  old_data: {},
  sources_validations: {},
  password: String,
  create_date: Date,
  update_date: Date,
  validated: Boolean,
});

module.exports = User;
