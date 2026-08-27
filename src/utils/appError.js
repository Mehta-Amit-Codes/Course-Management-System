class AppError extends Error {
  constructor(statusCode, message, code = "APP_ERROR", details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
  }
}
module.exports = AppError;
