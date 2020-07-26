const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

// Handling Uncaught Exceptions
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.log(`Uncaught Exception: ${err}`);
  process.exit(1);
});

const port = process.env.PORT || 3000;

// Add the password to connection string
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// Connect to DB
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Database Connection Successful');
  });

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App Running on port ${port} ...`);
});

// Handling Promise Unhandled Rejection
process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log(`Unhandled Rejection: ${err}`);
  // Gracefully shutdown server and app
  server.close(() => {
    process.exit(1);
  });
});
