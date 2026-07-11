import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  actor_type: Joi.string().valid('USER', 'AGENT', 'MERCHANT').optional(),
}).unknown(false);
