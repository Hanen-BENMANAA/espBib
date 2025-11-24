// backend/server.js - VERSION FINALE 100% FONCTIONNELLE
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const path = require('path');

const db = require('./db');
const authRoutes = require('./routes/auth.routes');
const reportsRoutes = require('./routes/reports.routes');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads/reports')));

// JWT Authentication
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// Helper pour éviter les try/catch
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Routes de base
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`ESPRIM Virtual Library - Backend prêt !`);
});