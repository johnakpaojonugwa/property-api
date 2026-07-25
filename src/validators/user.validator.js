import Joi from 'joi';

export const createUserSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(50).required(),
  last_name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().pattern(/^[0-9+()\-\s]{7,15}$/).required(),
  password: Joi.string().min(8).optional(),
  password_hash: Joi.string().min(8).optional(),
  role: Joi.string().valid('USER').optional(),
}).or('password', 'password_hash').unknown(false);
