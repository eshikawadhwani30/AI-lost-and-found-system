const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get all active categories
 * @route   GET /api/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Admin (Public for Phase 2 foundation testing)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return sendError(res, 400, 'Category name is required');
    }

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return sendError(res, 400, `Category '${name}' already exists`);
    }

    const category = await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
    });

    return sendSuccess(res, 201, 'Category created successfully', category);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed initial standard categories
 * @route   POST /api/categories/seed
 * @access  Public / Setup
 */
const seedCategories = async (req, res, next) => {
  try {
    const defaultCategories = [
      { name: 'Electronics', description: 'Smartphones, Laptops, Earbuds, Chargers, Smartwatches' },
      { name: 'Wallets & Bags', description: 'Wallets, Purses, Backpacks, Handbags, Luggage' },
      { name: 'Documents & IDs', description: 'Student ID Cards, Passports, Driver Licenses, Credit Cards' },
      { name: 'Keys & Cards', description: 'Room keys, Car keys, Bike keys, Access cards' },
      { name: 'Clothing & Wearables', description: 'Jackets, Caps, Scarves, Glasses, Jewelry' },
      { name: 'Books & Stationery', description: 'Notebooks, Textbooks, Calculators, Art kits' },
      { name: 'Others', description: 'Sports equipment, Water bottles, Umbrellas, Miscellaneous' },
    ];

    const results = [];
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        const created = await Category.create(cat);
        results.push(created);
      }
    }

    const totalCount = await Category.countDocuments();
    return sendSuccess(res, 200, `Category seed completed. Added ${results.length} new categories. Total categories: ${totalCount}`, {
      added: results,
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft delete a category
 * @route   DELETE /api/categories/:id
 * @access  Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // Soft delete pattern: flag as deleted without removing from DB
    category.isDeleted = true;
    category.isActive = false;
    await category.save();

    return sendSuccess(res, 200, 'Category soft-deleted successfully', { id: category._id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  seedCategories,
  deleteCategory,
};
