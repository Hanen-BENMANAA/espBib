// backend/routes/users.routes.js
// Simplified version matching your actual database structure

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const authenticate = require('../middleware/auth.middleware');

// ==================== GET USER PROFILE ====================
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT 
        id, 
        email, 
        first_name, 
        last_name, 
        role, 
        created_at
      FROM users 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = result.rows[0];
    
    console.log(`✅ Profile fetched for user ${userId}`);
    
    res.json({
      success: true,
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      created_at: user.created_at
    });

  } catch (err) {
    console.error('❌ Error fetching profile:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// ==================== UPDATE USER PROFILE ====================
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name } = req.body;

    // Validate required fields
    if (!first_name?.trim() || !last_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    const result = await db.query(
      `UPDATE users 
       SET first_name = $1, 
           last_name = $2
       WHERE id = $3
       RETURNING id, email, first_name, last_name, role, created_at`,
      [
        first_name.trim(),
        last_name.trim(),
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log(`✅ Profile updated for user ${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error updating profile:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// ==================== CHANGE PASSWORD ====================
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get current user
    const userResult = await db.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, userId]
    );

    console.log(`✅ Password changed for user ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (err) {
    console.error('❌ Error changing password:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// ==================== GET USER STATS (Optional) ====================
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {
      totalReports: 0,
      pendingReports: 0,
      validatedReports: 0,
      rejectedReports: 0
    };

    if (userRole === 'student') {
      // Student stats
      const result = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending_validation') as pending,
          COUNT(*) FILTER (WHERE status = 'validated') as validated,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM reports 
        WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length > 0) {
        stats = {
          totalReports: parseInt(result.rows[0].total) || 0,
          pendingReports: parseInt(result.rows[0].pending) || 0,
          validatedReports: parseInt(result.rows[0].validated) || 0,
          rejectedReports: parseInt(result.rows[0].rejected) || 0
        };
      }
    } else if (userRole === 'teacher') {
      // Teacher stats
      const result = await db.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending_validation') as pending,
          COUNT(*) FILTER (WHERE status = 'validated') as validated,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM reports 
        WHERE supervisor_id = $1 OR co_supervisor_id = $1`,
        [userId]
      );

      if (result.rows.length > 0) {
        stats = {
          totalReports: parseInt(result.rows[0].total) || 0,
          pendingReports: parseInt(result.rows[0].pending) || 0,
          validatedReports: parseInt(result.rows[0].validated) || 0,
          rejectedReports: parseInt(result.rows[0].rejected) || 0
        };
      }
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (err) {
    console.error('❌ Error fetching user stats:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

module.exports = router;