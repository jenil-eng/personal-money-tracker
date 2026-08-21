const { getGoogleSheetsClient } = require('../config/googleSheets');

async function freezeHeaderRows() {
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('Google Sheets client not configured.');
    return;
  }

  const { sheets, spreadsheetId } = client;
  console.log('Freezing top header row for:', spreadsheetId);

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetsList = meta.data.sheets;

    const requests = sheetsList.map(s => ({
      updateSheetProperties: {
        properties: {
          sheetId: s.properties.sheetId,
          gridProperties: {
            frozenRowCount: 1
          }
        },
        fields: 'gridProperties.frozenRowCount'
      }
    }));

    console.log('Sending batchUpdate to freeze top header rows...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });

    console.log('🎉 TOP HEADER ROW SUCCESSFULLY FROZEN ACROSS ALL SHEETS!');
  } catch (error) {
    console.error('Error freezing header rows:', error.message);
  }
}

freezeHeaderRows();
