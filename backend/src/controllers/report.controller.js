// backend/src/controllers/report.controller.js - CLEAN VERSION 2025

const db = require('../db');
const path = require('path');

console.log('REPORT CONTROLLER LOADED - READY');

/* ======================== STUDENT ======================== */
async function submit(req, res, next) {
  try {
    console.log('📝 New report submission from user:', req.user.id);

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'PDF file is required' 
      });
    }

    const userId = req.user.id;

    const {
      title,
      authorFirstName,
      authorLastName,
      studentNumber,
      email,
      specialty,
      academicYear,
      supervisor,
      coSupervisor,
      hostCompany,
      defenseDate,
      keywords,
      abstract,
      allowPublicAccess,
      isConfidential,
      checklist
    } = req.body;

    // Validation
    if (!title?.trim() || !authorFirstName?.trim() || !authorLastName?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, first name, and last name are required' 
      });
    }

    // Find supervisor IDs
    let supervisorId = null;
    let coSupervisorId = null;

    if (supervisor?.trim()) {
      const resSup = await db.query(
        `SELECT id FROM users 
         WHERE LOWER(TRIM(first_name || ' ' || last_name)) = LOWER(TRIM($1))
           AND role = 'teacher' 
         LIMIT 1`,
        [supervisor.trim()]
      );
      supervisorId = resSup.rows[0]?.id || null;
    }

    if (coSupervisor?.trim()) {
      const resCo = await db.query(
        `SELECT id FROM users 
         WHERE LOWER(TRIM(first_name || ' ' || last_name)) = LOWER(TRIM($1))
           AND role = 'teacher' 
         LIMIT 1`,
        [coSupervisor.trim()]
      );
      coSupervisorId = resCo.rows[0]?.id || null;
    }

    // File paths
    const fileName = req.file.filename;
    const fileUrl = `/uploads/reports/${fileName}`;
    const filePath = `uploads/reports/${fileName}`;

    const result = await db.query(
      `INSERT INTO reports (
        user_id, title, author_first_name, author_last_name, student_number, email,
        specialty, academic_year, supervisor_id, co_supervisor_id,
        host_company, defense_date, keywords, abstract,
        allow_public_access, is_confidential,
        file_name, file_path, file_size, file_url,
        status, checklist, submission_date, last_modified
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, NOW(), NOW()
      ) RETURNING *`,
      [
        userId,
        title.trim(),
        authorFirstName.trim(),
        authorLastName.trim(),
        studentNumber || null,
        email,
        specialty || null,
        academicYear || null,
        supervisorId,
        coSupervisorId,
        hostCompany || null,
        defenseDate || null,
        keywords ? JSON.parse(keywords) : [],
        abstract || '',
        allowPublicAccess === 'true' || allowPublicAccess === true,
        isConfidential === 'true',
        req.file.originalname,
        filePath,
        req.file.size,
        fileUrl,
        'pending_validation',
        checklist ? JSON.parse(checklist) : {}
      ]
    );

    console.log('✅ Report submitted successfully! ID:', result.rows[0].id);

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully!',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error during submission:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during submission',
      error: err.message
    });
  }
}
async function mySubmissions(req, res, next) {
  try {
    const result = await db.query(
      `SELECT r.*, u.email AS student_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.user_id = $1
       ORDER BY submission_date DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

/* ======================== TEACHER ======================== */
async function getAssignedReports(req, res, next) {
  try {
    const result = await db.query(
      `SELECT 
         r.*,
         u.first_name AS author_first_name, 
         u.last_name AS author_last_name,
         u.email AS student_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE r.supervisor_id = $1 OR r.co_supervisor_id = $1
       ORDER BY r.submission_date DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function getPendingReports(req, res, next) {
  try {
    const result = await db.query(
      `SELECT 
         r.*,
         u.first_name AS author_first_name, 
         u.last_name AS author_last_name,
         u.email AS student_email
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE (r.supervisor_id = $1 OR r.co_supervisor_id = $1)
         AND r.status = 'pending_validation'
       ORDER BY r.submission_date ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

async function getTeacherStats(req, res, next) {
  try {
    const result = await db.query(
      `SELECT 
         COUNT(*) FILTER (WHERE supervisor_id = $1 OR co_supervisor_id = $1) AS total_assigned,
         COUNT(*) FILTER (WHERE (supervisor_id = $1 OR co_supervisor_id = $1) AND status = 'pending_validation') AS pending_validation,
         COUNT(*) FILTER (WHERE (supervisor_id = $1 OR co_supervisor_id = $1) AND status = 'validated') AS validated,
         COUNT(*) FILTER (WHERE (supervisor_id = $1 OR co_supervisor_id = $1) AND status = 'rejected') AS rejected
       FROM reports`,
      [req.user.id]
    );
    const s = result.rows[0];
    res.json({
      success: true,
      data: {
        total_assigned: parseInt(s.total_assigned) || 0,
        pending_validation: parseInt(s.pending_validation) || 0,
        validated: parseInt(s.validated) || 0,
        rejected: parseInt(s.rejected) || 0
      }
    });
  } catch (err) {
    next(err);
  }
}

async function validateReport(req, res, next) {
  const { id } = req.params;
  const { decision, comments = '' } = req.body;
  const teacherId = req.user.id;

  const validActions = ['validated', 'rejected', 'revision_requested'];
  if (!validActions.includes(decision)) {
    return res.status(400).json({ success: false, message: 'Invalid action' });
  }

  try {
    await db.query('BEGIN');

    await db.query(
      `UPDATE reports 
       SET status = $1, validated_at = NOW(), validated_by = $2 
       WHERE id = $3`,
      [decision, teacherId, id]
    );

    await db.query(
      `INSERT INTO report_validations (report_id, teacher_id, action, message)
       VALUES ($1, $2, $3, $4)`,
      [id, teacherId, decision, comments]
    );

    await db.query('COMMIT');
    res.json({ success: true, message: 'Decision recorded' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Validation error:', err);
    next(err);
  }
}

/* ======================== COMMENTS ======================== */
async function addComment(req, res, next) {
  const { id } = req.params;
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Comment is empty' });

  try {
    const result = await db.query(
      `INSERT INTO report_comments (report_id, teacher_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [id, req.user.id, content.trim()]
    );

    const teacher = await db.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [req.user.id]);
    const teacherName = teacher.rows[0] ? `${teacher.rows[0].first_name} ${teacher.rows[0].last_name}` : 'Teacher';

    res.json({
      success: true,
      data: { ...result.rows[0], teacher_name: teacherName }
    });
  } catch (err) {
    next(err);
  }
}

async function updateComment(req, res, next) {
  const { commentId } = req.params;
  const { content } = req.body;
  try {
    const result = await db.query(
      `UPDATE report_comments 
       SET content = $1, updated_at = NOW()
       WHERE id = $2 AND teacher_id = $3
       RETURNING id, content, created_at, updated_at`,
      [content.trim(), commentId, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  const { commentId } = req.params;
  try {
    const result = await db.query(
      `DELETE FROM report_comments WHERE id = $1 AND teacher_id = $2`,
      [commentId, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
}

/* ======================== GET REPORT DETAIL ======================== */
async function getReportById(req, res, next) {
  const { id } = req.params;

  try {
    const reportRes = await db.query(
      `SELECT 
         r.*,
         u.first_name AS author_first_name,
         u.last_name AS author_last_name,
         u.email AS student_email,
         COALESCE(s.first_name || ' ' || s.last_name, 'Not assigned') AS supervisor_name,
         c.first_name || ' ' || c.last_name AS co_supervisor_name
       FROM reports r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users s ON r.supervisor_id = s.id
       LEFT JOIN users c ON r.co_supervisor_id = c.id
       WHERE r.id = $1`,
      [id]
    );

    if (reportRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    const report = reportRes.rows[0];

    // 🔥 DEBUG LOG
    console.log('\n=== SENDING REPORT TO FRONTEND ===');
    console.log('Report ID:', report.id);
    console.log('Title:', report.title);
    console.log('file_name:', report.file_name);
    console.log('file_url:', report.file_url);
    console.log('file_path:', report.file_path);
    console.log('==================================\n');

    const comments = await db.query(
      `SELECT c.*, t.first_name || ' ' || t.last_name AS teacher_name
       FROM report_comments c
       JOIN users t ON c.teacher_id = t.id
       WHERE c.report_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    const history = await db.query(
      `SELECT v.*, t.first_name || ' ' || t.last_name AS teacher_name
       FROM report_validations v
       JOIN users t ON v.teacher_id = t.id
       WHERE v.report_id = $1
       ORDER BY v.created_at DESC`,
      [id]
    );

    report.comments = comments.rows;
    report.validation_history = history.rows;

    res.json({ success: true, data: report });
  } catch (err) {
    console.error('❌ Error getReportById:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

/* ======================== EXPORTS ======================== */
module.exports = {
  submit,
  mySubmissions,
  getAssignedReports,
  getPendingReports,
  getTeacherStats,
  validateReport,
  addComment,
  updateComment,
  deleteComment,
  getReportById
};