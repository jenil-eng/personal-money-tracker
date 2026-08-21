# Personal Money Tracker — Private Student Finance Dashboard

A production-quality, private web application designed specifically for student finance management. Features Google Sheets API as the primary data store for recording money spent (Transactions) and money received (Earnings).

---

## Technical Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios, Lucide React icons, Recharts.
- **Backend**: Node.js, Express.js, JWT Authentication.
- **Data Storage**: Google Sheets API (`googleapis`).

---

## Comprehensive Setup & Configuration Guide

### 1. Project Setup & Prerequisites

Ensure you have **Node.js (v18+)** and **npm** installed on your system.

```bash
# Clone or navigate to project directory
cd "expense tracker"
```

---

### 2. Install Dependencies

Install packages for both backend server and frontend client:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

---

### 3. Google Cloud Setup & Google Sheets API Setup

Follow these exact steps to connect your application to Google Sheets:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `Personal Money Tracker`.
3. In the left navigation menu, go to **APIs & Services > Library**.
4. Search for **Google Sheets API** and click **Enable**.
5. Go to **APIs & Services > Credentials**.
6. Click **+ CREATE CREDENTIALS** at the top and select **Service Account**.
7. Enter a name (e.g., `money-tracker-service-account`), click **Create and Continue**, and click **Done**.
8. Click on your newly created Service Account from the list.
9. Go to the **Keys** tab, click **Add Key > Create new key**, select **JSON**, and click **Create**.
10. A `.json` file containing your credentials will be downloaded to your computer.
11. Open the JSON file to locate:
    - `client_email` (Your Service Account Email)
    - `private_key` (Your Private Key including `-----BEGIN PRIVATE KEY-----`)

---

### 4. Create & Configure Google Spreadsheet

1. Open [Google Sheets](https://sheets.google.com/) and create a new blank Spreadsheet named **`Personal Money Tracker`**.
2. Copy the **Spreadsheet ID** from the URL bar:
   `https://docs.google.com/spreadsheets/d/`**`YOUR_SPREADSHEET_ID`**`/edit`
3. Rename Sheet 1 to **`TRANSACTIONS`** and set row 1 headers:
   - `A1`: `Date`
   - `B1`: `Description`
   - `C1`: `Category`
   - `D1`: `Amount`
   - `E1`: `Payment Method`
   - `F1`: `Notes`
4. Add a new tab named **`EARNINGS`** and set row 1 headers:
   - `A1`: `Date`
   - `B1`: `Description`
   - `C1`: `Source`
   - `D1`: `Amount`
   - `E1`: `Notes`
5. Add a new tab named **`LISTS`** and set row 1 headers:
   - `A1`: `Transaction Categories`
   - `B1`: `Earning Sources`
   - `C1`: `Payment Methods`
   - Populate column A with default categories (Food, Travel, Shopping, etc.)
   - Populate column B with default sources (Pocket Money, Gift, Freelancing, etc.)
   - Populate column C with default payment methods (Cash, UPI, Debit Card, etc.)
6. **Share Spreadsheet Access**: Click the top right **Share** button, enter your Service Account Email (`client_email`), select **Editor** permissions, and click **Send**.

---

### 5. Configure `.env` File

Copy `.env.example` to `server/.env` and replace placeholders with your credentials:

```env
PORT=5050

AUTH_SECRET=your_super_secret_jwt_key_here

ADMIN_EMAIL=admin@student.com

ADMIN_PASSWORD=your_secure_password_here

GOOGLE_SHEET_ID=your_spreadsheet_id_here

GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email@your_project.iam.gserviceaccount.com

GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

---

### 6. Running the Application

#### Start Backend Server:
```bash
cd server
npm start
# Server starts on http://localhost:5050
```

#### Start Frontend Client:
```bash
cd client
npm run dev
# App opens on http://localhost:5173
```

---

### 7. Production Build

To test or build the client bundle for production deployment:

```bash
cd client
npm run build
```
The output static files will be placed in `client/dist/`.
