class AppError extends Error {
  constructor(statusCode = 500, message = 'Something went wrong') {
    super();

    this.status = 'error';
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = AppError;
