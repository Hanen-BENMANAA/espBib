// backend/routes/reports.routes.js - CLEAN FIXED VERSION
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const authenticate = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
  }
});

// TEACHER ROUTES
router.get('/teacher-stats', authenticate, reportController.teacherStats);
router.get('/pending-for-teacher', authenticate, reportController.pendingForTeacher);
router.get('/assigned-to-me', authenticate, reportController.assignedToMe);
router.put('/:id/validate', authenticate, reportController.validateReport);

// STUDENT ROUTES
router.post('/submit', authenticate, upload.single('file'), reportController.submit);
router.get('/my-submissions', authenticate, reportController.mySubmissions);

// DYNAMIC ROUTE - MUST BE LAST
router.get('/:id', authenticate, reportController.getById);

module.exports = router;