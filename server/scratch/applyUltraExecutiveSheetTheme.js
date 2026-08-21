const { getGoogleSheetsClient } = require('../config/googleSheets');

async function applyUltraExecutiveSheetTheme() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Applying Ultra-Executive Professional Theme to Google Sheet:', spreadsheetId);

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

    // Clean Color Tokens
    const WHITE_BG = color(255, 255, 255);
    const ZEBRA_BG = color(248, 250, 252);        // Soft Slate Tint #f8fafc
    const CATEGORY_BG = color(241, 245, 249);     // Pill fill #f1f5f9
    const BORDER_LIGHT = color(226, 232, 240);    // Gridline #e2e8f0

    const WHITE_TEXT = color(255, 255, 255);
    const DARK_TEXT = color(15, 23, 42);          // #0f172a
    const MUTED_TEXT = color(71, 85, 105);        // #475569
    const EXPENSE_RED = color(225, 29, 72);       // Rose Red #e11d48
    const INCOME_GREEN = color(5, 150, 105);      // Emerald Green #059669

    // Headers
    const TX_HEADER_BG = color(15, 23, 42);       // Dark Slate #0f172a
    const EARN_HEADER_BG = color(6, 78, 59);      // Dark Emerald #064e3b
    const LISTS_HEADER_BG = color(49, 46, 129);   // Dark Indigo #312e81

    const requests = [];

    // Freeze Header Row 1 across all sheets
    sheetsList.forEach(s => {
      requests.push({
        updateSheetProperties: {
          properties: {
            sheetId: s.properties.sheetId,
            gridProperties: { frozenRowCount: 1 }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      });
    });

    const formatSheet = (sheetId, headerBg, colsCount, colWidths, isEarning = false) => {
      // 1. Row Heights
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
          properties: { pixelSize: 44 },
          fields: 'pixelSize'
        }
      });
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 500 },
          properties: { pixelSize: 32 },
          fields: 'pixelSize'
        }
      });

      // 2. Column Widths
      colWidths.forEach((w, idx) => {
        requests.push({
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: idx, endIndex: idx + 1 },
            properties: { pixelSize: w },
            fields: 'pixelSize'
          }
        });
      });

      // 3. Header Styling (44px, Bold White, Dark Header Fills)
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: colsCount },
          cell: {
            userEnteredFormat: {
              backgroundColor: headerBg,
              textFormat: { fontFamily: 'Arial', fontSize: 11, bold: true, foregroundColor: WHITE_TEXT },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      });

      // Header Bottom Border
      requests.push({
        updateBorders: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: colsCount },
          bottom: { style: 'SOLID_MEDIUM', color: isEarning ? INCOME_GREEN : EXPENSE_RED }
        }
      });

      // 4. Alternating Row Colors (Zebra Striping)
      for (let r = 1; r < 300; r++) {
        const bg = (r % 2 === 0) ? ZEBRA_BG : WHITE_BG;
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: r, endRowIndex: r + 1, startColumnIndex: 0, endColumnIndex: colsCount },
            cell: { userEnteredFormat: { backgroundColor: bg } },
            fields: 'userEnteredFormat(backgroundColor)'
          }
        });
      }

      // 5. Gridlines
      requests.push({
        updateBorders: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 300, startColumnIndex: 0, endColumnIndex: colsCount },
          top: { style: 'SOLID', color: BORDER_LIGHT },
          bottom: { style: 'SOLID', color: BORDER_LIGHT },
          left: { style: 'SOLID', color: BORDER_LIGHT },
          right: { style: 'SOLID', color: BORDER_LIGHT },
          innerHorizontal: { style: 'SOLID', color: BORDER_LIGHT },
          innerVertical: { style: 'SOLID', color: BORDER_LIGHT }
        }
      });

      // 6. Data Columns (Date, Description, Category, Amount, Payment, Notes)
      if (sheetId !== listsSheetId) {
        // Date (Col A): Centered, Muted Text
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 300, startColumnIndex: 0, endColumnIndex: 1 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'DATE', pattern: 'dd-mm-yyyy' },
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: MUTED_TEXT },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment,verticalAlignment)'
          }
        });

        // Description (Col B): Left-aligned, Bold Dark Text
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 300, startColumnIndex: 1, endColumnIndex: 2 },
            cell: {
              userEnteredFormat: {
                textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: DARK_TEXT },
                horizontalAlignment: 'LEFT',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)'
          }
        });

        // Category / Source (Col C): Centered, Soft Pill Fill
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 300, startColumnIndex: 2, endColumnIndex: 3 },
            cell: {
              userEnteredFormat: {
                backgroundColor: CATEGORY_BG,
                textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: DARK_TEXT },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
          }
        });

        // Amount (Col D): Right-aligned, Bold Colored Currency
        const amtColor = isEarning ? INCOME_GREEN : EXPENSE_RED;
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 300, startColumnIndex: 3, endColumnIndex: 4 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
                textFormat: { fontFamily: 'Arial', fontSize: 11, bold: true, foregroundColor: amtColor },
                horizontalAlignment: 'RIGHT',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment,verticalAlignment)'
          }
        });

        // Payment / Notes (Col E & F): Centered / Left Muted Text
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 300, startColumnIndex: 4, endColumnIndex: colsCount },
            cell: {
              userEnteredFormat: {
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: MUTED_TEXT },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)'
          }
        });
      }
    };

    formatSheet(txSheetId, TX_HEADER_BG, 6, [140, 260, 170, 150, 170, 290], false);
    formatSheet(earnSheetId, EARN_HEADER_BG, 5, [140, 260, 170, 150, 290], true);
    formatSheet(listsSheetId, LISTS_HEADER_BG, 3, [220, 220, 220], false);

    console.log('Sending batchUpdate for Ultra-Executive Theme...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 ULTRA-EXECUTIVE PROFESSIONAL THEME APPLIED TO GOOGLE SHEET!');
  } catch (error) {
    console.error('Error applying theme:', error.message);
  }
}

applyUltraExecutiveSheetTheme();
