const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const DEFAULT_SHEET_ID = '1VG44hGnKjLDJQWtUKXTzrHP-4payUZQYGFtQEm8U31I';

function getGoogleSheetsClient() {
  const jsonKeyPath = path.join(__dirname, 'serviceAccountKey.json');
  const spreadsheetId = process.env.GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;

  // 1. Check if serviceAccountKey.json file exists directly on disk
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

  // 2. Check Base64 encoded JSON string in GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
    try {
      const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf8');
      const keyObj = JSON.parse(decoded);
      const auth = google.auth.fromJSON(keyObj);
      auth.scopes = ['https://www.googleapis.com/auth/spreadsheets'];

      const sheets = google.sheets({ version: 'v4', auth });
      return { sheets, spreadsheetId };
    } catch (err) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 env variable:', err.message);
    }
  }

  // 3. Check if FULL JSON string is provided in GOOGLE_SERVICE_ACCOUNT_JSON
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const keyObj = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
      const auth = google.auth.fromJSON(keyObj);
      auth.scopes = ['https://www.googleapis.com/auth/spreadsheets'];

      const sheets = google.sheets({ version: 'v4', auth });
      return { sheets, spreadsheetId };
    } catch (err) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON env variable:', err.message);
    }
  }

  // 4. Fallback to process.env variables (GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_PRIVATE_KEY)
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail || !privateKey || 
      serviceAccountEmail.includes('your_service_account_email')) {
    return null;
  }

  // Sanitize private key newline characters if loaded from env string
  if (privateKey) {
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    privateKey = privateKey.replace(/\\n/g, '\n');
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
