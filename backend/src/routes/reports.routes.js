// backend/src/routes/reports.routes.js - COMPLETE FIXED VERSION

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authenticate = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');
const db = require('../db'); // ← REQUIRED

// === MULTER CONFIGURATION ===
const uploadDir = path.join(__dirname, '../uploads/reports');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Upload directory created:', uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// ==================== ROUTES ====================

// ✅ GET ALL COMMENTS ON MY REPORTS (FOR NOTIFICATIONS)
router.get('/my-comments', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(`
      SELECT 
        rc.id AS comment_id,
        rc.content AS comment,
        rc.created_at AS comment_date,
        r.id AS report_id,
        r.title AS report_title,
        u.first_name || ' ' || u.last_name AS teacher_name,
        u.email AS teacher_email,
        COALESCE(rc.is_read, false) AS is_read
      FROM report_comments rc
      JOIN reports r ON rc.report_id = r.id
      JOIN users u ON rc.teacher_id = u.id
      WHERE r.user_id = $1
      ORDER BY rc.created_at DESC
    `, [userId]);

    console.log(`✅ Fetched ${result.rows.length} comments for user ${userId}`);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('❌ Error fetching my-comments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ MARK COMMENT AS READ
router.put('/comments/:commentId/read', authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Verify the comment belongs to a report owned by this user
    const verifyResult = await db.query(`
      SELECT rc.id 
      FROM report_comments rc
      JOIN reports r ON rc.report_id = r.id
      WHERE rc.id = $1 AND r.user_id = $2
    `, [commentId, userId]);

    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized or comment not found' 
      });
    }

    await db.query(
      'UPDATE report_comments SET is_read = true WHERE id = $1',
      [commentId]
    );

    console.log(`✅ Comment ${commentId} marked as read by user ${userId}`);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error marking comment as read:', err);
    res.status(500).json({ success: false });
  }
});

// ✅ DELETE COMMENT (Student can delete notifications on their reports)
router.delete('/comments/:commentId', authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Verify the comment belongs to a report owned by this user
    const verifyResult = await db.query(`
      SELECT rc.id 
      FROM report_comments rc
      JOIN reports r ON rc.report_id = r.id
      WHERE rc.id = $1 AND r.user_id = $2
    `, [commentId, userId]);

    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized or comment not found' 
      });
    }

    await db.query('DELETE FROM report_comments WHERE id = $1', [commentId]);

    console.log(`✅ Comment ${commentId} deleted by user ${userId}`);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting comment:', err);
    res.status(500).json({ success: false });
  }
});

// TEACHER VALIDATION ROUTES
router.get('/assigned-to-me', authenticate, reportController.getAssignedReports);
router.get('/pending-for-teacher', authenticate, reportController.getPendingReports);
router.get('/teacher-stats', authenticate, reportController.getTeacherStats);

// STUDENT ROUTES
router.get('/my-submissions', authenticate, reportController.mySubmissions);
router.post('/submit', authenticate, upload.single('file'), reportController.submit);

// Checklist update route
router.put('/:id/checklist', authenticate, reportController.updateChecklist);

// Validation action (validate/reject/request revision)
router.put('/:id/validate', authenticate, reportController.validateReport);

// COMMENTS SYSTEM
router.post('/:id/comments', authenticate, reportController.addComment);
router.put('/comments/:commentId', authenticate, reportController.updateComment);
router.delete('/comments/:commentId', authenticate, reportController.deleteComment);

// SHARED - Get single report with full details (MUST be last)
router.get('/:id', authenticate, reportController.getReportById);

// Log all registered routes
console.log('📋 Registered Report Routes:');
console.log('  GET    /api/reports/my-comments              ← Student notifications');
console.log('  PUT    /api/reports/comments/:id/read        ← Mark comment as read');
console.log('  DELETE /api/reports/comments/:id             ← Delete notification');
console.log('  GET    /api/reports/assigned-to-me');
console.log('  GET    /api/reports/pending-for-teacher');
console.log('  GET    /api/reports/teacher-stats');
console.log('  GET    /api/reports/my-submissions');
console.log('  POST   /api/reports/submit');
console.log('  PUT    /api/reports/:id/checklist');
console.log('  PUT    /api/reports/:id/validate');
console.log('  POST   /api/reports/:id/comments             ← Add comment');
console.log('  PUT    /api/reports/comments/:commentId');
console.log('  DELETE /api/reports/comments/:commentId');
console.log('  GET    /api/reports/:id');

module.exports = router;