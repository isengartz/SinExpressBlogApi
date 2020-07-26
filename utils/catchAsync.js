// Wrapper for all Async functions
// Will catch the errors and they will be handled in the global error handler
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
