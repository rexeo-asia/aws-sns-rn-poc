const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation error';
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.message) {
    message = err.message;
  }

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

module.exports = { errorHandler };