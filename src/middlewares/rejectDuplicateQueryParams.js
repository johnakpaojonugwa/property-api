import ApiError from '../utils/ApiError.js';

const rejectDuplicateQueryParams = (req, res, next) => {
  const queryString = req.originalUrl.split('?')[1] ?? '';
  const pairs = queryString.split('&').filter(Boolean);
  const seen = new Set();

  const hasDuplicate = pairs.some((pair) => {
    const key = pair.split('=')[0];

    if (seen.has(key)) {
      return true;
    }

    seen.add(key);
    return false;
  });

  if (hasDuplicate) {
    return next(ApiError.badRequest('Duplicate query parameters are not allowed'));
  }

  return next();
};

export default rejectDuplicateQueryParams;
