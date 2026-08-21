const { getGoogleSheetsClient } = require('../config/googleSheets');

async function customizeGoogleSheet() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Connecting to Google Sheet:', spreadsheetId);

  try {
    // 1. Get Spreadsheet metadata to get sheet IDs
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetsList = meta.data.sheets;
    
    let txSheetId = 0;
    let earnSheetId = 0;
    let listsSheetId = 0;

    sheetsList.forEach(s => {
      const name = s.properties.title;
      if (name === 'TRANSACTIONS') txSheetId = s.properties.sheetId;
      if (name === 'EARNINGS') earnSheetId = s.properties.sheetId;
      if (name === 'LISTS') listsSheetId = s.properties.sheetId;
    });

    console.log(`Sheet IDs - TRANSACTIONS: ${txSheetId}, EARNINGS: ${earnSheetId}, LISTS: ${listsSheetId}`);

    const requests = [
      // Format Currency Column D in TRANSACTIONS (Row 2 to 1000)
      {
        repeatCell: {
          range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
              textFormat: { bold: true, foregroundColor: { red: 0.9, green: 0.2, blue: 0.3 } }
            }
          },
          fields: 'userEnteredFormat(numberFormat,textFormat)'
        }
      },
      // Format Currency Column D in EARNINGS (Row 2 to 1000)
      {
        repeatCell: {
          range: { sheetId: earnSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
              textFormat: { bold: true, foregroundColor: { red: 0.05, green: 0.6, blue: 0.4 } }
            }
          },
          fields: 'userEnteredFormat(numberFormat,textFormat)'
        }
      },
      // Format Date Column A in TRANSACTIONS (dd-mm-yyyy)
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
      // Format Date Column A in EARNINGS (dd-mm-yyyy)
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
      },
      // Data Validation: Category Dropdown in TRANSACTIONS (Column C) pulling from LISTS!A2:A
      {
        setDataValidation: {
          range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 2, endColumnIndex: 3 },
          rule: {
            condition: {
              type: 'ONE_OF_RANGE',
              values: [{ userEnteredValue: '=LISTS!A2:A' }]
            },
            showCustomUi: true,
            strict: false
          }
        }
      },
      // Data Validation: Payment Method Dropdown in TRANSACTIONS (Column E) pulling from LISTS!C2:C
      {
        setDataValidation: {
          range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 4, endColumnIndex: 5 },
          rule: {
            condition: {
              type: 'ONE_OF_RANGE',
              values: [{ userEnteredValue: '=LISTS!C2:C' }]
            },
            showCustomUi: true,
            strict: false
          }
        }
      },
      // Data Validation: Earning Source Dropdown in EARNINGS (Column C) pulling from LISTS!B2:B
      {
        setDataValidation: {
          range: { sheetId: earnSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 2, endColumnIndex: 3 },
          rule: {
            condition: {
              type: 'ONE_OF_RANGE',
              values: [{ userEnteredValue: '=LISTS!B2:B' }]
            },
            showCustomUi: true,
            strict: false
          }
        }
      }
    ];

    console.log('Applying batchUpdate data visualization rules...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('✅ Google Sheets Data Visualization & Formatting successfully applied!');
  } catch (error) {
    console.error('Error applying batchUpdate to Google Sheet:', error.message);
  }
}

customizeGoogleSheet();
