// backend/src/server.js
// ✅ FIXED: Exclude PDF routes from helmet CSP

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== CHEMINS GLOBAUX ====================
const uploadsPath = path.join(__dirname, 'uploads');
const reportsPath = path.join(uploadsPath, 'reports');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('Created uploads directory:', uploadsPath);
}
if (!fs.existsSync(reportsPath)) {
  fs.mkdirSync(reportsPath, { recursive: true });
  console.log('Created reports directory:', reportsPath);
}

// ==================== MIDDLEWARES ====================

// 1. CORS - Accept any localhost port dynamically
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is localhost with any port
    if (origin.match(/^http:\/\/localhost:\d+$/) || 
        origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 2. ✅ FIXED: Conditional helmet - Skip entirely for PDF routes
app.use((req, res, next) => {
  // Skip helmet completely for PDF viewing routes and uploads
  if (req.path.startsWith('/api/secure-pdf') || req.path.startsWith('/uploads')) {
    console.log('⏭️  Skipping helmet for:', req.path);
    return next();
  }
  
  // Apply helmet to all other routes
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        frameAncestors: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    frameguard: { action: 'sameorigin' },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })(req, res, next);
});

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== STATIC FILES ====================
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.pdf')) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'X-Frame-Options': 'SAMEORIGIN'
      });
    }
  }
}));

app.use('/uploads/*', (req, res) => {
  res.status(404).json({ error: 'File not found' });
});

// ==================== ROUTES ====================
const authRoutes         = require('./routes/auth.routes');
const reportsRoutes      = require('./routes/reports.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const usersRoutes        = require('./routes/users.routes');
const securePdfRoutes    = require('./routes/secure-pdf.routes');
const favoritesRoutes    = require('./routes/favorites.routes');

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    securePdf: true,
    favorites: true,
    cors: 'fixed',
    csp: 'conditional'
  });
});

app.use('/api/auth',         authRoutes);
app.use('/api/reports',      reportsRoutes);
app.use('/api/notifications',notificationsRoutes);
app.use('/api/users',        usersRoutes);
app.use('/api/secure-pdf',   securePdfRoutes);
app.use('/api/favorites',    favoritesRoutes);

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ==================== DÉMARRAGE ====================
app.listen(PORT, () => {
  console.log('\n================================');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads : ${uploadsPath}`);
  console.log(`Reports : ${reportsPath}`);
  console.log(`Secure PDF : ACTIVE`);
  console.log(`Favorites system : ACTIVE`);
  console.log(`CORS fixed : YES`);
  console.log(`CSP: Conditional (skipped for PDFs)`);
  console.log('================================\n');
});

module.exports = app;