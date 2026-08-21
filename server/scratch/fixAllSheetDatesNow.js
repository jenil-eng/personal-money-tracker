const { getGoogleSheetsClient } = require('../config/googleSheets');
const { formatDate } = require('../utils/formatters');

async function fixAllSheetDatesNow() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Fixing all date rows in Google Sheet:', spreadsheetId);

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetsList = meta.data.sheets;

    let txSheetId = 0;
    let earnSheetId = 0;

    sheetsList.forEach(s => {
      const name = s.properties.title;
      if (name === 'TRANSACTIONS') txSheetId = s.properties.sheetId;
      if (name === 'EARNINGS') earnSheetId = s.properties.sheetId;
    });

    // 1. Clean TRANSACTIONS rows
    const txRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'TRANSACTIONS!A2:F'
    });
    const txRows = txRes.data.values || [];

    const fixedTxRows = txRows.map(row => {
      row[0] = "'" + formatDate(row[0]);
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

    // 2. Clean EARNINGS rows
    const earnRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EARNINGS!A2:E'
    });
    const earnRows = earnRes.data.values || [];

    const fixedEarnRows = earnRows.map(row => {
      row[0] = "'" + formatDate(row[0]);
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

    // 3. Force Column A format in TRANSACTIONS & EARNINGS to Date pattern dd-mm-yyyy
    const requests = [
      {
        repeatCell: {
          range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 1 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'DATE', pattern: 'dd-mm-yyyy' },
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat(numberFormat,horizontalAlignment)'
        }
      },
      {
        repeatCell: {
          range: { sheetId: earnSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 1 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'DATE', pattern: 'dd-mm-yyyy' },
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat(numberFormat,horizontalAlignment)'
        }
      }
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 ALL GOOGLE SHEET DATES FIXED TO 21-08-2026!');
  } catch (error) {
    console.error('Error fixing dates:', error.message);
  }
}

fixAllSheetDatesNow();
