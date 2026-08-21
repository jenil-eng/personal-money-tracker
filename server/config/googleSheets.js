const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });


function getGoogleSheetsClient() {
  const jsonKeyPath = path.join(__dirname, 'serviceAccountKey.json');
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  // 1. Check if serviceAccountKey.json file exists directly in config directory
  if (fs.existsSync(jsonKeyPath)) {
    try {
      const keyFileContent = fs.readFileSync(jsonKeyPath, 'utf8');
      const keyObj = JSON.parse(keyFileContent);
      const auth = google.auth.fromJSON(keyObj);
      auth.scopes = ['https://www.googleapis.com/auth/spreadsheets'];

      const sheets = google.sheets({ version: 'v4', auth });
      return { sheets, spreadsheetId };
    } catch (err) {
      console.error('Failed to load serviceAccountKey.json:', err.message);
    }
  }

  // 2. Fallback to process.env variables
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey || !spreadsheetId || 
      serviceAccountEmail.includes('your_service_account_email') ||
      spreadsheetId.includes('your_spreadsheet_id')) {
    return null; // Signals fallback to local JSON persistence mode
  }

  // Sanitize private key newline characters if loaded from env string
  if (privateKey) {
    privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
  }

  try {
    const auth = new google.auth.JWT(
      serviceAccountEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    return { sheets, spreadsheetId };
  } catch (error) {
    console.error('Failed to initialize Google Sheets API client from env:', error.message);
    return null;
  }
}

module.exports = {
  getGoogleSheetsClient
};
