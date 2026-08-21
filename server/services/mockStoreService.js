const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../data/store.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data
const initialData = {
  transactions: [
    {
      id: 1,
      rowNumber: 2,
      date: '21-08-2026',
      description: 'Dinner with friends',
      category: 'Food',
      amount: 500,
      paymentMethod: 'UPI',
      notes: 'Birthday dinner'
    },
    {
      id: 2,
      rowNumber: 3,
      date: '20-08-2026',
      description: 'Petrol for bike',
      category: 'Travel',
      amount: 1000,
      paymentMethod: 'UPI',
      notes: 'Bike fuel'
    },
    {
      id: 3,
      rowNumber: 4,
      date: '15-08-2026',
      description: 'Grocery shopping',
      category: 'Food',
      amount: 2200,
      paymentMethod: 'Debit Card',
      notes: 'Monthly hostel snacks'
    },
    {
      id: 4,
      rowNumber: 5,
      date: '10-08-2026',
      description: 'Movie ticket',
      category: 'Entertainment',
      amount: 400,
      paymentMethod: 'UPI',
      notes: 'Weekend movie'
    }
  ],
  earnings: [
    {
      id: 1,
      rowNumber: 2,
      date: '20-08-2026',
      description: 'Freelance project',
      source: 'Freelancing',
      amount: 5000,
      notes: 'Website build for client'
    },
    {
      id: 2,
      rowNumber: 3,
      date: '18-08-2026',
      description: 'Pocket money from parents',
      source: 'Pocket Money',
      amount: 8000,
      notes: 'Monthly allowance'
    },
    {
      id: 3,
      rowNumber: 4,
      date: '12-08-2026',
      description: 'Navratri pass profit',
      source: 'Navratri',
      amount: 5000,
      notes: 'Pass resale profit'
    },
    {
      id: 4,
      rowNumber: 5,
      date: '05-08-2026',
      description: 'Birthday gift',
      source: 'Gift',
      amount: 7000,
      notes: 'Gift from family'
    }
  ],
  lists: {
    categories: [
      'Food',
      'Travel',
      'Shopping',
      'Entertainment',
      'Education',
      'Bills',
      'Personal',
      'Other'
    ],
    sources: [
      'Pocket Money',
      'Gift',
      'Freelancing',
      'Business',
      'Navratri',
      'Scholarship',
      'Refund',
      'Other'
    ],
    paymentMethods: [
      'Cash',
      'UPI',
      'Debit Card',
      'Credit Card',
      'Bank Transfer',
      'Other'
    ]
  }
};

function readStore() {
  if (!fs.existsSync(STORE_PATH)) {
    writeStore(initialData);
    return initialData;
  }
  try {
    const data = fs.readFileSync(STORE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    writeStore(initialData);
    return initialData;
  }
}

function writeStore(data) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readStore,
  writeStore
};
