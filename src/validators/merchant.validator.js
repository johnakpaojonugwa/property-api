import Joi from 'joi';

export const createMerchantSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().pattern(/^[0-9+()\-\s]{7,15}$/).required(),
  password: Joi.string().min(8).optional(),
  password_hash: Joi.string().min(8).optional(),
  avatar: Joi.string().uri().optional(),
}).or('password', 'password_hash').unknown(false);

export const verifyMerchantSchema = Joi.object({
  is_verified: Joi.boolean().required(),
});

export const verifyAgentSchema = Joi.object({
  agent_id: Joi.string().required(),
  is_verified: Joi.boolean().required(),
}).unknown(false);

