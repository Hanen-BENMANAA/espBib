// backend/server.js - UPDATED WITH USERS ROUTES

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const db = require('./db');
const authRoutes = require('./routes/auth.routes');
const reportsRoutes = require('./routes/reports.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const usersRoutes = require('./routes/users.routes'); // ✨ NEW

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================
app.use(morgan('dev'));

// Helmet with relaxed CSP for PDF viewing
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameAncestors: ["http:", "https:"],
    },
  },
  frameguard: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==================== STATIC FILES ====================
const uploadsPath = path.join(__dirname, 'uploads');

// Check if uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  console.error('❌ UPLOADS DIRECTORY DOES NOT EXIST:', uploadsPath);
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsPath);
} else {
  console.log('✅ Uploads directory exists:', uploadsPath);
}

// Check if reports subdirectory exists
const reportsPath = path.join(uploadsPath, 'reports');
if (!fs.existsSync(reportsPath)) {
  console.error('❌ REPORTS DIRECTORY DOES NOT EXIST:', reportsPath);
  fs.mkdirSync(reportsPath, { recursive: true });
  console.log('✅ Created reports directory:', reportsPath);
} else {
  console.log('✅ Reports directory exists:', reportsPath);
  
  // List files in reports directory
  const files = fs.readdirSync(reportsPath);
  console.log('📁 Files in reports directory:', files.length > 0 ? files : 'EMPTY');
}

// Serve static files from uploads directory
app.use('/uploads', (req, res, next) => {
  console.log(`📄 PDF Request → ${req.originalUrl}`);
  next();
});

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filepath) => {
    console.log(`📤 Serving file: ${filepath}`);
    if (filepath.endsWith('.pdf')) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
    }
  }
}));

// Fallback: if file not found in /uploads, log detailed error
app.use('/uploads/*', (req, res) => {
  const requestedPath = req.originalUrl.replace('/uploads/', '');
  const fullPath = path.join(uploadsPath, requestedPath);
  
  console.error('❌ FILE NOT FOUND');
  console.error('  Requested URL:', req.originalUrl);
  console.error('  Looking for file:', fullPath);
  console.error('  File exists?', fs.existsSync(fullPath));
  
  if (!fs.existsSync(fullPath)) {
    const dir = path.dirname(fullPath);
    console.error('  Parent directory:', dir);
    console.error('  Parent directory exists?', fs.existsSync(dir));
    
    if (fs.existsSync(dir)) {
      const filesInDir = fs.readdirSync(dir);
      console.error('  Files in directory:', filesInDir);
    }
  }
  
  res.status(404).json({ 
    error: 'File not found',
    requested: req.originalUrl,
    path: fullPath
  });
});

// ==================== ROUTES ====================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uploadsPath: uploadsPath
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes); // ✨ NEW

// 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ==================== STARTUP ====================
app.listen(PORT, () => {
  console.log('\n================================');
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads path: ${uploadsPath}`);
  console.log(`📄 Reports path: ${reportsPath}`);
  console.log(`🔧 Notifications system: ACTIVE`);
  console.log(`👤 User management: ACTIVE`); // ✨ NEW
  console.log('================================\n');
});

module.exports = app;