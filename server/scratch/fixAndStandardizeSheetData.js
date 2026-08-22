const { getGoogleSheetsClient } = require('../config/googleSheets');
const { parseAmount, formatDate } = require('../utils/formatters');

async function fixAndStandardizeSheetData() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Standardizing all TRANSACTIONS data rows in Google Sheet:', spreadsheetId);

  try {
    // 1. Fetch raw values from TRANSACTIONS
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'TRANSACTIONS!A1:Z1000',
      valueRenderOption: 'UNFORMATTED_VALUE'
    });

    const rows = res.data.values || [];
    if (rows.length === 0) {
      console.log('No rows found in TRANSACTIONS sheet.');
      return;
    }

    const knownPMs = ['cash', 'upi', 'debit card', 'credit card', 'bank transfer', 'other', '-'];

    const newHeader = ['Date', 'Description', 'Category', 'Subcategory', 'Amount', 'Payment Method', 'Notes'];

    const dataRows = rows.slice(1);
    const cleanedRows = dataRows.map((row, idx) => {
      const dateRaw = row[0] || '';
      const date = formatDate(dateRaw);
      const desc = row[1] || '';
      const cat = row[2] || '';

      const val3 = row[3] !== undefined ? row[3] : '';
      const val4 = row[4] !== undefined ? row[4] : '';
      const val5 = row[5] !== undefined ? row[5] : '';
      const val6 = row[6] !== undefined ? row[6] : '';

      const num3 = parseAmount(val3);
      const num4 = parseAmount(val4);

      let subcat = '';
      let amt = 0;
      let pm = '';
      let notes = '';

      // Check if 7-column layout (val4 is amount or val5 is payment method)
      if (num4 > 0 || knownPMs.includes(String(val5).toLowerCase().trim())) {
        subcat = String(val3);
        amt = num4 > 0 ? num4 : num3;
        pm = String(val5);
        notes = String(val6);
      } 
      // Check if 6-column legacy layout (val3 is amount or val4 is payment method)
      else if (num3 > 0 || knownPMs.includes(String(val4).toLowerCase().trim())) {
        amt = num3;
        pm = String(val4);
        notes = String(val5);
        subcat = String(val6);
      } 
      else {
        amt = num4 || num3 || 0;
        subcat = String(val3);
        pm = String(val5 || val4);
        notes = String(val6);
      }

      const finalNotes = notes && notes.trim() !== '' ? notes.trim() : '-';
      const finalPM = pm && pm.trim() !== '' ? pm.trim() : '-';

      return ["'" + date, desc, cat, subcat, amt, finalPM, finalNotes];
    });

    console.log(`Cleaned ${cleanedRows.length} transaction rows. Writing standardized data to Google Sheet...`);

    // 2. Clear old sheet range
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'TRANSACTIONS!A1:Z1000'
    });

    // 3. Write clean 7-column rows
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `TRANSACTIONS!A1:G${cleanedRows.length + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newHeader, ...cleanedRows]
      }
    });

    console.log('🎉 ALL GOOGLE SHEET TRANSACTION ROWS STANDARDIZED SUCCESSFULLY!');
  } catch (error) {
    console.error('Error fixing sheet data:', error.message);
  }
}

fixAndStandardizeSheetData();
