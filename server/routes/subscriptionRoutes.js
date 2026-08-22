const express = require('express');
const router = express.Router();
const mockStore = require('../services/mockStoreService');
const { getGoogleSheetsClient } = require('../config/googleSheets');
const { addTransaction } = require('../services/googleSheetsService');
const { authenticateToken } = require('../middleware/auth');
const { parseAmount } = require('../utils/formatters');

// Initial seed subscriptions
const DEFAULT_SUBSCRIPTIONS = [
  {
    id: 2,
    rowNumber: 2,
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
    id: 3,
    rowNumber: 3,
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
    id: 4,
    rowNumber: 4,
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
    id: 5,
    rowNumber: 5,
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

// Helper: Read Subscriptions from Google Sheets or Fallback
async function readSubscriptions() {
  const client = getGoogleSheetsClient();
  if (!client) {
    const store = mockStore.readStore();
    if (!store.subscriptions) {
      store.subscriptions = DEFAULT_SUBSCRIPTIONS;
      mockStore.writeStore(store);
    }
    return store.subscriptions;
  }

  const { sheets, spreadsheetId } = client;
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'SUBSCRIPTIONS!A2:H',
      valueRenderOption: 'FORMATTED_VALUE'
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      const store = mockStore.readStore();
      return store.subscriptions || DEFAULT_SUBSCRIPTIONS;
    }

    return rows.map((row, index) => ({
      id: index + 2,
      rowNumber: index + 2,
      name: row[0] || '',
      category: row[1] || 'Bills',
      amount: parseAmount(row[2]),
      billingCycle: row[3] || 'monthly',
      dueDay: Number(row[4]) || 1,
      paymentMethod: row[5] || 'UPI',
      notes: row[6] || '',
      status: row[7] || 'active'
    }));
  } catch (error) {
    console.warn('Google Sheets SUBSCRIPTIONS read error, using store fallback:', error.message);
    const store = mockStore.readStore();
    return store.subscriptions || DEFAULT_SUBSCRIPTIONS;
  }
}

// All routes require JWT Authentication middleware
router.use(authenticateToken);

// GET /api/subscriptions
router.get('/', async (req, res) => {
  try {
    const subs = await readSubscriptions();
    res.json(Array.isArray(subs) && subs.length > 0 ? subs : DEFAULT_SUBSCRIPTIONS);
  } catch (err) {
    console.error('Subscription GET error:', err);
    res.json(DEFAULT_SUBSCRIPTIONS);
  }
});

// POST /api/subscriptions
router.post('/', async (req, res) => {
  try {
    const { name, category, amount, billingCycle, dueDay, paymentMethod, notes } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ message: 'Subscription name and amount are required.' });
    }

    const client = getGoogleSheetsClient();
    if (client) {
      const { sheets, spreadsheetId } = client;
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'SUBSCRIPTIONS!A2:H',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[name.trim(), category || 'Bills', Number(amount) || 0, billingCycle || 'monthly', Number(dueDay) || 1, paymentMethod || 'UPI', notes || '', 'active']]
          }
        });
      } catch (sheetsErr) {
        console.warn('Google Sheets subscription append warning:', sheetsErr.message);
      }
    }

    // Update local store
    const store = mockStore.readStore();
    if (!store.subscriptions) store.subscriptions = DEFAULT_SUBSCRIPTIONS;
    const newSub = {
      id: Date.now(),
      rowNumber: store.subscriptions.length + 2,
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
router.put('/:id', async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const store = mockStore.readStore();
    if (!store.subscriptions) store.subscriptions = DEFAULT_SUBSCRIPTIONS;

    const index = store.subscriptions.findIndex(s => Number(s.id) === targetId || Number(s.rowNumber) === targetId);
    if (index === -1) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    const { name, category, amount, billingCycle, dueDay, paymentMethod, status, notes } = req.body;
    const updatedSub = {
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

    store.subscriptions[index] = updatedSub;
    mockStore.writeStore(store);

    // Update Google Sheets row if targetId corresponds to a rowNumber
    const client = getGoogleSheetsClient();
    if (client) {
      const { sheets, spreadsheetId } = client;
      const rowNum = updatedSub.rowNumber || targetId;
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `SUBSCRIPTIONS!A${rowNum}:H${rowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[updatedSub.name, updatedSub.category, updatedSub.amount, updatedSub.billingCycle, updatedSub.dueDay, updatedSub.paymentMethod, updatedSub.notes, updatedSub.status]]
          }
        });
      } catch (sheetsErr) {
        console.warn('Google Sheets subscription update warning:', sheetsErr.message);
      }
    }

    res.json(updatedSub);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update subscription.' });
  }
});

// DELETE /api/subscriptions/:id
router.delete('/:id', async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const store = mockStore.readStore();
    if (!store.subscriptions) store.subscriptions = DEFAULT_SUBSCRIPTIONS;

    const index = store.subscriptions.findIndex(s => Number(s.id) === targetId || Number(s.rowNumber) === targetId);
    if (index !== -1) {
      store.subscriptions.splice(index, 1);
      mockStore.writeStore(store);
    }

    const client = getGoogleSheetsClient();
    if (client) {
      const { sheets, spreadsheetId } = client;
      try {
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `SUBSCRIPTIONS!A${targetId}:H${targetId}`
        });
      } catch (sheetsErr) {
        console.warn('Google Sheets subscription clear warning:', sheetsErr.message);
      }
    }

    res.json({ success: true, message: 'Subscription deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete subscription.' });
  }
});

// POST /api/subscriptions/:id/pay -> Automatically log as expense transaction!
router.post('/:id/pay', async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const subs = await readSubscriptions();
    const sub = subs.find(s => Number(s.id) === targetId || Number(s.rowNumber) === targetId);

    if (!sub) {
      return res.status(404).json({ message: 'Subscription not found.' });
    }

    // Format current date as DD-MM-YYYY
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateFormatted = `${day}-${month}-${year}`;

    // Add transaction to Google Sheets & Store
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
    const store = mockStore.readStore();
    if (store.subscriptions) {
      const sIndex = store.subscriptions.findIndex(s => Number(s.id) === targetId || Number(s.rowNumber) === targetId);
      if (sIndex !== -1) {
        store.subscriptions[sIndex].lastPaidDate = dateFormatted;
        mockStore.writeStore(store);
      }
    }

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
