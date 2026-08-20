function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'That email is already registered.' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Validation failed.',
      errors: err.errors.map((e) => e.message)
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File is too large. Maximum size is 10MB.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error.'
  });
}

module.exports = errorHandler;
