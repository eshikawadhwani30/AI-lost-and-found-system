const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/securityMiddleware');

// Public authentication routes (Protected with Anti-Brute-Force Rate Limiting)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes (Require valid Bearer JWT token)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

module.exports = router;
