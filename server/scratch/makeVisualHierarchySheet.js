const { getGoogleSheetsClient } = require('../config/googleSheets');

async function makeVisualHierarchySheet() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Applying visual hierarchy formatting to Google Sheet:', spreadsheetId);

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

    const HEADER_FILL = color(241, 245, 249);      // Slate light fill #f1f5f9
    const HEADER_BORDER = color(203, 213, 225);    // Slate border #cbd5e1
    const TEXT_HEADER = color(15, 23, 42);         // Dark slate #0f172a
    const TEXT_BODY = color(30, 41, 59);           // Body dark text #1e293b
    const TEXT_MUTED = color(100, 116, 139);       // Muted text #64748b

    const requests = [];

    const applySheetHierarchy = (sheetId, columnsCount) => {
      // 1. Header Row 1: Height 36px, Slate fill #f1f5f9, 11pt Bold Text, Centered
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
          properties: { pixelSize: 36 },
          fields: 'pixelSize'
        }
      });

      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columnsCount },
          cell: {
            userEnteredFormat: {
              backgroundColor: HEADER_FILL,
              textFormat: { fontFamily: 'Arial', fontSize: 11, bold: true, foregroundColor: TEXT_HEADER },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      });

      // Bottom border for Header Row 1 to separate from data
      requests.push({
        updateBorders: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columnsCount },
          bottom: { style: 'SOLID_MEDIUM', color: HEADER_BORDER }
        }
      });

      // 2. Data Rows (Row 2 onwards): Height 28px
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 500 },
          properties: { pixelSize: 28 },
          fields: 'pixelSize'
        }
      });

      // 3. Column Formatting for Data Rows
      if (sheetId !== listsSheetId) {
        // Column A (Date): 10pt Centered, Muted Text
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 0, endColumnIndex: 1 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'DATE', pattern: 'dd-mm-yyyy' },
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_MUTED },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment,verticalAlignment)'
          }
        });

        // Column B (Description): 10pt BOLD Text for clear title distinction
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 1, endColumnIndex: 2 },
            cell: {
              userEnteredFormat: {
                textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: TEXT_BODY },
                horizontalAlignment: 'LEFT',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)'
          }
        });

        // Column C (Category / Source): 10pt Centered Text
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 2, endColumnIndex: 3 },
            cell: {
              userEnteredFormat: {
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_BODY },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)'
          }
        });

        // Column D (Amount): 10pt BOLD Currency ₹#,##0
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 3, endColumnIndex: 4 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
                textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: TEXT_BODY },
                horizontalAlignment: 'RIGHT',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment,verticalAlignment)'
          }
        });

        // Column E (Payment Method): 10pt Centered Text
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 500, startColumnIndex: 4, endColumnIndex: 5 },
            cell: {
              userEnteredFormat: {
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_MUTED },
                horizontalAlignment: 'CENTER',
                verticalAlignment: 'MIDDLE'
              }
            },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)'
          }
        });
      }
    };

    applySheetHierarchy(txSheetId, 6);
    applySheetHierarchy(earnSheetId, 5);
    applySheetHierarchy(listsSheetId, 3);

    console.log('Sending batchUpdate for visual hierarchy formatting...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 VISUAL HIERARCHY FORMATTING SUCCESSFULLY APPLIED!');
  } catch (error) {
    console.error('Error applying visual hierarchy:', error.message);
  }
}

makeVisualHierarchySheet();
