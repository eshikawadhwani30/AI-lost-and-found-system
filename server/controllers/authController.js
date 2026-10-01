const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone, role } = req.body;

    // 1. Validation: Required fields
    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password');
    }

    // 2. Validation: Password match (if confirmPassword provided)
    if (confirmPassword && password !== confirmPassword) {
      return sendError(res, 400, 'Passwords do not match');
    }

    // 3. Validation: Password strength
    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    // 4. Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return sendError(res, 400, 'An account with this email already exists');
    }

    // 5. Create user in database (pre-save hook hashes password)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : '',
      role: role && ['USER', 'ADMIN'].includes(role) ? role : 'USER',
    });

    // 6. Generate JWT token
    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 201, 'User registered successfully', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & login
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    // 2. Find user by email and explicitly select password (because select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // 3. Check credentials using bcrypt instance method
    if (!user || !(await user.matchPassword(password))) {
      // Intentionally generic message to prevent user enumeration attacks
      return sendError(res, 401, 'Invalid email or password');
    }

    // 4. Check if account is soft-deleted
    if (user.isDeleted) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
    }

    // 5. Generate JWT token
    const token = generateToken(user._id, user.role);

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected by JWT)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user was attached by the 'protect' middleware
    return sendSuccess(res, 200, 'User profile fetched successfully', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const { name, phone, profileImage } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;

    const updatedUser = await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Please provide both current and new passwords');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    if (!(await user.matchPassword(currentPassword))) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash the new password

    return sendSuccess(res, 200, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
};
