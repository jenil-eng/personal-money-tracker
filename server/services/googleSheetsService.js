const { getGoogleSheetsClient } = require('../config/googleSheets');
const mockStore = require('./mockStoreService');
const { formatDate, parseAmount } = require('../utils/formatters');

// Helper to determine if Google Sheets API is configured and operational
function isSheetsConfigured() {
  const client = getGoogleSheetsClient();
  return client !== null;
}

// ----------------------------------------------------
// TRANSACTIONS
// ----------------------------------------------------

async function readTransactions() {
  const client = getGoogleSheetsClient();
  if (!client) {
    const store = mockStore.readStore();
    return store.transactions;
  }

  const { sheets, spreadsheetId } = client;
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'TRANSACTIONS!A2:G',
      valueRenderOption: 'FORMATTED_VALUE'
    });

    const rows = response.data.values || [];
    const knownPMs = ['cash', 'upi', 'debit card', 'credit card', 'bank transfer', 'other', '-'];

    return rows.map((row, index) => {
      const date = formatDate(row[0] || '');
      const description = row[1] || '';
      const category = row[2] || '';

      const val3 = row[3] !== undefined ? row[3] : '';
      const val4 = row[4] !== undefined ? row[4] : '';
      const val5 = row[5] !== undefined ? row[5] : '';
      const val6 = row[6] !== undefined ? row[6] : '';

      const num3 = parseAmount(val3);
      const num4 = parseAmount(val4);

      let subcategory = '';
      let amount = 0;
      let paymentMethod = '';
      let notes = '';

      if (num4 > 0 || knownPMs.includes(String(val5).toLowerCase().trim())) {
        subcategory = String(val3);
        amount = num4 > 0 ? num4 : num3;
        paymentMethod = String(val5);
        notes = String(val6);
      } else if (num3 > 0 || knownPMs.includes(String(val4).toLowerCase().trim())) {
        amount = num3;
        paymentMethod = String(val4);
        notes = String(val5);
        subcategory = String(val6);
      } else {
        amount = num4 || num3 || 0;
        subcategory = String(val3);
        paymentMethod = String(val5 || val4);
        notes = String(val6);
      }

      return {
        id: index + 2,
        rowNumber: index + 2,
        date,
        description,
        category,
        subcategory,
        amount,
        paymentMethod,
        notes
      };
    });
  } catch (error) {
    console.warn('Google Sheets API unavailable, using local store fallback:', error.message);
    const store = mockStore.readStore();
    return store.transactions;
  }
}

async function addTransaction(data) {
  const { date, description, category, subcategory = '', amount, paymentMethod, notes = '' } = data;
  const client = getGoogleSheetsClient();

  const formattedDate = formatDate(date);
  const numericAmount = Number(amount);

  const finalNotes = notes && notes.trim() !== '' ? notes.trim() : '-';
  const finalPaymentMethod = paymentMethod && paymentMethod.trim() !== '' ? paymentMethod.trim() : '-';
  const finalSubcategory = subcategory && subcategory.trim() !== '' ? subcategory.trim() : '';

  if (client) {
    const { sheets, spreadsheetId } = client;
    try {
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'TRANSACTIONS!A:G',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [["'" + formattedDate, description, category, finalSubcategory, numericAmount, finalPaymentMethod, finalNotes]]
        }
      });

      const updatedRange = appendResponse.data.updates?.updatedRange || '';
      const match = updatedRange.match(/TRANSACTIONS!A(\d+):G\1/);
      const rowNumber = match ? parseInt(match[1], 10) : undefined;

      return {
        date: formattedDate,
        description,
        category,
        subcategory: finalSubcategory,
        amount: numericAmount,
        paymentMethod,
        notes,
        rowNumber
      };
    } catch (error) {
      console.warn('Google Sheets append failed, saving to local store fallback:', error.message);
    }
  }

  // Fallback to local store
  const store = mockStore.readStore();
  const newId = store.transactions.length > 0 ? Math.max(...store.transactions.map(t => t.id)) + 1 : 1;
  const newRowNumber = store.transactions.length > 0 ? Math.max(...store.transactions.map(t => t.rowNumber)) + 1 : 2;

  const newTransaction = {
    id: newId,
    rowNumber: newRowNumber,
    date: formattedDate,
    description,
    category,
    subcategory: finalSubcategory,
    amount: numericAmount,
    paymentMethod,
    notes
  };

  store.transactions.push(newTransaction);
  mockStore.writeStore(store);
  return newTransaction;
}

// Helper function to find record by ID first, then rowNumber
function findRecordIndex(list, targetId) {
  let idx = list.findIndex(item => item.id === targetId);
  if (idx === -1) {
    idx = list.findIndex(item => item.rowNumber === targetId);
  }
  return idx;
}

function findRecord(list, targetId) {
  const idx = findRecordIndex(list, targetId);
  return idx !== -1 ? list[idx] : null;
}

async function updateTransaction(id, data) {
  const { date, description, category, subcategory = '', amount, paymentMethod, notes = '' } = data;
  const client = getGoogleSheetsClient();

  const formattedDate = formatDate(date);
  const numericAmount = Number(amount);
  const targetId = parseInt(id, 10);

  const finalNotes = notes && notes.trim() !== '' ? notes.trim() : '-';
  const finalPaymentMethod = paymentMethod && paymentMethod.trim() !== '' ? paymentMethod.trim() : '-';
  const finalSubcategory = subcategory && subcategory.trim() !== '' ? subcategory.trim() : '';

  if (client) {
    const { sheets, spreadsheetId } = client;
    try {
      const currentList = await readTransactions();
      const target = findRecord(currentList, targetId);

      if (target) {
        const rowNum = target.rowNumber;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `TRANSACTIONS!A${rowNum}:G${rowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [["'" + formattedDate, description, category, finalSubcategory, numericAmount, finalPaymentMethod, finalNotes]]
          }
        });

        return {
          id: target.id,
          rowNumber: rowNum,
          date: formattedDate,
          description,
          category,
          subcategory: finalSubcategory,
          amount: numericAmount,
          paymentMethod,
          notes
        };
      }
    } catch (error) {
      console.warn('Google Sheets update failed, updating local store fallback:', error.message);
    }
  }

  // Fallback
  const store = mockStore.readStore();
  const index = findRecordIndex(store.transactions, targetId);
  if (index === -1) {
    throw new Error('Transaction not found.');
  }

  store.transactions[index] = {
    ...store.transactions[index],
    date: formattedDate,
    description,
    category,
    subcategory: finalSubcategory,
    amount: numericAmount,
    paymentMethod,
    notes
  };

  mockStore.writeStore(store);
  return store.transactions[index];
}

async function deleteTransaction(id) {
  const client = getGoogleSheetsClient();
  const targetId = parseInt(id, 10);

  if (client) {
    const { sheets, spreadsheetId } = client;
    try {
      const currentList = await readTransactions();
      const target = findRecord(currentList, targetId);

      if (target) {
        const rowNum = target.rowNumber;
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `TRANSACTIONS!A${rowNum}:F${rowNum}`
        });

        return { success: true };
      }
    } catch (error) {
      console.warn('Google Sheets delete failed, clearing from local store fallback:', error.message);
    }
  }

  // Fallback
  const store = mockStore.readStore();
  const index = findRecordIndex(store.transactions, targetId);
  if (index === -1) {
    throw new Error('Transaction not found.');
  }

  store.transactions.splice(index, 1);
  mockStore.writeStore(store);
  return { success: true };
}

// ----------------------------------------------------
// EARNINGS
// ----------------------------------------------------

async function readEarnings() {
  const client = getGoogleSheetsClient();
  if (!client) {
    const store = mockStore.readStore();
    return store.earnings;
  }

  const { sheets, spreadsheetId } = client;
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EARNINGS!A2:E',
      valueRenderOption: 'FORMATTED_VALUE'
    });

    const rows = response.data.values || [];
    return rows.map((row, index) => ({
      id: index + 2,
      rowNumber: index + 2,
      date: formatDate(row[0] || ''),
      description: row[1] || '',
      source: row[2] || '',
      amount: parseAmount(row[3]),
      notes: row[4] || ''
    }));
  } catch (error) {
    console.warn('Google Sheets API unavailable, reading earnings from local store:', error.message);
    const store = mockStore.readStore();
    return store.earnings;
  }
}

async function addEarning(data) {
  const { date, description, source, amount, notes = '' } = data;
  const client = getGoogleSheetsClient();

  const formattedDate = formatDate(date);
  const numericAmount = Number(amount);

  const finalNotes = notes && notes.trim() !== '' ? notes.trim() : '-';

  if (client) {
    const { sheets, spreadsheetId } = client;
    try {
      const appendResponse = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'EARNINGS!A:E',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [["'" + formattedDate, description, source, numericAmount, finalNotes]]
        }
      });

      const updatedRange = appendResponse.data.updates?.updatedRange || '';
      const match = updatedRange.match(/EARNINGS!A(\d+):E\1/);
      const rowNumber = match ? parseInt(match[1], 10) : undefined;

      return {
        date: formattedDate,
        description,
        source,
        amount: numericAmount,
        notes,
        rowNumber
      };
    } catch (error) {
      console.warn('Google Sheets add earning failed, saving to local store fallback:', error.message);
    }
  }

  // Fallback
  const store = mockStore.readStore();
  const newId = store.earnings.length > 0 ? Math.max(...store.earnings.map(e => e.id)) + 1 : 1;
  const newRowNumber = store.earnings.length > 0 ? Math.max(...store.earnings.map(e => e.rowNumber)) + 1 : 2;

  const newEarning = {
    id: newId,
    rowNumber: newRowNumber,
    date: formattedDate,
    description,
    source,
    amount: numericAmount,
    notes
  };

  store.earnings.push(newEarning);
  mockStore.writeStore(store);
  return newEarning;
}

async function updateEarning(id, data) {
  const { date, description, source, amount, notes = '' } = data;
  const client = getGoogleSheetsClient();

  const formattedDate = formatDate(date);
  const numericAmount = Number(amount);
  const targetId = parseInt(id, 10);

  const finalNotes = notes && notes.trim() !== '' ? notes.trim() : '-';

  if (client) {
    const { sheets, spreadsheetId } = client;
    try {
      const currentList = await readEarnings();
      const target = findRecord(currentList, targetId);

      if (target) {
        const rowNum = target.rowNumber;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `EARNINGS!A${rowNum}:E${rowNum}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [["'" + formattedDate, description, source, numericAmount, finalNotes]]
          }
        });

        return {
          id: target.id,
          rowNumber: rowNum,
          date: formattedDate,
          description,
          source,
          amount: numericAmount,
          notes
        };
      }
    } catch (error) {
      console.warn('Google Sheets update earning failed, updating local store fallback:', error.message);
    }
  }

  // Fallback
  const store = mockStore.readStore();
  const index = findRecordIndex(store.earnings, targetId);
  if (index === -1) {
    throw new Error('Earning record not found.');
  }

  store.earnings[index] = {
    ...store.earnings[index],
    date: formattedDate,
    description,
    source,
    amount: numericAmount,
    notes
  };

  mockStore.writeStore(store);
  return store.earnings[index];
}

async function deleteEarning(id) {
  const client = getGoogleSheetsClient();
  const targetId = parseInt(id, 10);

  if (client) {
    const { sheets, spreadsheetId } = client;
    try {
      const currentList = await readEarnings();
      const target = findRecord(currentList, targetId);

      if (target) {
        const rowNum = target.rowNumber;
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `EARNINGS!A${rowNum}:E${rowNum}`
        });

        return { success: true };
      }
    } catch (error) {
      console.warn('Google Sheets delete earning failed, clearing local store fallback:', error.message);
    }
  }

  // Fallback
  const store = mockStore.readStore();
  const index = findRecordIndex(store.earnings, targetId);
  if (index === -1) {
    throw new Error('Earning record not found.');
  }

  store.earnings.splice(index, 1);
  mockStore.writeStore(store);
  return { success: true };
}

// ----------------------------------------------------
// SETTINGS / LISTS
// ----------------------------------------------------

async function readLists() {
  const client = getGoogleSheetsClient();
  if (!client) {
    const store = mockStore.readStore();
    return store.lists;
  }

  const { sheets, spreadsheetId } = client;
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'LISTS!A2:D'
    });

    const rows = response.data.values || [];

    const categories = new Set();
    const sources = new Set();
    const paymentMethods = new Set();
    const subcategories = new Set();

    rows.forEach(row => {
      if (row[0] && row[0].trim()) categories.add(row[0].trim());
      if (row[1] && row[1].trim()) sources.add(row[1].trim());
      if (row[2] && row[2].trim()) paymentMethods.add(row[2].trim());
      if (row[3] && row[3].trim()) subcategories.add(row[3].trim());
    });

    const store = mockStore.readStore();

    return {
      categories: categories.size > 0 ? Array.from(categories) : store.lists.categories,
      sources: sources.size > 0 ? Array.from(sources) : store.lists.sources,
      paymentMethods: paymentMethods.size > 0 ? Array.from(paymentMethods) : store.lists.paymentMethods,
      subcategories: subcategories.size > 0 ? Array.from(subcategories) : (store.lists.subcategories || [])
    };
  } catch (error) {
    console.warn('Google Sheets read lists failed, returning local store lists:', error.message);
    const store = mockStore.readStore();
    return store.lists;
  }
}

async function addCategory(categoryName) {
  const lists = await readLists();
  if (lists.categories.includes(categoryName)) {
    throw new Error('Category already exists.');
  }
  lists.categories.push(categoryName);
  await saveLists(lists);
  return lists;
}

async function deleteCategory(categoryName) {
  const store = mockStore.readStore();
  const isUsedInTx = store.transactions.some(t => t.category === categoryName);
  if (isUsedInTx) {
    throw new Error(`Cannot delete category "${categoryName}" because it is currently used by existing transactions.`);
  }

  const lists = await readLists();
  lists.categories = lists.categories.filter(c => c !== categoryName);
  await saveLists(lists);
  return lists;
}

async function addSource(sourceName) {
  const lists = await readLists();
  if (lists.sources.includes(sourceName)) {
    throw new Error('Earning source already exists.');
  }
  lists.sources.push(sourceName);
  await saveLists(lists);
  return lists;
}

async function deleteSource(sourceName) {
  const store = mockStore.readStore();
  const isUsedInEarn = store.earnings.some(e => e.source === sourceName);
  if (isUsedInEarn) {
    throw new Error(`Cannot delete source "${sourceName}" because it is currently used by existing earnings.`);
  }

  const lists = await readLists();
  lists.sources = lists.sources.filter(s => s !== sourceName);
  await saveLists(lists);
  return lists;
}

async function addPaymentMethod(methodName) {
  const lists = await readLists();
  if (lists.paymentMethods.includes(methodName)) {
    throw new Error('Payment method already exists.');
  }
  lists.paymentMethods.push(methodName);
  await saveLists(lists);
  return lists;
}

async function deletePaymentMethod(methodName) {
  const store = mockStore.readStore();
  const isUsedInTx = store.transactions.some(t => t.paymentMethod === methodName);
  if (isUsedInTx) {
    throw new Error(`Cannot delete payment method "${methodName}" because it is currently used by existing transactions.`);
  }

  const lists = await readLists();
  lists.paymentMethods = lists.paymentMethods.filter(p => p !== methodName);
  await saveLists(lists);
  return lists;
}

async function saveLists(lists) {
  const client = getGoogleSheetsClient();

  // Always keep mock store updated
  const store = mockStore.readStore();
  store.lists = lists;
  mockStore.writeStore(store);

  if (client) {
    const { sheets, spreadsheetId } = client;
    const maxLen = Math.max(lists.categories.length, lists.sources.length, lists.paymentMethods.length);
    const rows = [];

    for (let i = 0; i < maxLen; i++) {
      rows.push([
        lists.categories[i] || '',
        lists.sources[i] || '',
        lists.paymentMethods[i] || ''
      ]);
    }

    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'LISTS!A2:C'
      });

      if (rows.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'LISTS!A2:C',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: rows }
        });
      }
    } catch (error) {
      console.warn('Google Sheets save lists failed, saved locally:', error.message);
    }
  }
}

module.exports = {
  isSheetsConfigured,
  readTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  readEarnings,
  addEarning,
  updateEarning,
  deleteEarning,
  readLists,
  addCategory,
  deleteCategory,
  addSource,
  deleteSource,
  addPaymentMethod,
  deletePaymentMethod,
  updateLists: saveLists
};

