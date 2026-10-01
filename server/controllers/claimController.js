const Claim = require('../models/Claim');
const Item = require('../models/Item');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Submit a claim for a found item
 * @route   POST /api/claims
 * @access  Private (Logged-in users)
 */
const createClaim = async (req, res, next) => {
  try {
    const { itemId, message, proof } = req.body;

    // 1. Validation: Required fields
    if (!itemId || !message || message.trim() === '') {
      return sendError(res, 400, 'Please provide the item ID and a message explaining your claim');
    }

    // 2. Verify item exists and is a FOUND item
    const item = await Item.findById(itemId);
    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    if (item.type !== 'FOUND') {
      return sendError(res, 400, 'Claims can only be filed for items marked as FOUND');
    }

    if (item.status === 'CLAIMED') {
      return sendError(res, 400, 'This item has already been claimed and verified');
    }

    // 3. User cannot claim an item they themselves reported finding
    if (item.user.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot submit a claim on an item that you reported finding');
    }

    // 4. Prevent duplicate pending claims from the same claimant on the same item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: 'PENDING',
    });

    if (existingClaim) {
      return sendError(res, 400, 'You already have a pending claim submitted for this item');
    }

    // 5. Create the claim
    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      message: message.trim(),
      proof: proof ? proof.trim() : '',
      status: 'PENDING',
    });

    // Update item status to indicate an active claim is under review
    item.status = 'CLAIM_PENDING';
    await item.save();

    const populatedClaim = await Claim.findById(claim._id)
      .populate('item', 'title type image location category status')
      .populate('claimant', 'name email phone');

    return sendSuccess(res, 201, 'Claim submitted successfully. Awaiting administrator review.', populatedClaim);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all claims submitted by the current user
 * @route   GET /api/claims/my
 * @access  Private (Logged-in user)
 */
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate({
        path: 'item',
        select: 'title type image location date category status user',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'user', select: 'name email phone' },
        ],
      })
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'My claims retrieved successfully', {
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all claims across the system (with optional status filter)
 * @route   GET /api/claims
 * @access  Private (Admin only)
 */
const getAllClaims = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    const claims = await Claim.find(filter)
      .populate({
        path: 'item',
        select: 'title type image location date status user',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'user', select: 'name email phone' },
        ],
      })
      .populate('claimant', 'name email phone createdAt')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'All claims retrieved successfully for review', {
      count: claims.length,
      claims,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single claim details by ID
 * @route   GET /api/claims/:id
 * @access  Private (Claimant or Admin)
 */
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email phone')
      .populate('reviewedBy', 'name role');

    if (!claim) {
      return sendError(res, 404, 'Claim not found');
    }

    const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isClaimant && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to view this claim');
    }

    return sendSuccess(res, 200, 'Claim details retrieved', claim);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Review & Approve/Reject a claim
 * @route   PUT /api/claims/:id/status
 * @access  Private (Admin only)
 */
const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, adminComment } = req.body;

    // 1. Validation
    if (!status || !['APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      return sendError(res, 400, "Status must be either 'APPROVED' or 'REJECTED'");
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      return sendError(res, 404, 'Claim not found');
    }

    const item = await Item.findById(claim.item);
    if (!item) {
      return sendError(res, 404, 'Associated item not found');
    }

    const normalizedStatus = status.toUpperCase();

    // 2. If approving claim:
    if (normalizedStatus === 'APPROVED') {
      // Mark item as CLAIMED
      item.status = 'CLAIMED';
      await item.save();

      // Automatically reject any other pending claims for this same item
      await Claim.updateMany(
        {
          item: item._id,
          _id: { $ne: claim._id },
          status: 'PENDING',
        },
        {
          status: 'REJECTED',
          adminComment: 'Another claim was verified and approved for this item.',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
        }
      );
    }

    // 3. If rejecting claim:
    if (normalizedStatus === 'REJECTED') {
      // Check if there are any other remaining pending claims on this item
      const remainingPending = await Claim.countDocuments({
        item: item._id,
        _id: { $ne: claim._id },
        status: 'PENDING',
      });

      // If no other pending claims, revert item status back to OPEN
      if (remainingPending === 0 && item.status !== 'CLAIMED') {
        item.status = 'OPEN';
        await item.save();
      }
    }

    // 4. Update the claim itself with audit metadata
    claim.status = normalizedStatus;
    claim.adminComment = adminComment ? adminComment.trim() : '';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    const populatedClaim = await Claim.findById(claim._id)
      .populate('item', 'title type image location status')
      .populate('claimant', 'name email phone')
      .populate('reviewedBy', 'name role');

    return sendSuccess(res, 200, `Claim has been ${normalizedStatus.toLowerCase()} successfully`, populatedClaim);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getAllClaims,
  getClaimById,
  updateClaimStatus,
};
