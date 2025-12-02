// backend/src/routes/reports.routes.js - COMPLETE FIXED VERSION

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const authenticate = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');
const db = require('../db');

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
// ⚠️ CRITICAL: Specific routes MUST come BEFORE parameterized routes (/:id)

// ✅ STUDENT - Get comments on my reports (for notifications)
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

// ✅ TEACHER - Get alerts for new reports (using teacher_alerts table)
router.get('/my-teacher-notifications', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(`
      SELECT 
        ta.id AS notification_id,
        ta.type,
        ta.title,
        ta.message,
        ta.created_at,
        ta.read AS is_read,
        ta.related_report_id AS report_id,
        r.title AS report_title,
        ta.student_name,
        u.email AS student_email
      FROM teacher_alerts ta
      JOIN reports r ON ta.related_report_id = r.id
      JOIN users u ON ta.student_id = u.id
      WHERE ta.teacher_id = $1
      ORDER BY ta.created_at DESC
    `, [userId]);

    console.log(`✅ Fetched ${result.rows.length} teacher alerts for user ${userId}`);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('❌ Error fetching teacher alerts:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// TEACHER ROUTES - Specific paths
router.get('/assigned-to-me', authenticate, reportController.getAssignedReports);
router.get('/pending-for-teacher', authenticate, reportController.getPendingReports);
router.get('/teacher-stats', authenticate, reportController.getTeacherStats);

// STUDENT ROUTES - Specific paths
router.get('/my-submissions', authenticate, reportController.mySubmissions);
router.post('/submit', authenticate, upload.single('file'), reportController.submit);

// ✅ MARK COMMENT AS READ
router.put('/comments/:commentId/read', authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

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

// ✅ MARK TEACHER NOTIFICATION AS READ (using teacher_alerts table)
router.put('/notifications/:notificationId/read', authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const verifyResult = await db.query(
      'SELECT id FROM teacher_alerts WHERE id = $1 AND teacher_id = $2',
      [notificationId, userId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized or alert not found' 
      });
    }

    await db.query(
      'UPDATE teacher_alerts SET read = true WHERE id = $1',
      [notificationId]
    );

    console.log(`✅ Teacher alert ${notificationId} marked as read by user ${userId}`);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error marking alert as read:', err);
    res.status(500).json({ success: false });
  }
});

// ✅ DELETE COMMENT (Student can delete notifications on their reports)
router.delete('/comments/:commentId', authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

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

// ✅ DELETE TEACHER NOTIFICATION (using teacher_alerts table)
router.delete('/notifications/:notificationId', authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const verifyResult = await db.query(
      'SELECT id FROM teacher_alerts WHERE id = $1 AND teacher_id = $2',
      [notificationId, userId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized or alert not found' 
      });
    }

    await db.query('DELETE FROM teacher_alerts WHERE id = $1', [notificationId]);

    console.log(`✅ Teacher alert ${notificationId} deleted by user ${userId}`);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting alert:', err);
    res.status(500).json({ success: false });
  }
});

// CHECKLIST & VALIDATION - With dynamic IDs
router.put('/:id/checklist', authenticate, reportController.updateChecklist);
router.put('/:id/validate', authenticate, reportController.validateReport);

// COMMENTS SYSTEM - With dynamic IDs
router.post('/:id/comments', authenticate, reportController.addComment);
router.put('/comments/:commentId', authenticate, reportController.updateComment);
router.delete('/comments/:commentId', authenticate, reportController.deleteComment);

// ⚠️ THIS MUST BE LAST - Generic /:id route
router.get('/:id', authenticate, reportController.getReportById);

// Log all registered routes
console.log('📋 Registered Report Routes (in correct order):');
console.log('  1.  GET    /api/reports/my-comments');
console.log('  2.  GET    /api/reports/my-teacher-notifications    ← TEACHER NOTIF');
console.log('  3.  GET    /api/reports/assigned-to-me');
console.log('  4.  GET    /api/reports/pending-for-teacher');
console.log('  5.  GET    /api/reports/teacher-stats');
console.log('  6.  GET    /api/reports/my-submissions');
console.log('  7.  POST   /api/reports/submit');
console.log('  8.  PUT    /api/reports/comments/:commentId/read');
console.log('  9.  PUT    /api/reports/notifications/:id/read');
console.log('  10. DELETE /api/reports/comments/:commentId');
console.log('  11. DELETE /api/reports/notifications/:id');
console.log('  12. PUT    /api/reports/:id/checklist');
console.log('  13. PUT    /api/reports/:id/validate');
console.log('  14. POST   /api/reports/:id/comments');
console.log('  15. PUT    /api/reports/comments/:commentId');
console.log('  16. DELETE /api/reports/comments/:commentId');
console.log('  17. GET    /api/reports/:id                        ← MUST BE LAST');

module.exports = router;