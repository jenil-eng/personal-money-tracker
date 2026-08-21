const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { readLists, updateLists } = require('../services/googleSheetsService');

router.use(authenticateToken);

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const lists = await readLists();
    res.json(lists);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch settings.' });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const { categories, sources, paymentMethods } = req.body;
    if (!Array.isArray(categories) || !Array.isArray(sources) || !Array.isArray(paymentMethods)) {
      return res.status(400).json({ message: 'Invalid payload. Lists must be arrays.' });
    }

    const updatedLists = await updateLists({ categories, sources, paymentMethods });
    res.json({
      message: 'Settings updated successfully.',
      data: updatedLists
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update settings.' });
  }
});

module.exports = router;
