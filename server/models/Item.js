const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed item description'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Please specify item type: LOST or FOUND'],
      enum: {
        values: ['LOST', 'FOUND'],
        message: '{VALUE} is not a valid item type. Must be LOST or FOUND',
      },
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please assign a category to this item'],
      index: true,
    },
    image: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Please provide the location where the item was lost or found'],
      trim: true,
      maxlength: [150, 'Location description cannot exceed 150 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Please provide the approximate date'],
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item must be associated with a reporting user'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['OPEN', 'CLAIM_PENDING', 'CLAIMED', 'RESOLVED'],
        message: '{VALUE} is not a valid item status',
      },
      default: 'OPEN',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
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

// -------------------------------------------------------------
// Compound Text Index for Search Queries (Phase 5)
// Enables full-text searches like: { $text: { $search: 'black phone' } }
// -------------------------------------------------------------
itemSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  tags: 'text',
});

// Soft delete query middleware
itemSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
