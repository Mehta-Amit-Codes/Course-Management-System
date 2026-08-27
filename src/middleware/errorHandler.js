const mongoose = require("mongoose");
const config = require("../config/env");

function notFound(req, _res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  err.code = "ROUTE_NOT_FOUND";
  next(err);
}

function errorHandler(err, req, res, _next) {
  req.log?.error({ err }, "Request failed");

  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Internal server error";
  let details = err.details;

  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Database validation failed";
    details = Object.values(err.errors).map(e => ({ path: e.path, message: e.message }));
  }

  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = "INVALID_ID";
    message = "Invalid resource identifier";
  }

  if (err.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_RESOURCE";
    message = "A resource with the same unique value already exists";
  }

  const response = { error: { code, message } };
  if (details) response.error.details = details;
  if (config.NODE_ENV !== "production" && statusCode >= 500) response.error.stack = err.stack;

  res.status(statusCode).json(response);
}

module.exports = { notFound, errorHandler };