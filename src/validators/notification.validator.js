import Joi from 'joi';

export const broadcastNotificationSchema = Joi.object({
  recipientRoles: Joi.array().items(Joi.string().valid('USER', 'AGENT', 'MERCHANT', 'ADMIN', 'GUEST', 'user', 'agent', 'merchant', 'admin', 'guest')).min(1).required(),
  title: Joi.string().trim().min(1).max(200).required(),
  message: Joi.string().trim().min(1).max(2000).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'LOW', 'MEDIUM', 'HIGH').optional(),
  data: Joi.object().optional(),
  actions: Joi.array().items(Joi.object()).optional(),
}).unknown(false);

export const updatePreferencesSchema = Joi.object({
  channels: Joi.object({
    inApp: Joi.boolean().optional(),
    email: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
  }).optional(),
  categories: Joi.object({
    system: Joi.boolean().optional(),
    security: Joi.boolean().optional(),
    marketing: Joi.boolean().optional(),
    transactional: Joi.boolean().optional(),
  }).pattern(Joi.string(), Joi.boolean()).optional(),
  quietHours: Joi.object({
    enabled: Joi.boolean().optional(),
    start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: Joi.string().optional(),
  }).optional(),
  digestFrequency: Joi.string().valid('instant', 'daily', 'weekly').optional(),
}).unknown(false);
