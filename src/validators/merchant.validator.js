import Joi from 'joi';

export const createMerchantSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().pattern(/^[0-9+()\-\s]{7,15}$/).required(),
  password_hash: Joi.string().min(8).required(),
  avatar: Joi.string().uri().optional(),
}).unknown(false);
