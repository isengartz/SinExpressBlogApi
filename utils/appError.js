// Custom Error
class AppError extends Error {
  constructor(message, statusCode) {
    super();

    this.message = message || `Something went wrong. Please try again.`;
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
