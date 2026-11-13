export function notFoundHandler(req, res, next) {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // Detailed diagnostic information for local development.
  console.error("========== API ERROR ==========");
  console.error("Name:", error.name);
  console.error("Message:", error.message);
  console.error("Code:", error.code);
  console.error("Stack:", error.stack);
  console.error("================================");

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "An internal server error occurred."
        : error.message,
  });
}