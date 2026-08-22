const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@student.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const targetEmail = ADMIN_EMAIL.trim().toLowerCase();

  if (sanitizedEmail === targetEmail && password === ADMIN_PASSWORD) {
    const payload = {
      email: targetEmail,
      name: 'Admin User',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d'
    });

    return res.json({
      token,
      user: {
        email: targetEmail,
        name: 'Admin User',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ message: 'Invalid email or password.' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
