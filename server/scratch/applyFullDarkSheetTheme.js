const { getGoogleSheetsClient } = require('../config/googleSheets');

async function applyFullDarkSheetTheme() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Transforming Google Sheet headers & theme for:', spreadsheetId);

  try {
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

    const color = (r, g, b) => ({ red: r / 255, green: g / 255, blue: b / 255 });

    const DARK_ONYX = color(11, 15, 25);     // #0b0f19
    const DARK_ROW_1 = color(15, 23, 42);    // #0f172a
    const DARK_ROW_2 = color(30, 41, 59);    // #1e293b
    const BORDER_SLATE = color(51, 65, 85);  // #334155
    const WHITE_TEXT = color(255, 255, 255);
    const OFF_WHITE = color(248, 250, 252);
    
    const ROSE_HEADER = color(225, 29, 72);   // #e11d48
    const EMERALD_HEADER = color(5, 150, 105); // #059669
    const INDIGO_HEADER = color(79, 70, 229);  // #4f46e5

    const ROSE_TEXT = color(244, 63, 94);     // #f43f5e
    const EMERALD_TEXT = color(16, 185, 129); // #10b981
    const VIOLET_TEXT = color(167, 139, 250); // #a78bfa

    const requests = [];

    const setupSheetTheme = (sheetId, headerBg, amountColor, columnsCount) => {
      // 1. Set canvas to DARK ONYX background
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 10 },
          cell: {
            userEnteredFormat: {
              backgroundColor: DARK_ONYX,
              textFormat: { fontFamily: 'Inter', fontSize: 10, foregroundColor: OFF_WHITE }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      });

      // 2. Table Headers (Row 1 - Row 1 is header row)
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columnsCount },
          cell: {
            userEnteredFormat: {
              backgroundColor: headerBg,
              textFormat: { fontFamily: 'Inter', fontSize: 11, bold: true, foregroundColor: WHITE_TEXT },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      });

      // 3. Alternating Dark Glass Data Rows (Row 2 to 100)
      for (let r = 1; r < 100; r++) {
        const bg = (r % 2 === 0) ? DARK_ROW_1 : DARK_ROW_2;
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: columnsCount },
            cell: {
              userEnteredFormat: {
                backgroundColor: bg,
                textFormat: { fontFamily: 'Inter', fontSize: 10, foregroundColor: OFF_WHITE }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        });
      }

      // 4. Borders around data grid
      requests.push({
        updateBorders: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: columnsCount },
          top: { style: 'SOLID', color: BORDER_SLATE },
          bottom: { style: 'SOLID', color: BORDER_SLATE },
          left: { style: 'SOLID', color: BORDER_SLATE },
          right: { style: 'SOLID', color: BORDER_SLATE },
          innerHorizontal: { style: 'SOLID', color: BORDER_SLATE },
          innerVertical: { style: 'SOLID', color: BORDER_SLATE }
        }
      });

      // 5. Currency Column D formatting
      if (sheetId !== listsSheetId) {
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 3, endColumnIndex: 4 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
                textFormat: { fontFamily: 'Inter', fontSize: 10, bold: true, foregroundColor: amountColor },
                horizontalAlignment: 'RIGHT'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment)'
          }
        });

        // Date Column A formatting
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 0, endColumnIndex: 1 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'DATE', pattern: 'dd-mm-yyyy' },
                textFormat: { fontFamily: 'Inter', fontSize: 10, foregroundColor: OFF_WHITE },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment)'
          }
        });
      }
    };

    // Apply Theme to all 3 sheets
    setupSheetTheme(txSheetId, ROSE_HEADER, ROSE_TEXT, 6);
    setupSheetTheme(earnSheetId, EMERALD_HEADER, EMERALD_TEXT, 5);
    setupSheetTheme(listsSheetId, INDIGO_HEADER, VIOLET_TEXT, 3);

    console.log('Sending batchUpdate for Column Header Theme...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 COLUMN HEADERS AND THEME SUCCESSFULLY APPLIED!');
  } catch (error) {
    console.error('Error applying theme batchUpdate:', error.message);
  }
}

applyFullDarkSheetTheme();
