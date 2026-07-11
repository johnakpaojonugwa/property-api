import Joi from 'joi';

export const createAgentSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).required(),
  company: Joi.string().trim().max(100).optional(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().pattern(/^[0-9+()\-\s]{7,15}$/).required(),
  password_hash: Joi.string().min(8).required(),
  avatar: Joi.string().uri().optional(),
  merchant: Joi.string().optional(),
  is_verified: Joi.boolean().optional(),
}).unknown(false);
