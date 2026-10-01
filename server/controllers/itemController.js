const Item = require('../models/Item');
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new Lost or Found item
 * @route   POST /api/items
 * @access  Private (Logged in users only)
 */
const createItem = async (req, res, next) => {
  try {
    const { title, description, type, category, location, date, tags } = req.body;

    // 1. Validation: Required fields
    if (!title || !description || !type || !category || !location) {
      return sendError(res, 400, 'Please provide title, description, type (LOST/FOUND), category, and location');
    }

    if (!['LOST', 'FOUND'].includes(type.toUpperCase())) {
      return sendError(res, 400, "Item type must be either 'LOST' or 'FOUND'");
    }

    // 2. Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return sendError(res, 400, 'Invalid category selected');
    }

    // 3. Handle image upload if provided by Multer
    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    // 4. Parse tags if provided
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      }
    }

    // 5. Create item in MongoDB
    const item = await Item.create({
      title: title.trim(),
      description: description.trim(),
      type: type.toUpperCase(),
      category,
      location: location.trim(),
      date: date ? new Date(date) : new Date(),
      image,
      tags: parsedTags,
      user: req.user._id,
      status: 'OPEN',
    });

    const populatedItem = await Item.findById(item._id)
      .populate('category', 'name')
      .populate('user', 'name email phone profileImage');

    return sendSuccess(res, 201, `${item.type} item reported successfully`, populatedItem);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items with Advanced Search, Filtering, Sorting & Pagination
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      location,
      status,
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 6,
    } = req.query;

    const filter = {};

    // 1. Keyword Search across Title, Description, Location, Tags
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { tags: searchRegex },
      ];
    }

    // 2. Item Type Filter: LOST or FOUND
    if (type && ['LOST', 'FOUND'].includes(type.toUpperCase())) {
      filter.type = type.toUpperCase();
    }

    // 3. Category Filter
    if (category && category !== 'ALL') {
      filter.category = category;
    }

    // 4. Specific Location Filter
    if (location && location.trim() !== '') {
      filter.location = new RegExp(location.trim(), 'i');
    }

    // 5. Status Filter
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    // 6. Date Range Filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    // 7. Sorting Logic
    let sortOptions = { createdAt: -1 }; // default newest created
    switch (sort) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'date-desc':
        sortOptions = { date: -1 };
        break;
      case 'date-asc':
        sortOptions = { date: 1 };
        break;
      case 'title-asc':
        sortOptions = { title: 1 };
        break;
      case 'title-desc':
        sortOptions = { title: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    // 8. Pagination Formula
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 6));
    const skip = (pageNum - 1) * limitNum;

    // Execute count and query in parallel for optimal performance
    const [totalItems, items] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter)
        .populate('category', 'name')
        .populate('user', 'name email phone')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return sendSuccess(res, 200, 'Items retrieved successfully', {
      items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      appliedFilters: {
        search: search || null,
        type: type || 'ALL',
        category: category || 'ALL',
        sort,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item details by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('category', 'name description')
      .populate('user', 'name email phone profileImage createdAt');

    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    return sendSuccess(res, 200, 'Item details retrieved', item);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get items reported by current logged in user
 * @route   GET /api/items/my
 * @access  Private
 */
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ user: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'User items retrieved successfully', {
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update item
 * @route   PUT /api/items/:id
 * @access  Private (Owner or Admin only)
 */
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const isOwner = item.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to update this item');
    }

    const { title, description, category, location, status, tags } = req.body;

    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (location) item.location = location.trim();
    if (status) item.status = status;

    if (tags) {
      if (Array.isArray(tags)) {
        item.tags = tags;
      } else if (typeof tags === 'string') {
        item.tags = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      }
    }

    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await item.save();

    const populated = await Item.findById(updatedItem._id)
      .populate('category', 'name')
      .populate('user', 'name email phone');

    return sendSuccess(res, 200, 'Item updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete item
 * @route   DELETE /api/items/:id
 * @access  Private (Owner or Admin only)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    const isOwner = item.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'You are not authorized to delete this item');
    }

    item.isDeleted = true;
    await item.save();

    return sendSuccess(res, 200, 'Item soft-deleted successfully', { id: item._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
};
