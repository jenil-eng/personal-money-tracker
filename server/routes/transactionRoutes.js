const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');
const {
  readTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction
} = require('../services/googleSheetsService');

// All transaction routes require auth
router.use(authenticateToken);

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await readTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch transactions.' });
  }
});

// POST /api/transactions
router.post('/', validateTransaction, async (req, res) => {
  try {
    const newTransaction = await addTransaction(req.body);
    res.status(201).json({
      message: 'Transaction added successfully.',
      data: newTransaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to save transaction. Please try again.' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', validateTransaction, async (req, res) => {
  try {
    const updated = await updateTransaction(req.params.id, req.body);
    res.json({
      message: 'Transaction updated successfully.',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update transaction.' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    await deleteTransaction(req.params.id);
    res.json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete transaction.' });
  }
});

module.exports = router;
