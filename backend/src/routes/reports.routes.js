// backend/src/routes/reports.routes.js - CLEAN VERSION 2025

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authenticate = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');

// === MULTER CONFIGURATION - SIMPLE & CLEAN ===
const uploadDir = path.join(__dirname, '../uploads/reports');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created:', uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  
  filename: (req, file, cb) => {
    // Keep original filename with timestamp prefix
    // Example: "1732734567890-My-Report.pdf"
    const timestamp = Date.now();
    const originalName = file.originalname
      .replace(/\s+/g, '-')           // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9.-]/g, '_'); // Replace special chars with underscore
    
    const finalName = `${timestamp}-${originalName}`;
    
    console.log(`📄 File: "${file.originalname}" → "${finalName}"`);
    cb(null, finalName);
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024  // 50 MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// ==================== ROUTES ====================

// TEACHER ROUTES
router.get('/assigned-to-me', authenticate, reportController.getAssignedReports);
router.get('/pending-for-teacher', authenticate, reportController.getPendingReports);
router.get('/teacher-stats', authenticate, reportController.getTeacherStats);
router.put('/:id/validate', authenticate, reportController.validateReport);

// COMMENTS
router.post('/:id/comments', authenticate, reportController.addComment);
router.put('/comments/:commentId', authenticate, reportController.updateComment);
router.delete('/comments/:commentId', authenticate, reportController.deleteComment);

// STUDENT ROUTES
router.post('/submit', authenticate, upload.single('file'), reportController.submit);
router.get('/my-submissions', authenticate, reportController.mySubmissions);

// SHARED
router.get('/:id', authenticate, reportController.getReportById);

module.exports = router;