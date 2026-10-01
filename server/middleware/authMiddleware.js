const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Protect Middleware: Verifies JWT token and attaches authenticated user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check if Authorization header exists and follows the Bearer token convention
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Format: "Bearer <token>" -> split by space and take the second element
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Fetch user from database and attach to req.user (excluding password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return sendError(res, 401, 'User associated with this token no longer exists');
      }

      if (user.isDeleted) {
        return sendError(res, 401, 'User account has been deactivated or deleted');
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Your session has expired. Please log in again.');
      }
      return sendError(res, 401, 'Invalid authentication token. Authorization denied.');
    }
  }

  // If no token was found in the header
  if (!token) {
    return sendError(res, 401, 'Access denied. No authentication token provided.');
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware: Restricts route to specific user roles
 * Example usage: authorize('ADMIN') or authorize('ADMIN', 'MODERATOR')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access Forbidden: User role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
