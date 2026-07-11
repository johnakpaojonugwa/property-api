import ApiError from '../utils/ApiError.js';

const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound('Resource not found'));
};

export default notFoundHandler;
