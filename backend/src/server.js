// backend/src/server.js
// COMPLETE FIX for PDF iframe display

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== GLOBAL PATHS ====================
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

// ==================== CORS (MUST BE FIRST) ====================
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        origin.match(/^http:\/\/localhost:\d+$/) ||
        origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)
      ) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// AJOUT CRITIQUE : ON DÉBLOQUE COMPLÈTEMENT LES PDF DANS LES IFRAMES
app.use('/api/secure-pdf', (req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('Content-Security-Policy', "frame-ancestors *;");
  console.log('PDF IFRAME DÉBLOQUÉ pour la route sécurisée');
  next();
});

app.use('/uploads', (req, res, next) => {
  res.removeHeader('X-Frame-Options');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  next();
});

// ==================== DISABLE HELMET FOR PDF ROUTES ====================
app.use((req, res, next) => {
  if (
    req.path.startsWith('/uploads') ||
    req.path.startsWith('/api/secure-pdf')
  ) {
    console.log('Bypassing security headers for:', req.path);
    return next();
  }

  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        frameAncestors: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })(req, res, next);
});

// ==================== MORGAN LOGGING ====================
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== CRITICAL: PDF-SPECIFIC MIDDLEWARE ====================
app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.pdf')) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
      });
      console.log('PDF served:', filepath);
    }
  },
}));

// ==================== STATIC FILES WITH PDF HEADERS ====================
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads')) {
    console.log('BYPASSING ALL SECURITY for:', req.path);
    return next();
  }

  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })(req, res, next);
});

// ==================== ROUTES ====================
const authRoutes = require('./routes/auth.routes');
const reportsRoutes = require('./routes/reports.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const usersRoutes = require('./routes/users.routes');
const securePdfRoutes = require('./routes/secure-pdf.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const teacherAlertsRoutes = require('./routes/teacher-alerts.routes');

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    features: {
      securePdf: true,
      favorites: true,
      cors: 'enabled',
      helmets: 'conditional',
      iframeSupport: 'ENABLED À 100%'
    },
    paths: {
      uploads: uploadsPath,
      reports: reportsPath,
    },
  });
});

app.get('/api/test-pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(reportsPath, filename);
  
  console.log('Testing PDF access:', filename);
  console.log('   Full path:', filePath);
  console.log('   Exists:', fs.existsSync(filePath));
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'File not found',
      filename,
      path: filePath,
      availableFiles: fs.readdirSync(reportsPath)
    });
  }
  
  const stats = fs.statSync(filePath);
  res.json({
    success: true,
    filename,
    path: filePath,
    size: stats.size,
    created: stats.birthtime,
    url: `/uploads/reports/${filename}`
  });
});

app.get('/api/debug/list-reports', (req, res) => {
  try {
    if (!fs.existsSync(reportsPath)) {
      return res.json({ 
        error: 'Reports directory does not exist', 
        path: reportsPath 
      });
    }

    const files = fs.readdirSync(reportsPath).map((filename) => {
      const filePath = path.join(reportsPath, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/reports/${filename}`,
        fullUrl: `http://localhost:${PORT}/uploads/reports/${filename}`
      };
    });

    res.json({ 
      reportsPath, 
      count: files.length, 
      files 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/secure-pdf', securePdfRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/teacher-alerts', teacherAlertsRoutes);

// API 404
app.use(/^\/api\/.*$/, (req, res) => {
  res.status(404).json({ error: 'API route not found', path: req.path });
});

// Uploads 404 with helpful debugging
app.use(/^\/uploads\/.*$/, (req, res) => {
  const requestedPath = path.join(
    uploadsPath,
    req.path.replace('/uploads/', '')
  );
  
  console.error('404 for upload:', req.path);
  console.error('   Requested path:', requestedPath);
  console.error('   Exists:', fs.existsSync(requestedPath));
  
  res.status(404).json({
    error: 'File not found',
    requestedPath: req.path,
    fullPath: requestedPath,
    exists: fs.existsSync(requestedPath),
    hint: 'Check /api/debug/list-reports to see available files'
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log('\n================================');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Uploads : ${uploadsPath}`);
  console.log(`Reports : ${reportsPath}`);
  console.log(`PDF iframe embedding : 100% ENABLED`);
  console.log(`Security headers : Conditional (bypassed for PDFs)`);
  console.log(`CORS : Localhost enabled`);
  console.log('================================\n');

  if (fs.existsSync(reportsPath)) {
    const files = fs.readdirSync(reportsPath);
    if (files.length > 0) {
      console.log('Available PDF files:');
      files.forEach((file) => {
        const stats = fs.statSync(path.join(reportsPath, file));
        console.log(`   ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log(`     URL: http://localhost:${PORT}/uploads/reports/${file}`);
      });
      console.log('\nTest in browser or iframe!');
    } else {
      console.log('No PDF files found in reports directory');
    }
  }
  
  console.log('\nDebug endpoints:');
  console.log(`   • http://localhost:${PORT}/api/health`);
  console.log(`   • http://localhost:${PORT}/api/debug/list-reports`);
  console.log(`   • http://localhost:${PORT}/api/test-pdf/FILENAME.pdf\n`);
});

module.exports = app;