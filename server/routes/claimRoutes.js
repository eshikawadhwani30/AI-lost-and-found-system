const express = require('express');
const router = express.Router();

const {
  createClaim,
  getMyClaims,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
} = require('../controllers/claimController');

const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Submit a claim (Logged-in user) / View all claims (Admin only)
router.route('/')
  .post(protect, createClaim)
  .get(protect, authorize('ADMIN'), getAllClaims);

// 2. View claims submitted by current user
router.get('/my', protect, getMyClaims);

// 3. Single claim view / Admin status update (Approve/Reject)
router.route('/:id')
  .get(protect, getClaimById);

router.put('/:id/status', protect, authorize('ADMIN'), updateClaimStatus);

module.exports = router;
