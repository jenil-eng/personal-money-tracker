const express = require('express');
const router = express.Router();
const mockStore = require('../services/mockStoreService');
const { addTransaction } = require('../services/googleSheetsService');
const authMiddleware = require('../middleware/auth');

// Initial seed subscriptions if none exist
const DEFAULT_SUBSCRIPTIONS = [
  {
    id: 1,
    name: 'Netflix Premium (4K)',
    category: 'Entertainment',
    amount: 649,
    billingCycle: 'monthly',
    dueDay: 5,
    paymentMethod: 'UPI',
    status: 'active',
    notes: 'Family 4K UHD plan'
  },
  {
    id: 2,
    name: 'House Rent',
    category: 'Bills',
    amount: 8500,
    billingCycle: 'monthly',
    dueDay: 1,
    paymentMethod: 'Bank Transfer',
    status: 'active',
    notes: 'Hostel / Room rent'
  },
  {
    id: 3,
    name: 'JioFiber Broadband',
    category: 'Bills',
    amount: 1179,
    billingCycle: 'monthly',
    dueDay: 15,
    paymentMethod: 'UPI',
    status: 'active',
    notes: 'High-speed WiFi'
  },
  {
    id: 4,
    name: 'Spotify Student',
    category: 'Entertainment',
    amount: 59,
    billingCycle: 'monthly',
    dueDay: 28,
    paymentMethod: 'UPI',
    status: 'active',
    notes: 'Student music streaming'
  }
];

function getSubscriptionsFromStore() {
  const store = mockStore.readStore();
  if (!store.subscriptions) {
    store.subscriptions = DEFAULT_SUBSCRIPTIONS;
    mockStore.writeStore(store);
  }
  return store.subscriptions;
}

// All endpoints require authentication
router.use(authMiddleware);

// GET /api/subscriptions
router.get('/', (req, res) => {
  try {
    const subs = getSubscriptionsFromStore();
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subscriptions.' });
  }
});

// POST /api/subscriptions
router.post('/', (req, res) => {
  try {
    const { name, category, amount, billingCycle, dueDay, paymentMethod, notes } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ message: 'Subscription name and amount are required.' });
    }

    const store = mockStore.readStore();
    if (!store.subscriptions) store.subscriptions = DEFAULT_SUBSCRIPTIONS;

    const newSub = {
      id: Date.now(),
      name: name.trim(),
      category: category || 'Bills',
      amount: Number(amount) || 0,
      billingCycle: billingCycle || 'monthly',
      dueDay: Number(dueDay) || 1,
      paymentMethod: paymentMethod || 'UPI',
      status: 'active',
      notes: notes || ''
    };

    store.subscriptions.push(newSub);
    mockStore.writeStore(store);

    res.status(201).json(newSub);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subscription.' });
  }
});

// PUT /api/subscriptions/:id
router.put('/:id', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const store = mockStore.readStore();
    if (!store.subscriptions) store.subscriptions = DEFAULT_SUBSCRIPTIONS;

    const index = store.subscriptions.findIndex(s => Number(s.id) === targetId);
    if (index === -1) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    const { name, category, amount, billingCycle, dueDay, paymentMethod, status, notes } = req.body;
    store.subscriptions[index] = {
      ...store.subscriptions[index],
      name: name !== undefined ? name.trim() : store.subscriptions[index].name,
      category: category !== undefined ? category : store.subscriptions[index].category,
      amount: amount !== undefined ? Number(amount) : store.subscriptions[index].amount,
      billingCycle: billingCycle !== undefined ? billingCycle : store.subscriptions[index].billingCycle,
      dueDay: dueDay !== undefined ? Number(dueDay) : store.subscriptions[index].dueDay,
      paymentMethod: paymentMethod !== undefined ? paymentMethod : store.subscriptions[index].paymentMethod,
      status: status !== undefined ? status : store.subscriptions[index].status,
      notes: notes !== undefined ? notes : store.subscriptions[index].notes
    };

    mockStore.writeStore(store);
    res.json(store.subscriptions[index]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update subscription.' });
  }
});

// DELETE /api/subscriptions/:id
router.delete('/:id', (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const store = mockStore.readStore();
    if (!store.subscriptions) store.subscriptions = DEFAULT_SUBSCRIPTIONS;

    const index = store.subscriptions.findIndex(s => Number(s.id) === targetId);
    if (index === -1) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    store.subscriptions.splice(index, 1);
    mockStore.writeStore(store);

    res.json({ success: true, message: 'Subscription deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete subscription.' });
  }
});

// POST /api/subscriptions/:id/pay -> Automatically log as expense transaction!
router.post('/:id/pay', async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const store = mockStore.readStore();
    if (!store.subscriptions) store.subscriptions = DEFAULT_SUBSCRIPTIONS;

    const sub = store.subscriptions.find(s => Number(s.id) === targetId);
    if (!sub) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    // Format current date as DD-MM-YYYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateFormatted = `${day}-${month}-${year}`;

    // Add transaction to Google Sheets / Store
    const newTxData = {
      date: dateFormatted,
      description: `Bill Payment: ${sub.name}`,
      category: sub.category,
      subcategory: 'Subscriptions',
      amount: sub.amount,
      paymentMethod: sub.paymentMethod,
      notes: `Recurring payment for ${sub.name} (${sub.notes || 'Fixed Bill'})`
    };

    await addTransaction(newTxData);

    // Update lastPaidDate in subscription record
    sub.lastPaidDate = dateFormatted;
    mockStore.writeStore(store);

    res.json({
      success: true,
      message: `Logged ₹${sub.amount} expense for "${sub.name}" on ${dateFormatted}!`,
      transaction: newTxData
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to record bill payment.' });
  }
});

module.exports = router;
