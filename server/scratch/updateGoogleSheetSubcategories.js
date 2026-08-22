const { getGoogleSheetsClient } = require('../config/googleSheets');

async function updateGoogleSheetSubcategories() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Reordering Subcategory to Column D (between Category and Amount) in Google Sheet:', spreadsheetId);

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

    // 1. Fetch current TRANSACTIONS rows to reorder columns if needed
    const txRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'TRANSACTIONS!A1:Z100',
      valueRenderOption: 'UNFORMATTED_VALUE'
    });

    const currentRows = txRes.data.values || [];

    // Header row
    const newHeader = ['Date', 'Description', 'Category', 'Subcategory', 'Amount', 'Payment Method', 'Notes'];

    // Process data rows (if any)
    const newDataRows = currentRows.slice(1).map(row => {
      // Old order could be: Date(0), Desc(1), Cat(2), Amt(3), PM(4), Notes(5), Subcat(6)
      // or already modified. Let's inspect:
      const date = row[0] || '';
      const desc = row[1] || '';
      const cat = row[2] || '';

      let subcat = '';
      let amt = '';
      let pm = '';
      let notes = '';

      // Check if row[3] is numeric (Amount) or string (Subcategory)
      if (typeof row[3] === 'number' || (typeof row[3] === 'string' && !isNaN(parseFloat(row[3])) && parseFloat(row[3]) > 0)) {
        amt = row[3];
        pm = row[4] || '';
        notes = row[5] || '';
        subcat = row[6] || '';
      } else {
        subcat = row[3] || '';
        amt = row[4] || '';
        pm = row[5] || '';
        notes = row[6] || '';
      }

      return ["'" + String(date).replace(/^'/, ''), desc, cat, subcat, amt, pm, notes];
    });

    // 2. Clear old range & update with new column structure
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'TRANSACTIONS!A1:Z100'
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `TRANSACTIONS!A1:G${newDataRows.length + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [newHeader, ...newDataRows] }
    });

    // 3. Update LISTS
    await Promise.all([
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

    // Header Row 1 formatting (A1:G1)
    requests.push({
      repeatCell: {
        range: { sheetId: txSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 7 },
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

    // Set Column Widths for TRANSACTIONS (A..G)
    // Date:140, Desc:250, Cat:160, Subcat:180, Amt:140, PM:160, Notes:280
    const colWidths = [140, 250, 160, 180, 140, 160, 280];
    colWidths.forEach((w, idx) => {
      requests.push({
        updateDimensionProperties: {
          range: { sheetId: txSheetId, dimension: 'COLUMNS', startIndex: idx, endIndex: idx + 1 },
          properties: { pixelSize: w },
          fields: 'pixelSize'
        }
      });
    });

    // Format Currency Column E (Amount)
    requests.push({
      repeatCell: {
        range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 200, startColumnIndex: 4, endColumnIndex: 5 },
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
        range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 200, startColumnIndex: 0, endColumnIndex: 1 },
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

    // Gridlines for Column A..G in TRANSACTIONS
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

    // Data Validation: Subcategory Dropdown in Column D (startColumnIndex: 3, endColumnIndex: 4)
    requests.push({
      setDataValidation: {
        range: { sheetId: txSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 3, endColumnIndex: 4 },
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

    console.log('Sending batchUpdate for updated column order (Subcategory as Column D)...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 REORDERED SUBCATEGORY TO COLUMN D IN GOOGLE SHEET SUCCESSFULLY!');
  } catch (error) {
    console.error('Error updating Google Sheet column order:', error.message);
  }
}

updateGoogleSheetSubcategories();
