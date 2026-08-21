const { getGoogleSheetsClient } = require('../config/googleSheets');
const { formatDate } = require('../utils/formatters');

async function fixGoogleSheetDates() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Fixing date column values and formatting in Google Sheet:', spreadsheetId);

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

    // 1. Fetch current TRANSACTIONS rows
    const txRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'TRANSACTIONS!A2:F'
    });
    const txRows = txRes.data.values || [];

    // Convert any serial numbers in Column A to clean DD-MM-YYYY strings
    const fixedTxRows = txRows.map(row => {
      const dateVal = row[0];
      const fixedDate = formatDate(dateVal);
      row[0] = fixedDate;
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

    // 2. Fetch current EARNINGS rows
    const earnRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EARNINGS!A2:E'
    });
    const earnRows = earnRes.data.values || [];

    const fixedEarnRows = earnRows.map(row => {
      const dateVal = row[0];
      const fixedDate = formatDate(dateVal);
      row[0] = fixedDate;
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

    // 3. Explicitly format Column A (Date) in TRANSACTIONS and EARNINGS as Plain Text / DATE
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

    console.log('🎉 GOOGLE SHEET DATES SUCCESSFULLY FIXED TO DD-MM-YYYY!');
  } catch (error) {
    console.error('Error fixing Google Sheet dates:', error.message);
  }
}

fixGoogleSheetDates();
