const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Prevents password from being returned in standard queries
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN'],
        message: '{VALUE} is not a supported role. Must be USER or ADMIN',
      },
      default: 'USER',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// -------------------------------------------------------------
// Pre-Save Hook: Automatically hash password before saving to DB
// -------------------------------------------------------------
userSchema.pre('save', async function (next) {
  // Only hash password if it was modified (or is newly created)
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// -------------------------------------------------------------
// Instance Method: Compare entered password with hashed password
// -------------------------------------------------------------
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// -------------------------------------------------------------
// Query Middleware: Soft Delete Filter
// Automatically excludes soft-deleted records in normal queries
// -------------------------------------------------------------
userSchema.pre(/^find/, function (next) {
  // If the query explicitly asks for deleted records via query options, do not filter
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
