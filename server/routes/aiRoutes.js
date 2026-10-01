const express = require('express');
const router = express.Router();
const { findMatchesForItem } = require('../controllers/aiController');
const { aiLimiter } = require('../middleware/securityMiddleware');

// Route: POST /api/ai/match (Protected with AI Quota Rate Limiting)
// Accepts { itemId: string } and returns semantic match recommendations
router.post('/match', aiLimiter, findMatchesForItem);

module.exports = router;
