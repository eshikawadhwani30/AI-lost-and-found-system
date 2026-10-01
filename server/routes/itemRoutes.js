const express = require('express');
const router = express.Router();

const {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');

const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to view items / Protected route to report item (supports single image upload)
router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

// Protected route to view items reported by current user
router.get('/my', protect, getMyItems);

// Routes for single item operations
router.route('/:id')
  .get(getItemById)
  .put(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

module.exports = router;
