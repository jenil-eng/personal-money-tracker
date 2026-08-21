const { getGoogleSheetsClient } = require('../config/googleSheets');

async function resetSimpleProfessionalSheet() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Resetting Google Sheet to simple professional design for:', spreadsheetId);

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

    // Helper for 0.0 to 1.0 RGB colors
    const color = (r, g, b) => ({ red: r / 255, green: g / 255, blue: b / 255 });

    const WHITE_BG = color(255, 255, 255);       // #ffffff
    const HEADER_GREY = color(241, 245, 249);    // Subtle slate light grey #f1f5f9
    const BORDER_LIGHT = color(226, 232, 240);   // Subtle light border #e2e8f0
    const TEXT_DARK = color(15, 23, 42);         // Dark text #0f172a
    const TEXT_MUTED = color(71, 85, 105);       // Muted slate text #475569

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

    const applySimpleStyle = (sheetId, columnsCount) => {
      // Clear backgrounds and set clean white canvas
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 200, startColumnIndex: 0, endColumnIndex: 10 },
          cell: {
            userEnteredFormat: {
              backgroundColor: WHITE_BG,
              textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_DARK }
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)'
        }
      });

      // Simple Professional Header Row 1 (Light Slate Grey fill, Dark Bold Text)
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: columnsCount },
          cell: {
            userEnteredFormat: {
              backgroundColor: HEADER_GREY,
              textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: TEXT_DARK },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
        }
      });

      // Standard gridlines
      requests.push({
        updateBorders: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 200, startColumnIndex: 0, endColumnIndex: columnsCount },
          top: { style: 'SOLID', color: BORDER_LIGHT },
          bottom: { style: 'SOLID', color: BORDER_LIGHT },
          left: { style: 'SOLID', color: BORDER_LIGHT },
          right: { style: 'SOLID', color: BORDER_LIGHT },
          innerHorizontal: { style: 'SOLID', color: BORDER_LIGHT },
          innerVertical: { style: 'SOLID', color: BORDER_LIGHT }
        }
      });

      // Format Currency Column D
      if (sheetId !== listsSheetId) {
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 200, startColumnIndex: 3, endColumnIndex: 4 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_DARK },
                horizontalAlignment: 'RIGHT'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment)'
          }
        });

        // Format Date Column A
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: 1, endRowIndex: 200, startColumnIndex: 0, endColumnIndex: 1 },
            cell: {
              userEnteredFormat: {
                numberFormat: { type: 'DATE', pattern: 'dd-mm-yyyy' },
                textFormat: { fontFamily: 'Arial', fontSize: 10, foregroundColor: TEXT_MUTED },
                horizontalAlignment: 'CENTER'
              }
            },
            fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment)'
          }
        });
      }
    };

    applySimpleStyle(txSheetId, 6);
    applySimpleStyle(earnSheetId, 5);
    applySimpleStyle(listsSheetId, 3);

    console.log('Sending batchUpdate for Simple Professional Sheet formatting...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('✅ GOOGLE SHEET SUCCESSFULLY RESET TO SIMPLE, CLEAN, PROFESSIONAL LOOK!');
  } catch (error) {
    console.error('Error resetting sheet theme:', error.message);
  }
}

resetSimpleProfessionalSheet();
