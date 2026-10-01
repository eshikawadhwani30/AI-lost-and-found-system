const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllItemsAdmin,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Enforce authentication & ADMIN role on all /api/admin routes
router.use(protect, authorize('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/items', getAllItemsAdmin);

module.exports = router;
