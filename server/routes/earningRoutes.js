const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateEarning } = require('../middleware/validation');
const {
  readEarnings,
  addEarning,
  updateEarning,
  deleteEarning
} = require('../services/googleSheetsService');

// All earning routes require auth
router.use(authenticateToken);

// GET /api/earnings
router.get('/', async (req, res) => {
  try {
    const earnings = await readEarnings();
    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch earnings.' });
  }
});

// POST /api/earnings
router.post('/', validateEarning, async (req, res) => {
  try {
    const newEarning = await addEarning(req.body);
    res.status(201).json({
      message: 'Earning added successfully.',
      data: newEarning
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to save earning. Please try again.' });
  }
});

// PUT /api/earnings/:id
router.put('/:id', validateEarning, async (req, res) => {
  try {
    const updated = await updateEarning(req.params.id, req.body);
    res.json({
      message: 'Earning updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update earning.' });
  }
});

// DELETE /api/earnings/:id
router.delete('/:id', async (req, res) => {
  try {
    await deleteEarning(req.params.id);
    res.json({ message: 'Earning deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete earning.' });
  }
});

module.exports = router;
