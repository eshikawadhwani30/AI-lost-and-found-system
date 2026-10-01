const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  seedCategories,
  deleteCategory,
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to view categories
router.route('/')
  .get(getCategories)
  // Protected: Only ADMIN can manually create categories
  .post(protect, authorize('ADMIN'), createCategory);

// Helper route to seed default categories
router.post('/seed', seedCategories);

// Protected: Only ADMIN can delete categories
router.route('/:id')
  .delete(protect, authorize('ADMIN'), deleteCategory);

module.exports = router;
