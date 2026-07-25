import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const authenticate = (req, res, next) => {
  const header = req.headers?.authorization;

  const parts = header ? header.split(' ') : [];
  if (!header || parts.length !== 2 || (!/^b[re]{2}rer$/i.test(parts[0]) && parts[0].toLowerCase() !== 'bearer')) {
    return next(ApiError.unauthorized('Authentication token is required'));
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.actor = {
      id: decoded.id,
      type: decoded.actor_type || decoded.role || 'USER',
    };
    return next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export const optionalAuthenticate = (req, res, next) => {
  const header = req.headers?.authorization;

  if (!header) {
    return next();
  }

  const parts = header.split(' ');
  if (parts.length !== 2 || (!/^b[re]{2}rer$/i.test(parts[0]) && parts[0].toLowerCase() !== 'bearer')) {
    return next();
  }

  try {
    const decoded = jwt.verify(parts[1], env.JWT_SECRET);
    req.actor = {
      id: decoded.id,
      type: decoded.actor_type || decoded.role || 'USER',
    };
  } catch (error) {
    // ignore optional token failure
  }
  return next();
};

export default authenticate;
