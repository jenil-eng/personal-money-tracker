const { getGoogleSheetsClient } = require('../config/googleSheets');
const mockStore = require('../services/mockStoreService');

async function makeFreshSheet() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Clearing old test data and creating a fresh sheet for:', spreadsheetId);

  try {
    // 1. Clear data rows in TRANSACTIONS (A2:Z1000)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'TRANSACTIONS!A2:Z1000'
    });

    // 2. Clear data rows in EARNINGS (A2:Z1000)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'EARNINGS!A2:Z1000'
    });

    // 3. Clear data rows in LISTS (A2:Z1000)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'LISTS!A2:Z1000'
    });

    // 4. Populate clean default options in LISTS
    const defaultCategories = [
      ['Food'], ['Travel'], ['Shopping'], ['Entertainment'],
      ['Education'], ['Bills'], ['Personal'], ['Other']
    ];
    const defaultSources = [
      ['Pocket Money'], ['Gift'], ['Freelancing'], ['Business'],
      ['Navratri'], ['Scholarship'], ['Refund'], ['Other']
    ];
    const defaultPaymentMethods = [
      ['Cash'], ['UPI'], ['Debit Card'], ['Credit Card'],
      ['Bank Transfer'], ['Other']
    ];

    const maxLen = Math.max(defaultCategories.length, defaultSources.length, defaultPaymentMethods.length);
    const listsRows = [];

    for (let i = 0; i < maxLen; i++) {
      listsRows.push([
        defaultCategories[i] ? defaultCategories[i][0] : '',
        defaultSources[i] ? defaultSources[i][0] : '',
        defaultPaymentMethods[i] ? defaultPaymentMethods[i][0] : ''
      ]);
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'LISTS!A2:C' + (maxLen + 1),
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: listsRows }
    });

    // 5. Also reset local JSON store to fresh state
    mockStore.writeStore({
      transactions: [],
      earnings: [],
      lists: {
        categories: ['Food', 'Travel', 'Shopping', 'Entertainment', 'Education', 'Bills', 'Personal', 'Other'],
        sources: ['Pocket Money', 'Gift', 'Freelancing', 'Business', 'Navratri', 'Scholarship', 'Refund', 'Other'],
        paymentMethods: ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Other']
      }
    });

    console.log('🎉 GOOGLE SHEET AND WEB APP SUCCESSFULLY RESET TO 100% FRESH SHEET!');
  } catch (error) {
    console.error('Error resetting fresh sheet:', error.message);
  }
}

makeFreshSheet();
