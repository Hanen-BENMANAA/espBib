// routes/reports.routes.js - FINAL
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authenticate = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('PDF uniquement'))
});

// TEACHER
router.get('/assigned-to-me', authenticate, reportController.getAssignedReports);
router.get('/pending-for-teacher', authenticate, reportController.getPendingReports);
router.get('/teacher-stats', authenticate, reportController.getTeacherStats);

router.put('/:id/validate', authenticate, reportController.validateReport);

router.post('/:id/comments', authenticate, reportController.addComment);
router.put('/comments/:commentId', authenticate, reportController.updateComment);
router.delete('/comments/:commentId', authenticate, reportController.deleteComment);

// STUDENT
router.post('/submit', authenticate, upload.single('file'), reportController.submit);
router.get('/my-submissions', authenticate, reportController.mySubmissions);

// SHARED
router.get('/:id', authenticate, reportController.getReportById); // includes comments + history

module.exports = router;