const { getGoogleSheetsClient } = require('../config/googleSheets');

async function formatWholeSheet() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Formatting whole Google Sheet for:', spreadsheetId);

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

    const WHITE_BG = color(255, 255, 255);       // #ffffff
    const BORDER_LIGHT = color(226, 232, 240);   // #e2e8f0
    const TEXT_DARK = color(15, 23, 42);         // #0f172a
    const WHITE_TEXT = color(255, 255, 255);

    const ROSE_RED = color(225, 29, 72);       // #e11d48 (TRANSACTIONS)
    const EMERALD_GREEN = color(5, 150, 105);   // #059669 (EARNINGS)
    const INDIGO_BLUE = color(79, 70, 229);    // #4f46e5 (LISTS)

    // 1. Write clean column header names to Row 1 of all 3 sheets
    await Promise.all([
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'TRANSACTIONS!A1:F1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Notes']] }
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'EARNINGS!A1:E1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Date', 'Description', 'Source', 'Amount', 'Notes']] }
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'LISTS!A1:C1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Transaction Categories', 'Earning Sources', 'Payment Methods']] }
      })
    ]);

    const requests = [];

    const applySheetFormatting = (sheetId, headerBg, columnsCount, colWidths) => {
      // Clean white background across canvas
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 10 },
          cell: {
            userEnteredFormat: {
              backgroundColor: WHITE_BG,
              textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_DARK }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      });

      // Row 1 Header Style (40px height, centered, bold white text, exact header color)
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
          properties: { pixelSize: 40 },
          fields: 'pixelSize'
        }
      });

      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columnsCount },
          cell: {
            userEnteredFormat: {
              backgroundColor: headerBg,
              textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: WHITE_TEXT },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      });

      // Set Column Widths
      colWidths.forEach((w, idx) => {
        requests.push({
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: idx, endIndex: idx + 1 },
            properties: { pixelSize: w },
            fields: 'pixelSize'
          }
        });
      });

      // Standard gridlines
      requests.push({
        updateBorders: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: columnsCount },
          top: { style: 'SOLID', color: BORDER_LIGHT },
          bottom: { style: 'SOLID', color: BORDER_LIGHT },
          left: { style: 'SOLID', color: BORDER_LIGHT },
          right: { style: 'SOLID', color: BORDER_LIGHT },
          innerHorizontal: { style: 'SOLID', color: BORDER_LIGHT },
          innerVertical: { style: 'SOLID', color: BORDER_LIGHT }
        }
      });

      // Format Currency Column D & Date Column A for financial sheets
      if (sheetId !== listsSheetId) {
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 3, endColumnIndex: 4 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
                textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: TEXT_DARK },
                horizontalAlignment: 'RIGHT'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment)'
          }
        });

        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 1 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'DATE', pattern: 'dd-mm-yyyy' },
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_DARK },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment)'
          }
        });

        // Center Column C (Category / Source)
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 2, endColumnIndex: 3 },
            cell: {
              userEnteredFormat: {
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_DARK },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment)'
          }
        });
      }
    };

    // Apply formatting to all 3 sheets
    applySheetFormatting(txSheetId, ROSE_RED, 6, [140, 250, 160, 140, 160, 280]);
    applySheetFormatting(earnSheetId, EMERALD_GREEN, 5, [140, 250, 160, 140, 280]);
    applySheetFormatting(listsSheetId, INDIGO_BLUE, 3, [200, 200, 200]);

    // Data Validation Rules (Dropdown Menus)
    requests.push(
      {
        setDataValidation: {
          range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 2, endColumnIndex: 3 },
          rule: {
            condition: { type: 'ONE_OF_RANGE', values: [{ userEnteredValue: '=LISTS!A2:A' }] },
            showCustomUi: true,
            strict: false
          }
        }
      },
      {
        setDataValidation: {
          range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 4, endColumnIndex: 5 },
          rule: {
            condition: { type: 'ONE_OF_RANGE', values: [{ userEnteredValue: '=LISTS!C2:C' }] },
            showCustomUi: true,
            strict: false
          }
        }
      },
      {
        setDataValidation: {
          range: { sheetId: earnSheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 2, endColumnIndex: 3 },
          rule: {
            condition: { type: 'ONE_OF_RANGE', values: [{ userEnteredValue: '=LISTS!B2:B' }] },
            showCustomUi: true,
            strict: false
          }
        }
      }
    );

    console.log('Sending batchUpdate for complete Google Sheet formatting...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 WHOLE GOOGLE SHEET SUCCESSFULLY FORMATTED!');
  } catch (error) {
    console.error('Error formatting whole sheet:', error.message);
  }
}

formatWholeSheet();
