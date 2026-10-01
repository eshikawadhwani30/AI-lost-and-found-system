const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get complete administrative statistics & analytics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalItems,
      lostItemsCount,
      foundItemsCount,
      claimedItemsCount,
      totalClaims,
      pendingClaimsCount,
      approvedClaimsCount,
      rejectedClaimsCount,
      totalCategories,
      recentItems,
      recentClaims,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      Item.countDocuments({ type: 'LOST' }),
      Item.countDocuments({ type: 'FOUND' }),
      Item.countDocuments({ status: 'CLAIMED' }),
      Claim.countDocuments(),
      Claim.countDocuments({ status: 'PENDING' }),
      Claim.countDocuments({ status: 'APPROVED' }),
      Claim.countDocuments({ status: 'REJECTED' }),
      Category.countDocuments(),
      Item.find()
        .populate('category', 'name')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      Claim.find()
        .populate('item', 'title type image')
        .populate('claimant', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Aggregate items by category for visual analytics
    const itemsByCategoryRaw = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $unwind: {
          path: '$categoryDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: { $ifNull: ['$categoryDetails.name', 'Uncategorized'] },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, 200, 'Admin statistics retrieved successfully', {
      metrics: {
        users: totalUsers,
        items: {
          total: totalItems,
          lost: lostItemsCount,
          found: foundItemsCount,
          claimed: claimedItemsCount,
          open: totalItems - claimedItemsCount,
        },
        claims: {
          total: totalClaims,
          pending: pendingClaimsCount,
          approved: approvedClaimsCount,
          rejected: rejectedClaimsCount,
        },
        categories: totalCategories,
      },
      analytics: {
        itemsByCategory: itemsByCategoryRaw,
      },
      recentActivity: {
        items: recentItems,
        claims: recentClaims,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (with search and role filter)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const filter = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    if (role && ['USER', 'ADMIN'].includes(role.toUpperCase())) {
      filter.role = role.toUpperCase();
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Users retrieved successfully', {
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user role (USER <-> ADMIN)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetUserId = req.params.id;

    if (!role || !['USER', 'ADMIN'].includes(role.toUpperCase())) {
      return sendError(res, 400, "Role must be either 'USER' or 'ADMIN'");
    }

    // Safety check: Prevent an admin from demoting themselves
    if (targetUserId.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot change your own administrative role');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    user.role = role.toUpperCase();
    await user.save();

    return sendSuccess(res, 200, `User role updated to ${user.role}`, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete user account
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    // Safety check: Prevent self-deletion
    if (targetUserId.toString() === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot delete your own admin account');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Soft delete pattern
    user.isDeleted = true;
    await user.save();

    return sendSuccess(res, 200, 'User account deactivated / soft-deleted successfully', {
      _id: user._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items for admin moderation (includes soft-deleted items if requested)
 * @route   GET /api/admin/items
 * @access  Private (Admin only)
 */
const getAllItemsAdmin = async (req, res, next) => {
  try {
    const { includeDeleted } = req.query;

    const queryOptions = includeDeleted === 'true' ? { includeDeleted: true } : {};

    const items = await Item.find({}, null, queryOptions)
      .populate('category', 'name')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Admin items retrieved successfully', {
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllItemsAdmin,
};
