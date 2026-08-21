const { getGoogleSheetsClient } = require('../config/googleSheets');

async function formatSheetDataOnly() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Applying data formatting ONLY (no background/color changes) for:', spreadsheetId);

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

    const requests = [
      // 1. Format TRANSACTIONS Column D (Amount) as Indian Rupee ₹#,##0
      {
        repeatCell: {
          range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
              horizontalAlignment: 'RIGHT'
            }
          },
          fields: 'userEnteredFormat(numberFormat,horizontalAlignment)'
        }
      },
      // 2. Format EARNINGS Column D (Amount) as Indian Rupee ₹#,##0
      {
        repeatCell: {
          range: { sheetId: earnSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
              horizontalAlignment: 'RIGHT'
            }
          },
          fields: 'userEnteredFormat(numberFormat,horizontalAlignment)'
        }
      },
      // 3. Format TRANSACTIONS Column A (Date) as DD-MM-YYYY
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
      // 4. Format EARNINGS Column A (Date) as DD-MM-YYYY
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

    console.log('Sending batchUpdate for data formatting only...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 CELL DATA FORMATTING (₹ AND DD-MM-YYYY) SUCCESSFULLY APPLIED!');
  } catch (error) {
    console.error('Error applying data formatting:', error.message);
  }
}

formatSheetDataOnly();
