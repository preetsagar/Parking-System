const AppError = require("../util/appError");

const handleDuplicateKeyError = (err) => {
  if (Object.keys(err.keyValue).length > 1) {
    return new AppError(`Duplicate key Combination: ${Object.keys(err.keyValue)}`, 400);
  }
  return new AppError(`Duplicate key : ${Object.keys(err.keyValue)}`, 400);
};

const handleDevelopmentError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "Error";
  const message = err.message || "Internal Error";
  res.status(statusCode).json({
    status,
    message,
    err,
    stack: err.stack,
  });
};

const handleProductionError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || "Error";
  const message = err.message || "Not Operational Error- in dev env";
  return res.status(statusCode).json({
    status: status,
    data: {
      message,
    },
  });
};

const handleGlobalError = (err, req, res, next) => {
  // console.log(err);
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    handleDevelopmentError(err, req, res, next);
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        data: {
          message: err.message,
        },
      });
    }

    let error = { ...err, message: err.message };
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    handleProductionError(error, req, res, next);
  }
};

module.exports = handleGlobalError;
