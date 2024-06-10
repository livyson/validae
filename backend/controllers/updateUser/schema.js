const Joi = require("joi");

module.exports = Joi.object({
  cpf: Joi.string().required(),
  newdata: Joi.object({
    email: Joi.string().optional(),
    phone: Joi.string().optional(),
    birth_date: Joi.string().optional,
    address: Joi.object({
      line: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      number: Joi.string().optional(),
      district: Joi.string().optional(),
      complement: Joi.string().optional(),
    }).optional(),
  }).required(),
});
