// controllers/report.controller.js - VERSION FINALE 100% FONCTIONNELLE (2025)

const db = require('../db');
console.log('CONTROLLER REPORT LOADED');

/* ======================== STUDENT ======================== */
async function submit(req, res, next) {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ success: false, message: "PDF requis" });

    const {
      title, author_first_name, author_last_name, student_number, email,
      specialty, academic_year, supervisor_id, co_supervisor_id,
      host_company, defense_date, keywords, abstract,
      allow_public_access, is_confidential, checklist
    } = req.body;

    const result = await db.query(
      `INSERT INTO reports (
        user_id, title, author_first_name, author_last_name, student_number, email,
        specialty, academic_year, supervisor_id, co_supervisor_id, host_company,
        defense_date, keywords, abstract, allow_public_access, is_confidential,
        file_name, file_path, file_size, file_url, status, checklist,
        submission_date, last_modified
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
                $17,$18,$19,$20,$21,$22,NOW(),NOW()) RETURNING *`,
      [
        userId, title, author_first_name, author_last_name, student_number, email,
        specialty, academic_year, supervisor_id || null, co_supervisor_id || null,
        host_company || null, defense_date || null,
        keywords ? JSON.parse(keywords) : [],
        abstract || '',
        allow_public_access === 'true',
        is_confidential === 'true',
        req.file.originalname,
        `/uploads/${req.file.filename}`,
        req.file.size,
        `/uploads/${req.file.filename}`,
        'pending_validation',
        checklist ? JSON.parse(checklist) : {}
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Erreur submit:', err);
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
  } catch (err) { next(err); }
}

/* ======================== TEACHER ======================== */
async function getAssignedReports(req, res, next) {
  try {
    const result = await db.query(
      `SELECT r.*, 
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
  } catch (err) { next(err); }
}

async function getPendingReports(req, res, next) {
  try {
    const result = await db.query(
      `SELECT r.*, 
              u.first_name AS author_first_name, 
              u.last_name AS author_last_name
       FROM reports r
       JOIN users u ON r.user_id = u.id
       WHERE (r.supervisor_id = $1 OR r.co_supervisor_id = $1)
         AND r.status = 'pending_validation'
       ORDER BY r.submission_date ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
}

async function getTeacherStats(req, res, next) {
  try {
    const result = await db.query(
      `SELECT 
         COUNT(*) FILTER (WHERE supervisor_id = $1 OR co_supervisor_id = $1) AS total_assigned,
         COUNT(*) FILTER (WHERE status = 'pending_validation' AND (supervisor_id = $1 OR co_supervisor_id = $1)) AS pending_validation,
         COUNT(*) FILTER (WHERE status = 'validated' AND (supervisor_id = $1 OR co_supervisor_id = $1)) AS validated,
         COUNT(*) FILTER (WHERE status = 'rejected' AND (supervisor_id = $1 OR co_supervisor_id = $1)) AS rejected
       FROM reports`,
      [req.user.id]
    );
    const stats = result.rows[0];
    res.json({ 
      success: true, 
      data: {
        total_assigned: parseInt(stats.total_assigned) || 0,
        pending_validation: parseInt(stats.pending_validation) || 0,
        validated: parseInt(stats.validated) || 0,
        rejected: parseInt(stats.rejected) || 0
      }
    });
  } catch (err) { next(err); }
}

async function validateReport(req, res, next) {
  const { id } = req.params;
  const { decision, comments = '' } = req.body;
  const teacherId = req.user.id;

  const statusMap = {
    validated: 'validated',
    rejected: 'rejected',
    revision_requested: 'revision_requested'
  };
  const newStatus = statusMap[decision];

  if (!newStatus) {
    return res.status(400).json({ success: false, message: 'Action invalide' });
  }

  try {
    await db.query('BEGIN');

    await db.query(
      `UPDATE reports SET status = $1, validated_at = NOW(), validated_by = $2 WHERE id = $3`,
      [newStatus, teacherId, id]
    );

    await db.query(
      `INSERT INTO report_validations (report_id, teacher_id, action, message)
       VALUES ($1, $2, $3, $4)`,
      [id, teacherId, decision, comments]
    );

    await db.query('COMMIT');
    res.json({ success: true, message: 'Action enregistrée avec succès' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Erreur validation:', err);
    next(err);
  }
}

/* ======================== COMMENTS ======================== */
async function addComment(req, res, next) {
  const { id } = req.params;
  const { content } = req.body;
  const teacherId = req.user.id;

  if (!content?.trim()) {
    return res.status(400).json({ success: false, message: 'Contenu requis' });
  }

  try {
    const result = await db.query(
      `INSERT INTO report_comments (report_id, teacher_id, content)
       VALUES ($1, $2, $3) 
       RETURNING id, content, created_at, updated_at`,
      [id, teacherId, content.trim()]
    );

    const comment = result.rows[0];
    const teacher = await db.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [teacherId]
    );

    comment.teacher_name = teacher.rows[0] 
      ? `${teacher.rows[0].first_name} ${teacher.rows[0].last_name}`
      : 'Enseignant';

    res.json({ success: true, data: comment });
  } catch (err) {
    console.error('Erreur addComment:', err);
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
      return res.status(404).json({ success: false, message: 'Commentaire non trouvé' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
}

async function deleteComment(req, res, next) {
  const { commentId } = req.params;
  try {
    const result = await db.query(
      `DELETE FROM report_comments WHERE id = $1 AND teacher_id = $2`,
      [commentId, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Commentaire non trouvé' });
    }

    res.json({ success: true, message: 'Commentaire supprimé' });
  } catch (err) { next(err); }
}

/* ======================== GET REPORT + COMMENTS + HISTORY ======================== */
async function getReportById(req, res, next) {
  const { id } = req.params;

  try {
    // VERSION 100% COMPATIBLE AVEC TA TABLE ACTUELLE (supervisor texte + supervisor_id)
    const reportRes = await db.query(
      `SELECT 
         r.*,
         u.first_name AS author_first_name,
         u.last_name AS author_last_name,
         u.email AS student_email,
         COALESCE(s.first_name || ' ' || s.last_name, r.supervisor, 'Non assigné') AS supervisor_name
       FROM reports r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN users s ON r.supervisor_id = s.id OR LOWER(r.supervisor) LIKE LOWER('%' || s.first_name || '% ' || s.last_name || '%')
       WHERE r.id = $1`,
      [id]
    );

    if (reportRes.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rapport non trouvé' 
      });
    }

    const report = reportRes.rows[0];

    // Commentaires
    const commentsRes = await db.query(
      `SELECT c.*, 
              t.first_name || ' ' || t.last_name AS teacher_name
       FROM report_comments c
       JOIN users t ON c.teacher_id = t.id
       WHERE c.report_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    // Historique
    const historyRes = await db.query(
      `SELECT v.*, 
              t.first_name || ' ' || t.last_name AS teacher_name
       FROM report_validations v
       JOIN users t ON v.teacher_id = t.id
       WHERE v.report_id = $1
       ORDER BY v.created_at DESC`,
      [id]
    );

    report.comments = commentsRes.rows;
    report.validation_history = historyRes.rows;

    console.log(`Rapport ID ${id} chargé avec succès : ${report.title}`);
    res.json({ success: true, data: report });

  } catch (err) {
    console.error('Erreur getReportById:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
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