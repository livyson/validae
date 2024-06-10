const Joi = require("joi");

module.exports = Joi.object({
  cpf_validador: Joi.string().required(),
});
