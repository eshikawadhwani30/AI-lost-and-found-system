const Item = require('../models/Item');
const { matchItemsWithGemini } = require('../services/geminiService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Find AI-powered potential matches for a given item using Google Gemini
 * @route   POST /api/ai/match
 * @access  Public / Private
 */
const findMatchesForItem = async (req, res, next) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return sendError(res, 400, 'Please provide an item ID to perform AI matching');
    }

    // 1. Fetch the source item
    const sourceItem = await Item.findById(itemId)
      .populate('category', 'name')
      .populate('user', 'name email');

    if (!sourceItem) {
      return sendError(res, 404, 'Target item not found');
    }

    // 2. Identify target opposite candidate type
    // If user lost an item -> search among FOUND items
    // If user found an item -> search among LOST items
    const oppositeType = sourceItem.type === 'LOST' ? 'FOUND' : 'LOST';

    // 3. Find candidate items in MongoDB (excluding claimed and soft-deleted items)
    const candidates = await Item.find({
      type: oppositeType,
      status: { $ne: 'CLAIMED' },
      isDeleted: { $ne: true },
      _id: { $ne: sourceItem._id },
    })
      .populate('category', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(15); // Evaluate top 15 candidate matches

    if (candidates.length === 0) {
      return sendSuccess(res, 200, `No active ${oppositeType} items available in the catalog to match against.`, {
        sourceItem,
        matches: [],
        engine: 'Google Gemini 1.5 Flash',
      });
    }

    // 4. Invoke Gemini AI matching service
    const aiResponse = await matchItemsWithGemini(sourceItem, candidates);

    // 5. Merge AI scores & reasoning with the actual candidate item documents
    const candidateMap = new Map();
    candidates.forEach((cand) => candidateMap.set(cand._id.toString(), cand));

    const finalMatches = aiResponse.results
      .map((match) => {
        const itemDoc = candidateMap.get(match.candidateId);
        if (!itemDoc) return null;

        return {
          item: itemDoc,
          confidenceScore: match.confidenceScore,
          matchLevel: match.matchLevel,
          matchReason: match.matchReason,
          keySimilarities: match.keySimilarities || [],
        };
      })
      .filter(Boolean);

    return sendSuccess(res, 200, 'AI matching analysis completed successfully', {
      sourceItem,
      engine: aiResponse.engine,
      totalEvaluated: candidates.length,
      matches: finalMatches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  findMatchesForItem,
};
