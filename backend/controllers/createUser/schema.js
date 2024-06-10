const Joi = require("joi");

module.exports = Joi.object({
  cpf: Joi.string().required(),
  fullname: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  password: Joi.string().required(),
});
