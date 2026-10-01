const jwt = require('jsonwebtoken');

/**
 * Generate a signed JSON Web Token (JWT)
 * 
 * Payload contains the user ID and role
 * Signed with secret key and expiry from environment variables
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId,
      role: role 
    },
    process.env.JWT_SECRET || 'fallback_secret_key_lost_and_found_2024',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

module.exports = generateToken;
