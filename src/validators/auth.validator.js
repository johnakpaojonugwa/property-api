import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  actor_type: Joi.string().valid('USER', 'AGENT', 'MERCHANT').optional(),
}).unknown(false);

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
}).unknown(false);

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
}).unknown(false);

