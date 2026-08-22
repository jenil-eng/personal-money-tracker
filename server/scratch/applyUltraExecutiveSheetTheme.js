const { getGoogleSheetsClient } = require('../config/googleSheets');

async function applyUltraExecutiveSheetTheme() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Restoring Ultra-Executive Professional Theme with 7 Columns on Google Sheet:', spreadsheetId);

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

    // 1. Update Header Row 1 text values
    await Promise.all([
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'TRANSACTIONS!A1:G1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Date', 'Description', 'Category', 'Subcategory', 'Amount', 'Payment Method', 'Notes']] }
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'EARNINGS!A1:E1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Date', 'Description', 'Source', 'Amount', 'Notes']] }
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'LISTS!A1:D1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Transaction Categories', 'Earning Sources', 'Payment Methods', 'Subcategories']] }
      })
    ]);

    // Format TRANSACTIONS Sheet (7 Columns: Date, Desc, Cat, Subcat, Amount, PM, Notes)
    const formatTransactionsSheet = () => {
      const sheetId = txSheetId;
      const colsCount = 7;
      const colWidths = [140, 260, 160, 180, 150, 170, 290];

      // Row heights
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
          properties: { pixelSize: 44 },
          fields: 'pixelSize'
        }
      });
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 300 },
          properties: { pixelSize: 32 },
          fields: 'pixelSize'
        }
      });

      // Column widths
      colWidths.forEach((w, idx) => {
        requests.push({
          updateDimensionProperties: {
            range: { sheetId, dimension: 'COLUMNS', startIndex: idx, endIndex: idx + 1 },
            properties: { pixelSize: w },
            fields: 'pixelSize'
          }
        });
      });

      // Header style
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: colsCount },
          cell: {
            userEnteredFormat: {
              backgroundColor: TX_HEADER_BG,
              textFormat: { fontFamily: 'Arial', fontSize: 11, bold: true, foregroundColor: WHITE_TEXT },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      });

      // Header bottom border (Rose Red)
      requests.push({
        updateBorders: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: colsCount },
          bottom: { style: 'SOLID_MEDIUM', color: EXPENSE_RED }
        }
      });

      // Alternating Zebra striping rows
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

      // Gridlines
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

      // Date (Col A): Centered Date dd-mm-yyyy
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

      // Description (Col B): Left, Bold Dark Text
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

      // Category (Col C) & Subcategory (Col D): Soft Pill Fill
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 300, startColumnIndex: 2, endColumnIndex: 4 },
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

      // Amount (Col E): Right-aligned, Bold Rose Red Currency
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 300, startColumnIndex: 4, endColumnIndex: 5 },
          cell: {
            userEnteredFormat: {
              numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
              textFormat: { fontFamily: 'Arial', fontSize: 11, bold: true, foregroundColor: EXPENSE_RED },
              horizontalAlignment: 'RIGHT',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment,verticalAlignment)'
        }
      });

      // Payment Method (Col F) & Notes (Col G): Muted Text
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 300, startColumnIndex: 5, endColumnIndex: 7 },
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

      // Clear Data Validations from non-dropdown columns (Date A, Desc B, Amount E, Notes G)
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 0, endColumnIndex: 2 },
          rule: null
        }
      });
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 4, endColumnIndex: 5 },
          rule: null
        }
      });
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 10 },
          rule: null
        }
      });

      // Data Validations for Dropdown Columns (Category C, Subcategory D, Payment Method F)
      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 2, endColumnIndex: 3 },
          rule: { condition: { type: 'ONE_OF_RANGE', values: [{ userEnteredValue: '=LISTS!$A$2:$A' }] }, showCustomUi: true, strict: false }
        }
      });

      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 },
          rule: { condition: { type: 'ONE_OF_RANGE', values: [{ userEnteredValue: '=LISTS!$D$2:$D' }] }, showCustomUi: true, strict: false }
        }
      });

      requests.push({
        setDataValidation: {
          range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 5, endColumnIndex: 6 },
          rule: { condition: { type: 'ONE_OF_RANGE', values: [{ userEnteredValue: '=LISTS!$C$2:$C' }] }, showCustomUi: true, strict: false }
        }
      });
    };

    formatTransactionsSheet();

    console.log('Sending batchUpdate for Ultra-Executive Theme...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 ULTRA-EXECUTIVE PROFESSIONAL THEME RESTORED SUCCESSFULLY TO GOOGLE SHEET!');
  } catch (error) {
    console.error('Error applying theme:', error.message);
  }
}

applyUltraExecutiveSheetTheme();
