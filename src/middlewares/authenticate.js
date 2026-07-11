import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';
import { env } from '../config/env.js';

const authenticate = (req, res, next) => {
  const header = req.headers?.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token is required'));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.actor = {
      id: decoded.id,
      type: decoded.actor_type,
    };
    return next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

export default authenticate;
