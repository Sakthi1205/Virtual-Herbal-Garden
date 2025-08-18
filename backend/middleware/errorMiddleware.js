// Standard JSON error handlers
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  const message = err.message || 'Server Error';
  res.json({
    message,
    // include stack only in development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
