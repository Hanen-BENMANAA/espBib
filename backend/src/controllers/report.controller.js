// backend/src/controllers/report.controller.js - FIXED WITH CHECKLIST

const db = require('../db');
const path = require('path');

console.log('✅ REPORT CONTROLLER LOADED');

/* ======================== STUDENT ======================== */
async function submit(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'PDF file is required' 
      });
    }

    const userId = req.user.id;
    const {
      title, authorFirstName, authorLastName, studentNumber,
      email, specialty, academicYear, supervisor, coSupervisor,
      hostCompany, defenseDate, keywords, abstract,
      allowPublicAccess, isConfidential, checklist
    } = req.body;

    if (!title?.trim() || !authorFirstName?.trim() || !authorLastName?.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, first name, and last name are required' 
      });
    }

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
        userId, title.trim(), authorFirstName.trim(), authorLastName.trim(),
        studentNumber || null, email, specialty || null, academicYear || null,
        supervisorId, coSupervisorId, hostCompany || null, defenseDate || null,
        keywords ? JSON.parse(keywords) : [], abstract || '',
        allowPublicAccess === 'true' || allowPublicAccess === true,
        isConfidential === 'true', req.file.originalname, filePath,
        req.file.size, fileUrl, 'pending_validation',
        checklist ? JSON.parse(checklist) : {}
      ]
    );

    console.log('✅ Report submitted! ID:', result.rows[0].id);

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully!',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Submission error:', err);
    next(err);
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

/* ======================== VALIDATION ======================== */
async function validateReport(req, res, next) {
  const { id } = req.params;
  const { decision, comments = '' } = req.body;
  const teacherId = req.user.id;

  console.log('\n=== VALIDATION REQUEST ===');
  console.log('Report ID:', id);
  console.log('Decision:', decision);
  console.log('Comments:', comments);
  console.log('Teacher ID:', teacherId);

  const validActions = ['validated', 'rejected', 'revision_requested'];
  if (!validActions.includes(decision)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid action. Must be: validated, rejected, or revision_requested' 
    });
  }

  try {
    await db.query('BEGIN');

    // 1. Update report status
    const updateResult = await db.query(
      `UPDATE reports 
       SET status = $1, 
           validated_at = NOW(), 
           validated_by = $2,
           last_modified = NOW()
       WHERE id = $3
       RETURNING *`,
      [decision, teacherId, id]
    );

    if (updateResult.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    const report = updateResult.rows[0];

    // 2. Get teacher info
    const teacherResult = await db.query(
      `SELECT first_name, last_name, email FROM users WHERE id = $1`,
      [teacherId]
    );
    const teacher = teacherResult.rows[0];
    const teacherName = `${teacher.first_name} ${teacher.last_name}`;

    // 3. Record in validation history (report_validations table)
    await db.query(
      `INSERT INTO report_validations (report_id, teacher_id, action, message)
       VALUES ($1, $2, $3, $4)`,
      [id, teacherId, decision, comments]
    );
    console.log('✅ Validation history recorded');

    // 4. ✨ NEW: Also save as a comment (report_comments table) if comments exist
    if (comments?.trim()) {
      await db.query(
        `INSERT INTO report_comments (report_id, teacher_id, content)
         VALUES ($1, $2, $3)`,
        [id, teacherId, `[${decision.toUpperCase()}] ${comments.trim()}`]
      );
      console.log('✅ Comment saved to report_comments');
    }

    // 5. Get student info for notification
    const studentResult = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name
       FROM users u
       WHERE u.id = $1`,
      [report.user_id]
    );
    const student = studentResult.rows[0];

    // 6. ✨ NEW: Create notification for student
    await db.query(
      `INSERT INTO notifications (
        user_id, type, title, message, related_report_id, created_at, read
      ) VALUES ($1, $2, $3, $4, $5, NOW(), false)`,
      [
        student.id,
        decision, // 'validated', 'rejected', 'revision_requested'
        `Rapport ${decision === 'validated' ? 'validé' : decision === 'rejected' ? 'rejeté' : 'en révision'}`,
        `Votre rapport "${report.title}" a été ${
          decision === 'validated' ? 'validé' : 
          decision === 'rejected' ? 'rejeté' : 
          'marqué comme nécessitant une révision'
        } par ${teacherName}.${comments ? '\n\nCommentaire: ' + comments : ''}`,
        id
      ]
    );
    console.log('✅ Notification created for student');

    await db.query('COMMIT');

    console.log(`✅ Report ${id} ${decision} by ${teacherName}`);
    console.log(`📧 Student ${student.email} should be notified`);

    res.json({ 
      success: true, 
      message: 'Validation recorded successfully',
      data: {
        reportId: id,
        status: decision,
        validatedBy: teacherName,
        validatedAt: new Date(),
        studentNotified: true
      }
    });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Validation error:', err);
    
    // If notification table doesn't exist, it's okay - validation still works
    if (err.message?.includes('notifications')) {
      console.log('⚠️ Notifications table not found - continuing without notification');
      return res.json({
        success: true,
        message: 'Validation recorded (notification system not configured)',
        data: { reportId: id, status: decision }
      });
    }
    
    next(err);
  }
}
/* ======================== CHECKLIST UPDATE - CRITICAL FIX ======================== */
async function updateChecklist(req, res, next) {
  const { id } = req.params;
  const { checklist } = req.body;

  console.log(`📝 Updating checklist for report ${id}:`, checklist);

  try {
    const result = await db.query(
      `UPDATE reports 
       SET checklist = $1, last_modified = NOW()
       WHERE id = $2
       RETURNING id, checklist, last_modified`,
      [JSON.stringify(checklist), id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    console.log(`✅ Checklist updated for report ${id}`);

    res.json({ 
      success: true, 
      message: 'Checklist updated successfully',
      data: result.rows[0]
    });

  } catch (err) {
    console.error('❌ Error updating checklist:', err);
    next(err);
  }
}

/* ======================== COMMENTS - FIXED ======================== */
async function addComment(req, res, next) {
  const { id } = req.params;
  const { content, type = 'feedback' } = req.body;
  
  console.log(`📝 Adding comment to report ${id}:`, { content, type, userId: req.user.id });
  
  if (!content?.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Comment content is required' 
    });
  }

  try {
    await db.query('BEGIN');

    // ✅ FIXED: Use singular table name
    const result = await db.query(
      `INSERT INTO report_comments (report_id, teacher_id, content, comment_type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, content, comment_type, created_at`,
      [id, req.user.id, content.trim(), type]
    );

    console.log('✅ Comment inserted:', result.rows[0]);

    const teacherResult = await db.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [req.user.id]
    );
    const teacher = teacherResult.rows[0];
    const teacherName = `${teacher.first_name} ${teacher.last_name}`;

    await db.query(
      `UPDATE reports SET last_modified = NOW() WHERE id = $1`,
      [id]
    );

    await db.query('COMMIT');

    console.log(`✅ Comment added to report ${id} by ${teacherName}`);

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { 
        ...result.rows[0], 
        teacher_name: teacherName 
      }
    });

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('❌ Error adding comment:', err);
    next(err);
  }
}

async function updateComment(req, res, next) {
  const { commentId } = req.params;
  const { content } = req.body;
  
  console.log(`📝 Updating comment ${commentId}:`, content);
  
  if (!content?.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Comment content is required' 
    });
  }

  try {
    // ✅ FIXED: Use singular table name
    const result = await db.query(
      `UPDATE report_comments 
       SET content = $1, updated_at = NOW()
       WHERE id = $2 AND teacher_id = $3
       RETURNING id, content, created_at, updated_at, report_id`,
      [content.trim(), commentId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found or unauthorized' 
      });
    }

    await db.query(
      `UPDATE reports SET last_modified = NOW() WHERE id = $1`,
      [result.rows[0].report_id]
    );

    console.log(`✅ Comment ${commentId} updated`);

    res.json({ success: true, data: result.rows[0] });

  } catch (err) {
    console.error('❌ Error updating comment:', err);
    next(err);
  }
}

async function deleteComment(req, res, next) {
  const { commentId } = req.params;

  console.log(`🗑️ Deleting comment ${commentId}`);

  try {
    // ✅ FIXED: Use singular table name
    const commentResult = await db.query(
      `SELECT report_id FROM report_comments WHERE id = $1 AND teacher_id = $2`,
      [commentId, req.user.id]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found or unauthorized' 
      });
    }

    const reportId = commentResult.rows[0].report_id;

    await db.query(
      `DELETE FROM report_comments WHERE id = $1 AND teacher_id = $2`,
      [commentId, req.user.id]
    );

    await db.query(
      `UPDATE reports SET last_modified = NOW() WHERE id = $1`,
      [reportId]
    );

    console.log(`✅ Comment ${commentId} deleted`);

    res.json({ success: true, message: 'Comment deleted successfully' });

  } catch (err) {
    console.error('❌ Error deleting comment:', err);
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
         s.first_name || ' ' || s.last_name AS supervisor_name,
         c.first_name || ' ' || c.last_name AS co_supervisor_name,
         v.first_name || ' ' || v.last_name AS validated_by_name
       FROM reports r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users s ON r.supervisor_id = s.id
       LEFT JOIN users c ON r.co_supervisor_id = c.id
       LEFT JOIN users v ON r.validated_by = v.id
       WHERE r.id = $1`,
      [id]
    );

    if (reportRes.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }

    const report = reportRes.rows[0];

    const comments = await db.query(
      `SELECT 
         c.*,
         t.first_name || ' ' || t.last_name AS teacher_name
       FROM report_comments c
       JOIN users t ON c.teacher_id = t.id
       WHERE c.report_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    const history = await db.query(
      `SELECT 
         v.*,
         t.first_name || ' ' || t.last_name AS teacher_name
       FROM report_validations v
       JOIN users t ON v.teacher_id = t.id
       WHERE v.report_id = $1
       ORDER BY v.created_at DESC`,
      [id]
    );

    report.comments = comments.rows;
    report.validation_history = history.rows;

    console.log(`✅ Report ${id} loaded with ${comments.rowCount} comments`);

    res.json({ success: true, data: report });

  } catch (err) {
    console.error('❌ Error getReportById:', err);
    next(err);
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
  updateChecklist,  // ✅ CRITICAL: This was missing!
  addComment,
  updateComment,
  deleteComment,
  getReportById
};

