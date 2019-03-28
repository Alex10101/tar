const Joi = require('joi');

exports.upload = Joi.object().keys({
  title: Joi.string().max(15),
  filename: Joi.string().min(2).max(20),
  description: Joi.string().max(50),
  expire: Joi.date().greater('now').label("Date"),
});

exports.index = Joi.object().keys({
  skip: Joi.string().min(1).max(5).regex(/\D/, {invert: true}),
  limit: Joi.string().min(1).max(5).regex(/\D/, {invert: true}),
  search_by: this.upload,
});

exports.read = Joi.object().keys({
  skip: Joi.string().min(1).max(5).regex(/\D/, {invert: true}),
  limit: Joi.string().min(1).max(7).regex(/\D/, {invert: true}),
  path: Joi.string().max(150).regex(/\.\.\//, {invert: true})
    // .regex(/\.tar/)
  ,
});
