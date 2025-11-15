const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password (in production, use bcrypt.compare)
    const isValidPassword = password === 'password123'; // Mock validation

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is required
    if (user.two_factor_enabled) {
      return res.json({
        requiresTwoFactor: true,
        user: { id: user.id, email: user.email, role: user.role },
        method: user.two_factor_method
      });
    }

    // Generate token for users without 2FA
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 2FA Setup routes
app.post('/api/auth/2fa/setup', async (req, res) => {
  const { userId, method } = req.body;

  try {
    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: 'Bib-Esprim',
      issuer: 'Bib-Esprim'
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Update user with 2FA secret
    await pool.query(
      'UPDATE users SET two_factor_secret = $1, two_factor_method = $2 WHERE id = $3',
      [secret.base32, method, userId]
    );

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauth_url: secret.otpauth_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

// 2FA Verification
app.post('/api/auth/2fa/verify', async (req, res) => {
  const { userId, code, method } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (method === 'app') {
      // Verify TOTP code
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow 2 time windows (30 seconds each)
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    } else if (method === 'sms') {
      // Mock SMS verification (in production, integrate with SMS service)
      if (code !== '123456') {
        return res.status(401).json({ error: 'Invalid SMS code' });
      }
    }

    // Enable 2FA if not already enabled
    if (!user.two_factor_enabled) {
      await pool.query(
        'UPDATE users SET two_factor_enabled = TRUE WHERE id = $1',
        [userId]
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '2FA verification failed' });
  }
});

// Send SMS code (mock implementation)
app.post('/api/auth/2fa/send-sms', async (req, res) => {
  const { userId } = req.body;

  try {
    const result = await pool.query('SELECT phone FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0 || !result.rows[0].phone) {
      return res.status(400).json({ error: 'No phone number registered' });
    }

    // Mock SMS sending (in production, integrate with SMS service like Twilio)
    console.log(`SMS code sent to ${result.rows[0].phone}: 123456`);

    res.json({ message: 'SMS code sent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// API routes for reports
app.get('/api/reports', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.post('/api/reports', async (req, res) => {
  const { title, content, author } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO reports (title, content, author) VALUES ($1, $2, $3) RETURNING *',
      [title, content, author]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// API routes for catalog
app.get('/api/catalog', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM catalog');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// API routes for dashboards
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dashboard_stats');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
