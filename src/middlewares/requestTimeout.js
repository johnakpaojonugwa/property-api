import ApiError from '../utils/ApiError.js';

const requestTimeout = (ms = 5000) => (req, res, next) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      next(ApiError.internal('Request timed out'));
    }
  }, ms);

  const originalEnd = res.end;
  res.end = (...args) => {
    clearTimeout(timer);
    return originalEnd.apply(res, args);
  };

  next();
};

export default requestTimeout;
