export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message = 'Error', statusCode = 500, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error,
  });
};

export const validateRequiredFields = (body, requiredFields) => {
  for (const field of requiredFields) {
    if (!body[field]) {
      return { valid: false, message: `${field} is required` };
    }
  }
  return { valid: true };
};
