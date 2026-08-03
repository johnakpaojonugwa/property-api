import rateLimit from 'express-rate-limit';
import ApiResponse from '../utils/ApiResponse.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  handler: (req, res, next, options) => {
    res.status(429).json(
      ApiResponse.error(options.message, [
        {
          message: 'Brute-force protection: Rate limit exceeded.',
          resetTime: req.rateLimit?.resetTime ? new Date(req.rateLimit.resetTime) : null,
        },
      ], 429)
    );
  },
});

export default authLimiter;
