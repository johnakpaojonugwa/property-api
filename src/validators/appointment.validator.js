import Joi from 'joi';

export const createAppointmentSchema = Joi.object({
  property_id: Joi.string().required(),
  user_id: Joi.string().required(),
  agent_id: Joi.string().required(),
  date: Joi.string().required(),
  msg: Joi.string().trim().max(500).optional(),
  time: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
  }).required(),
  agent_completed: Joi.boolean().optional(),
  user_completed: Joi.boolean().optional(),
  confirmed: Joi.boolean().optional(),
}).unknown(false);

export const updateAppointmentSchema = Joi.object({
  property_id: Joi.string().optional(),
  user_id: Joi.string().optional(),
  agent_id: Joi.string().optional(),
  date: Joi.string().optional(),
  msg: Joi.string().trim().max(500).optional(),
  time: Joi.object({
    from: Joi.string().required(),
    to: Joi.string().required(),
  }).optional(),
  agent_completed: Joi.boolean().optional(),
  user_completed: Joi.boolean().optional(),
  confirmed: Joi.boolean().optional(),
}).unknown(false);

