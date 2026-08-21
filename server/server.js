const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const earningRoutes = require('./routes/earningRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const { isSheetsConfigured } = require('./services/googleSheetsService');

const app = express();
const PORT = process.env.PORT || 5050;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Root & Health check endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'Personal Money Tracker Backend API is online!',
    googleSheetsConfigured: isSheetsConfigured(),
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Personal Money Tracker API',
    endpoints: ['/api/auth', '/api/transactions', '/api/earnings', '/api/settings', '/api/health']
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    googleSheetsConfigured: isSheetsConfigured(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'API Route not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`Personal Money Tracker Server running on port ${PORT}`);
    console.log(`Google Sheets API Mode: ${isSheetsConfigured() ? 'Active (Connected)' : 'Fallback Mock Mode (data/store.json)'}`);
    console.log(`==================================================`);
  });
}

module.exports = app;
