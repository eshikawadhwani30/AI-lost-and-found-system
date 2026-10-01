/**
 * Standardized API Response Helper Functions
 * 
 * Ensures all API responses adhere to a consistent contract:
 * Success: { success: true, message: string, data: any }
 * Error:   { success: false, message: string, errors?: any }
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const responsePayload = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    responsePayload.data = data;
  }

  return res.status(statusCode).json(responsePayload);
};

const sendError = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const responsePayload = {
    success: false,
    message,
  };

  if (errors !== null && errors !== undefined) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  sendSuccess,
  sendError,
};
