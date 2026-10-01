const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Claim must be associated with an item'],
      index: true,
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claim must be associated with a user'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Please explain why this item belongs to you'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    proof: {
      type: String,
      trim: true,
      maxlength: [1000, 'Proof details cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'APPROVED', 'REJECTED'],
        message: '{VALUE} is not a valid claim status',
      },
      default: 'PENDING',
      index: true,
    },
    adminComment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Admin comment cannot exceed 500 characters'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Soft delete query middleware
claimSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;
