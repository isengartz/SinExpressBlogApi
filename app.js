const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const httpCodes = require('./utils/httpStatuses');
const globalErrorHandler = require('./controllers/errorController');
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const tagRoutes = require('./routes/tagRoutes');

const app = express();

// if we are in dev use morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Use Rate Limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, try again in an hour',
});

// Middleware
app.use('/api', limiter);
app.use(express.json());
app.use(mongoSanitize());

// Routes
const API_ROOT_ENDPOINT = '/api/v1';
app.use(`${API_ROOT_ENDPOINT}/blogs`, blogRoutes);
app.use(`${API_ROOT_ENDPOINT}/auth`, authRoutes);
app.use(`${API_ROOT_ENDPOINT}/users`, userRoutes);
app.use(`${API_ROOT_ENDPOINT}/tags`, tagRoutes);

// Handling unhandled routes
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Cant find ${req.originalUrl} on this server!`,
      httpCodes.HTTP_NOT_FOUND
    )
  );
});
// Bind the global error handler
app.use(globalErrorHandler);
module.exports = app;
