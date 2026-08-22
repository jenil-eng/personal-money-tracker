const { getGoogleSheetsClient } = require('../config/googleSheets');

async function updateGoogleSheetSubcategories() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Syncing Subcategories to Google Sheet:', spreadsheetId);

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

    const subcategories = [
      'Restaurants',
      'Fast Food',
      'Groceries',
      'Coffee',
      'Fuel',
      'Public Transport',
      'Taxi',
      'Maintenance',
      'Clothing',
      'Electronics',
      'Personal Care',
      'Accessories',
      'Electricity',
      'Internet',
      'Mobile',
      'Rent',
      'Water',
      'Movies',
      'Games',
      'Events',
      'Subscriptions',
      'Courses',
      'Tuition',
      'Stationery',
      'Books',
      'Fees',
      'Fitness',
      'Medical',
      'General',
      'Miscellaneous'
    ];

    // 1. Update headers in TRANSACTIONS (A1:G1) and LISTS (A1:D1)
    await Promise.all([
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'TRANSACTIONS!A1:G1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Notes', 'Subcategory']] }
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'LISTS!A1:D1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [['Transaction Categories', 'Earning Sources', 'Payment Methods', 'Subcategories']] }
      }),
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `LISTS!D2:D${subcategories.length + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: subcategories.map(sub => [sub]) }
      })
    ]);

    const color = (r, g, b) => ({ red: r / 255, green: g / 255, blue: b / 255 });
    const WHITE_BG = color(255, 255, 255);
    const BORDER_LIGHT = color(226, 232, 240);
    const TEXT_DARK = color(15, 23, 42);
    const WHITE_TEXT = color(255, 255, 255);
    const ROSE_RED = color(225, 29, 72);
    const INDIGO_BLUE = color(79, 70, 229);

    const requests = [];

    // Format Header Column G in TRANSACTIONS (Subcategory)
    requests.push({
      repeatCell: {
        range: { sheetId: txSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 6, endColumnIndex: 7 },
        cell: {
          userEnteredFormat: {
            backgroundColor: ROSE_RED,
            textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: WHITE_TEXT },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    });

    // Set Column Width for Column G (Subcategory)
    requests.push({
      updateDimensionProperties: {
        range: { sheetId: txSheetId, dimension: 'COLUMNS', startIndex: 6, endIndex: 7 },
        properties: { pixelSize: 180 },
        fields: 'pixelSize'
      }
    });

    // Format Header Column D in LISTS (Subcategories)
    requests.push({
      repeatCell: {
        range: { sheetId: listsSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 3, endColumnIndex: 4 },
        cell: {
          userEnteredFormat: {
            backgroundColor: INDIGO_BLUE,
            textFormat: { fontFamily: 'Arial', fontSize: 10, bold: true, foregroundColor: WHITE_TEXT },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    });

    // Set Column Width for LISTS Column D
    requests.push({
      updateDimensionProperties: {
        range: { sheetId: listsSheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 },
        properties: { pixelSize: 200 },
        fields: 'pixelSize'
      }
    });

    // Gridlines for Column G in TRANSACTIONS
    requests.push({
      updateBorders: {
        range: { sheetId: txSheetId, startRowIndex: 0, endRowIndex: 200, startColumnIndex: 0, endColumnIndex: 7 },
        top: { style: 'SOLID', color: BORDER_LIGHT },
        bottom: { style: 'SOLID', color: BORDER_LIGHT },
        left: { style: 'SOLID', color: BORDER_LIGHT },
        right: { style: 'SOLID', color: BORDER_LIGHT },
        innerHorizontal: { style: 'SOLID', color: BORDER_LIGHT },
        innerVertical: { style: 'SOLID', color: BORDER_LIGHT }
      }
    });

    // Data Validation: Subcategory Dropdown in TRANSACTIONS (Column G) pulling from LISTS!D2:D
    requests.push({
      setDataValidation: {
        range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 6, endColumnIndex: 7 },
        rule: {
          condition: {
            type: 'ONE_OF_RANGE',
            values: [{ userEnteredValue: '=LISTS!$D$2:$D' }]
          },
          showCustomUi: true,
          strict: false
        }
      }
    });

    console.log('Sending batchUpdate for Subcategory column & data validation...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 SUBCATEGORY FEATURE SUCCESSFULLY ADDED TO GOOGLE SHEET!');
  } catch (error) {
    console.error('Error updating Google Sheet subcategories:', error.message);
  }
}

updateGoogleSheetSubcategories();
