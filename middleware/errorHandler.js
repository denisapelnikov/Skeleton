module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') err.message = err.stack;

  return res.status(err.statusCode).json(err);
};
