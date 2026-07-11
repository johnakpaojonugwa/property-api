import Joi from 'joi';
import ApiError from '../utils/ApiError.js';

const validate = (schema, source = 'body') => (req, res, next) => {
  const payload = req[source];

  const { error, value } = schema.validate(payload, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    return next(ApiError.badRequest('Validation failed', errors));
  }

  req[source] = value;
  return next();
};

export default validate;
