// backend/src/routes/notifications.routes.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticate = require('../middleware/auth.middleware');

// Get all notifications for the current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT n.*, r.title AS report_title 
       FROM notifications n 
       LEFT JOIN reports r ON n.related_report_id = r.id 
       WHERE n.user_id = $1 
       ORDER BY n.created_at DESC`,
      [userId]
    );

    const unreadCount = await db.query(
      `SELECT COUNT(*) AS unread_count 
       FROM notifications 
       WHERE user_id = $1 AND read = false`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        unread_count: parseInt(unreadCount.rows[0].unread_count)
      }
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get only unread count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT COUNT(*) AS unread_count 
       FROM notifications 
       WHERE user_id = $1 AND read = false`,
      [userId]
    );

    const count = parseInt(result.rows[0].unread_count) || 0;

    res.json({
      success: true,
      data: { unread_count: count }
    });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ success: false });
  }
});

// Mark all as read
router.put('/mark-all-read', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query(`UPDATE notifications SET read = true WHERE user_id = $1`, [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
 

module.exports = router;