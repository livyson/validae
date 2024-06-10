const Joi = require("joi");

module.exports = Joi.object({
  user: Joi.string().required(),
  password: Joi.string().required(),
});
