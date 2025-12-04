// backend/src/routes/reports.routes.js - FIXED PUBLIC ROUTES

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

// ==================== PUBLIC ROUTES (NO AUTH) ====================
// ⚠️ CRITICAL: These MUST be BEFORE any authenticated routes

console.log('📚 Registering PUBLIC library routes...');

// ✅ PUBLIC LIBRARY STATS (No authentication)
router.get('/public-library/stats', async (req, res) => {
  console.log('📊 [PUBLIC] Fetching library stats...');
  
  try {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE 
          WHEN DATE_TRUNC('month', validated_at) = DATE_TRUNC('month', CURRENT_DATE) 
          THEN 1 
        END) as new_this_month,
        COUNT(DISTINCT specialty) as active_specialties
      FROM reports 
      WHERE status = 'validated' 
        AND allow_public_access = true
    `);

    const stats = {
      total_reports: parseInt(result.rows[0].total_reports) || 0,
      new_this_month: parseInt(result.rows[0].new_this_month) || 0,
      active_specialties: parseInt(result.rows[0].active_specialties) || 0
    };

    console.log('✅ [PUBLIC] Stats:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (err) {
    console.error('❌ [PUBLIC] Error fetching stats:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// ✅ PUBLIC LIBRARY CATALOG (No authentication)
router.get('/public-library', async (req, res) => {
  console.log('📚 [PUBLIC] Fetching library reports...');
  console.log('📝 [PUBLIC] Query params:', req.query);
  
  try {
    const { 
      search, 
      academicYear, 
      specialty, 
      supervisor, 
      company, 
      sortBy = 'date_desc',
      page = 1,
      limit = 12 
    } = req.query;

    let query = `
      SELECT 
        r.id,
        r.title,
        r.author_first_name,
        r.author_last_name,
        r.author_first_name || ' ' || r.author_last_name AS author_name,
        r.student_number,
        r.specialty,
        r.academic_year,
        r.host_company,
        r.keywords,
        r.abstract,
        r.submission_date,
        r.validated_at,
        r.file_url,
        r.file_name,
        s.first_name || ' ' || s.last_name AS supervisor_name,
        cs.first_name || ' ' || cs.last_name AS co_supervisor_name,
        0 as view_count,
        0 as favorite_count,
        0 as download_count
      FROM reports r
      LEFT JOIN users s ON r.supervisor_id = s.id
      LEFT JOIN users cs ON r.co_supervisor_id = cs.id
      WHERE r.status = 'validated' 
        AND r.allow_public_access = true
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Search filter
    if (search) {
      query += ` AND (
        LOWER(r.title) LIKE LOWER($${paramIndex}) OR
        LOWER(r.abstract) LIKE LOWER($${paramIndex}) OR
        LOWER(r.author_first_name || ' ' || r.author_last_name) LIKE LOWER($${paramIndex})
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Academic year filter
    if (academicYear) {
      query += ` AND r.academic_year = $${paramIndex}`;
      queryParams.push(academicYear);
      paramIndex++;
    }

    // Specialty filter
    if (specialty) {
      query += ` AND LOWER(r.specialty) = LOWER($${paramIndex})`;
      queryParams.push(specialty);
      paramIndex++;
    }

    // Supervisor filter
    if (supervisor) {
      query += ` AND (
        LOWER(s.first_name || ' ' || s.last_name) LIKE LOWER($${paramIndex}) OR
        LOWER(cs.first_name || ' ' || cs.last_name) LIKE LOWER($${paramIndex})
      )`;
      queryParams.push(`%${supervisor}%`);
      paramIndex++;
    }

    // Company filter
    if (company) {
      query += ` AND LOWER(r.host_company) LIKE LOWER($${paramIndex})`;
      queryParams.push(`%${company}%`);
      paramIndex++;
    }

    // Sorting
    switch (sortBy) {
      case 'date_desc':
        query += ' ORDER BY r.validated_at DESC NULLS LAST';
        break;
      case 'date_asc':
        query += ' ORDER BY r.validated_at ASC NULLS LAST';
        break;
      case 'title_asc':
        query += ' ORDER BY r.title ASC';
        break;
      case 'title_desc':
        query += ' ORDER BY r.title DESC';
        break;
      case 'popularity':
        query += ' ORDER BY view_count DESC';
        break;
      default:
        query += ' ORDER BY r.validated_at DESC';
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    console.log('🔍 [PUBLIC] Executing query with params:', queryParams);

    // Execute query
    const result = await db.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM reports r
      LEFT JOIN users s ON r.supervisor_id = s.id
      LEFT JOIN users cs ON r.co_supervisor_id = cs.id
      WHERE r.status = 'validated' 
        AND r.allow_public_access = true
    `;

    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (
        LOWER(r.title) LIKE LOWER($${countParamIndex}) OR
        LOWER(r.abstract) LIKE LOWER($${countParamIndex}) OR
        LOWER(r.author_first_name || ' ' || r.author_last_name) LIKE LOWER($${countParamIndex})
      )`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (academicYear) {
      countQuery += ` AND r.academic_year = $${countParamIndex}`;
      countParams.push(academicYear);
      countParamIndex++;
    }

    if (specialty) {
      countQuery += ` AND LOWER(r.specialty) = LOWER($${countParamIndex}`;
      countParams.push(specialty);
      countParamIndex++;
    }

    if (supervisor) {
      countQuery += ` AND (
        LOWER(s.first_name || ' ' || s.last_name) LIKE LOWER($${countParamIndex}) OR
        LOWER(cs.first_name || ' ' || cs.last_name) LIKE LOWER($${countParamIndex})
      )`;
      countParams.push(`%${supervisor}%`);
      countParamIndex++;
    }

    if (company) {
      countQuery += ` AND LOWER(r.host_company) LIKE LOWER($${countParamIndex})`;
      countParams.push(`%${company}%`);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].total);

    console.log(`✅ [PUBLIC] Found ${result.rows.length} reports (${totalCount} total)`);

    res.json({
      success: true,
      data: {
        reports: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalResults: totalCount,
          resultsPerPage: parseInt(limit)
        }
      }
    });

  } catch (err) {
    console.error('❌ [PUBLIC] Error fetching reports:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

// ✅ PUBLIC REPORT DETAILS (No authentication)
router.get('/public-library/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`📄 [PUBLIC] Fetching report ${id}...`);

  try {
    const result = await db.query(`
      SELECT 
        r.*,
        s.first_name || ' ' || s.last_name AS supervisor_name,
        cs.first_name || ' ' || cs.last_name AS co_supervisor_name,
        v.first_name || ' ' || v.last_name AS validated_by_name,
        0 as view_count,
        0 as favorite_count,
        0 as download_count
      FROM reports r
      LEFT JOIN users s ON r.supervisor_id = s.id
      LEFT JOIN users cs ON r.co_supervisor_id = cs.id
      LEFT JOIN users v ON r.validated_by = v.id
      WHERE r.id = $1 
        AND r.status = 'validated'
        AND r.allow_public_access = true
    `, [id]);

    if (result.rows.length === 0) {
      console.log(`❌ [PUBLIC] Report ${id} not found or not public`);
      return res.status(404).json({
        success: false,
        message: 'Report not found or not publicly accessible'
      });
    }

    console.log(`✅ [PUBLIC] Found report: ${result.rows[0].title}`);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    console.error('❌ [PUBLIC] Error fetching report:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: err.message 
    });
  }
});

console.log('✅ Public library routes registered (NO AUTH REQUIRED)');

// ==================== AUTHENTICATED ROUTES ====================
console.log('🔒 Registering AUTHENTICATED routes...');

// Student routes
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

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('❌ Error fetching my-comments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('❌ Error fetching teacher alerts:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/assigned-to-me', authenticate, reportController.getAssignedReports);
router.get('/pending-for-teacher', authenticate, reportController.getPendingReports);
router.get('/teacher-stats', authenticate, reportController.getTeacherStats);
router.get('/my-submissions', authenticate, reportController.mySubmissions);
router.post('/submit', authenticate, upload.single('file'), reportController.submit);

// Mark as read routes
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

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error marking comment as read:', err);
    res.status(500).json({ success: false });
  }
});

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

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error marking alert as read:', err);
    res.status(500).json({ success: false });
  }
});

// Delete routes
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
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting comment:', err);
    res.status(500).json({ success: false });
  }
});

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
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting alert:', err);
    res.status(500).json({ success: false });
  }
});

// Validation routes
router.put('/:id/checklist', authenticate, reportController.updateChecklist);
router.put('/:id/validate', authenticate, reportController.validateReport);
router.post('/:id/comments', authenticate, reportController.addComment);
router.put('/comments/:commentId', authenticate, reportController.updateComment);
router.delete('/comments/:commentId', authenticate, reportController.deleteComment);

// ⚠️ Generic /:id route MUST BE LAST
router.get('/:id', authenticate, reportController.getReportById);

console.log('✅ All report routes registered');
console.log('📋 Route summary:');
console.log('  - PUBLIC (no auth): /public-library, /public-library/stats, /public-library/:id');
console.log('  - PROTECTED (auth): all other routes');

module.exports = router;