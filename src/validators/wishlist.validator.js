import Joi from 'joi';

export const createWishlistSchema = Joi.object({
  user_id: Joi.string().required(),
  property_id: Joi.string().required(),
}).unknown(false);
