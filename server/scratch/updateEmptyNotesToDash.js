const { getGoogleSheetsClient } = require('../config/googleSheets');

async function updateEmptyNotesToDash() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Updating empty notes/payment method cells to dash "-" in Google Sheet:', spreadsheetId);

  try {
    // 1. TRANSACTIONS notes (Column F)
    const txRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'TRANSACTIONS!A2:F'
    });
    const txRows = txRes.data.values || [];

    const fixedTxRows = txRows.map(row => {
      if (!row[4] || row[4].trim() === '') row[4] = '-'; // Payment Method
      if (!row[5] || row[5].trim() === '') row[5] = '-'; // Notes
      return row;
    });

    if (fixedTxRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `TRANSACTIONS!A2:F${fixedTxRows.length + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: fixedTxRows }
      });
    }

    // 2. EARNINGS notes (Column E)
    const earnRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EARNINGS!A2:E'
    });
    const earnRows = earnRes.data.values || [];

    const fixedEarnRows = earnRows.map(row => {
      if (!row[4] || row[4].trim() === '') row[4] = '-'; // Notes
      return row;
    });

    if (fixedEarnRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `EARNINGS!A2:E${fixedEarnRows.length + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: fixedEarnRows }
      });
    }

    console.log('🎉 ALL EMPTY NOTES AND PAYMENT METHOD CELLS UPDATED TO DASH "-"!');
  } catch (error) {
    console.error('Error updating empty notes:', error.message);
  }
}

updateEmptyNotesToDash();
