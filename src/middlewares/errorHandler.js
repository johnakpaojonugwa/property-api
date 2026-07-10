const errorHandler = (err, req, res, next) => {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || 'Internal server error';
  const errors = Array.isArray(err?.errors) ? err.errors : [];

  const response = {
    success: false,
    message,
    errors,
    statusCode,
  };

  if (process.env.NODE_ENV !== 'production' && err?.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
