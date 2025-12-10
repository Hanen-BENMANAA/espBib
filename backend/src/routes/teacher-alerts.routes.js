// backend/src/routes/teacher-alerts.routes.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticate = require('../middleware/auth.middleware');

// GET all alerts for current teacher
router.get('/', authenticate, async (req, res) => {
  try {
    const teacherId = req.user.id;
    console.log('🔍 Fetching alerts for teacher ID:', teacherId);

    const result = await db.query(
      `SELECT
         ta.*,
         r.title AS report_title,
         u.first_name || ' ' || u.last_name AS student_name
       FROM teacher_alerts ta
       JOIN reports r ON ta.related_report_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE ta.teacher_id = $1
       ORDER BY ta.created_at DESC`,
      [teacherId]
    );

    const unreadCount = await db.query(
      `SELECT COUNT(*) FROM teacher_alerts WHERE teacher_id = $1 AND read = false`,
      [teacherId]
    );

    console.log('✅ Found alerts:', result.rows.length, 'Unread count:', unreadCount.rows[0].count);

    res.json({
      success: true,
      data: {
        alerts: result.rows,
        unread_count: parseInt(unreadCount.rows[0].count) || 0
      }
    });
  } catch (err) {
    console.error('❌ Error fetching teacher alerts:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    await db.query(
      `UPDATE teacher_alerts SET read = true WHERE id = $1 AND teacher_id = $2`,
      [id, teacherId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking teacher alert as read:', err);
    res.status(500).json({ success: false });
  }
});

// Delete alert
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    await db.query(
      `DELETE FROM teacher_alerts WHERE id = $1 AND teacher_id = $2`,
      [id, teacherId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting teacher alert:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;