const AppError = require('../utils/appError');
const httpCodes = require('../utils/httpStatuses');

// Used to send the error payload when in Development Env
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// Used to send the error payload when in Production Env
const sendErrorProd = (err, res) => {
  // If its Operational its a known error so send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown errors: dont leak details to client
    // eslint-disable-next-line no-console
    console.debug(err);
    res.status(httpCodes.HTTP_INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
// Mongoose Cast Errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, httpCodes.HTTP_BAD_REQUEST);
};

// Mongoose Validation Errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, httpCodes.HTTP_BAD_REQUEST);
};

// MongoDB duplicate value for field
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value} Please use another value!`;
  return new AppError(message, httpCodes.HTTP_BAD_REQUEST);
};

// Wrong JWT Bearer Token
const handleJWTError = () => {
  return new AppError(
    'Invalid Token. Please login again!',
    httpCodes.HTTP_UNAUTHORIZED
  );
};
// JWT Token expired
const handleJWTExpiredError = () => {
  return new AppError(
    'Expired Token. Login again.',
    httpCodes.HTTP_UNAUTHORIZED
  );
};

// Global Error Handler
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || httpCodes.HTTP_INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
