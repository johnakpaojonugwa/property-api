import Joi from 'joi';

export const createReviewSchema = Joi.object({
  property_id: Joi.string().required(),
  user_id: Joi.string().required(),
  text: Joi.string().trim().min(3).max(1000).required(),
}).unknown(false);
