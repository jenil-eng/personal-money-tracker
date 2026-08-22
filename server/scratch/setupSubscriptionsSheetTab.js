const { getGoogleSheetsClient } = require('../config/googleSheets');
const mockStore = require('../services/mockStoreService');

async function setupSubscriptionsSheetTab() {
  console.log('🚀 Starting Subscriptions Sheet Tab setup...');
  const client = getGoogleSheetsClient();
  if (!client) {
    console.error('❌ Google Sheets client unavailable.');
    process.exit(1);
  }

  const { sheets, spreadsheetId } = client;

  try {
    // 1. Get spreadsheet metadata to check if SUBSCRIPTIONS sheet exists
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = meta.data.sheets.some(s => s.properties.title === 'SUBSCRIPTIONS');

    if (!sheetExists) {
      console.log('📄 Creating "SUBSCRIPTIONS" sheet tab...');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'SUBSCRIPTIONS',
                  gridProperties: { rowCount: 100, columnCount: 10 }
                }
              }
            }
          ]
        }
      });
      console.log('✅ Created "SUBSCRIPTIONS" tab.');
    } else {
      console.log('ℹ️ "SUBSCRIPTIONS" tab already exists.');
    }

    // Re-fetch sheet metadata to get exact sheetId
    const updatedMeta = await sheets.spreadsheets.get({ spreadsheetId });
    const subSheet = updatedMeta.data.sheets.find(s => s.properties.title === 'SUBSCRIPTIONS');
    const sheetId = subSheet.properties.sheetId;

    // 2. Populate Header & Initial Rows
    const headers = [['Subscription / Bill Name', 'Category', 'Amount', 'Billing Cycle', 'Due Day', 'Payment Method', 'Notes', 'Status']];
    const initialRows = [
      ['Netflix Premium (4K)', 'Entertainment', 649, 'monthly', 5, 'UPI', 'Family 4K UHD plan', 'active'],
      ['House Rent', 'Bills', 8500, 'monthly', 1, 'Bank Transfer', 'Hostel / Room rent', 'active'],
      ['JioFiber Broadband', 'Bills', 1179, 'monthly', 15, 'UPI', 'High-speed WiFi', 'active'],
      ['Spotify Student', 'Entertainment', 59, 'monthly', 28, 'UPI', 'Student music streaming', 'active']
    ];

    console.log('📝 Writing header and default subscription rows...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'SUBSCRIPTIONS!A1:H5',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [...headers, ...initialRows]
      }
    });

    // 3. Format Subscriptions Sheet with Ultra-Executive Professional Theme
    console.log('🎨 Formatting SUBSCRIPTIONS sheet with Ultra-Executive Theme...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Header Row Formatting (Dark Slate Header #0f172a, White text, Bold, 11pt, Centered vertical)
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 8 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 15 / 255, green: 23 / 255, blue: 42 / 255 }, // #0f172a
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11,
                    bold: true,
                    fontFamily: 'Inter'
                  },
                  horizontalAlignment: 'LEFT',
                  verticalAlignment: 'MIDDLE'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
            }
          },
          // Header Row Height (44px)
          {
            updateDimensionProperties: {
              range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
              properties: { pixelSize: 44 },
              fields: 'pixelSize'
            }
          },
          // Format Amount column (Column C / Index 2) as currency ₹#,##0
          {
            repeatCell: {
              range: { sheetId, startRowIndex: 1, endRowIndex: 100, startColumnIndex: 2, endColumnIndex: 3 },
              cell: {
                userEnteredFormat: {
                  numberFormat: { type: 'CURRENCY', pattern: '₹#,##0' },
                  textFormat: { bold: true }
                }
              },
              fields: 'userEnteredFormat(numberFormat,textFormat)'
            }
          },
          // Auto column widths
          {
            updateDimensionProperties: {
              range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
              properties: { pixelSize: 220 },
              fields: 'pixelSize'
            },
          },
          {
            updateDimensionProperties: {
              range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
              properties: { pixelSize: 140 },
              fields: 'pixelSize'
            }
          },
          {
            updateDimensionProperties: {
              range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 },
              properties: { pixelSize: 120 },
              fields: 'pixelSize'
            }
          }
        ]
      }
    });

    console.log('✨ SUBSCRIPTIONS sheet tab setup completed successfully!');
  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  }
}

setupSubscriptionsSheetTab();
