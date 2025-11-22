const express = require('express');
const path = require('path');
require('dotenv').config();

const security = require('./config/security');
const rateLimit = require('./middleware/rateLimit.middleware');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const reportsRoutes = require('./routes/reports.routes');

function createApp() {
  const app = express();

  security(app);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(rateLimit);

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/reports', reportsRoutes);

  app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
