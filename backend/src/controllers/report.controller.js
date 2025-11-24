console.log('🔥 CONTROLLER FILE LOADED!');

const db = require('../db');

/* ========================
   STUDENT FUNCTIONS
======================== */

async function submit(req, res, next) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required" });
    }

    // Accept both camelCase (from frontend) and snake_case
    const {
      title,
      author_first_name,
      authorFirstName,
      author_last_name,
      authorLastName,
      student_number,
      studentNumber,
      email,
      specialty,
      academic_year,
      academicYear,
      supervisor,
      co_supervisor,
      coSupervisor,
      host_company,
      hostCompany,
      defense_date,
      defenseDate,
      keywords,
      abstract,
      allow_public_access,
      allowPublicAccess,
      is_confidential,
      isConfidential,
      checklist
    } = req.body;

    // Use whichever format was sent
    const authorFirst = author_first_name || authorFirstName;
    const authorLast = author_last_name || authorLastName;
    const studentNum = student_number || studentNumber;
    const academicYr = academic_year || academicYear;
    const coSuper = co_supervisor || coSupervisor;
    const hostComp = host_company || hostCompany;
    const defenseD = defense_date || defenseDate;
    const allowPublic = allow_public_access === "true" || allowPublicAccess === "true" || allowPublicAccess === true;
    const isConfid = is_confidential === "true" || isConfidential === "true" || isConfidential === true;

    console.log('[Submit] Received data:', {
      title,
      authorFirst,
      authorLast,
      studentNum,
      academicYr,
      email,
      specialty,
      supervisor
    });

    const result = await db.query(
      `INSERT INTO reports (
        user_id, title, author_first_name, author_last_name, student_number, email,
        specialty, academic_year, supervisor, co_supervisor, host_company, defense_date,
        keywords, abstract,
        allow_public_access, is_confidential,
        file_name, file_path, file_size, file_url,
        status, checklist, submission_date, last_modified
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,
        $13,$14,
        $15,$16,
        $17,$18,$19,$20,
        $21,$22, NOW(), NOW()
      ) RETURNING *`,
      [
        userId,
        title,
        authorFirst,
        authorLast,
        studentNum,
        email,
        specialty,
        academicYr,
        supervisor,
        coSuper,
        hostComp,
        defenseD,
        keywords ? (typeof keywords === 'string' ? keywords.split(",") : keywords) : [],
        abstract,
        allowPublic,
        isConfid,
        req.file.originalname,
        `/uploads/${req.file.filename}`,
        req.file.size,
        `/uploads/${req.file.filename}`,
        "pending",
        checklist ? (typeof checklist === 'string' ? JSON.parse(checklist) : checklist) : {}
      ]
    );

    console.log('[Submit] Report created successfully:', result.rows[0].id);

    res.status(201).json({ 
      success: true,
      message: "Report submitted successfully", 
      report: result.rows[0] 
    });
  } catch (err) {
    console.error('[Submit Error]:', err);
    next(err);
  }
}

async function mySubmissions(req, res, next) {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT * FROM reports
       WHERE user_id = $1
       ORDER BY submission_date DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('[mySubmissions Error]:', err);
    next(err);
  }
}

/* ========================
   TEACHER FUNCTIONS - MODIFIED TO USE EMAIL LOOKUP
======================== */

async function pendingForTeacher(req, res, next) {
  try {
    console.log('[Controller] pendingForTeacher called');
    console.log('[Controller] User email:', req.user.email);
    
    // Get teacher's name from users table using email
    const teacherQuery = await db.query(
      'SELECT first_name, last_name FROM users WHERE email = $1',
      [req.user.email]
    );
    
    if (teacherQuery.rows.length === 0) {
      console.log('[Controller] Teacher not found in database');
      return res.json({ success: true, data: [] });
    }
    
    const teacher = teacherQuery.rows[0];
    const teacherName = `${teacher.first_name} ${teacher.last_name}`;
    console.log('[Controller] Looking for teacher:', teacherName);
    
    const result = await db.query(`
      SELECT 
        r.id,
        r.title,
        r.author_first_name,
        r.author_last_name,
        r.submission_date,
        r.status,
        u.email AS student_email
      FROM reports r
      JOIN users u ON r.user_id = u.id
      WHERE (r.supervisor ILIKE $1 OR r.co_supervisor ILIKE $1)
        AND r.status = 'pending'
      ORDER BY r.submission_date DESC
    `, [`%${teacherName}%`]);
    
    console.log('[Controller] Found reports:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Controller] Error in pendingForTeacher:', err);
    next(err);
  }
}

async function teacherStats(req, res, next) {
  try {
    console.log('[Controller] teacherStats called');
    console.log('[Controller] User email:', req.user.email);
    
    // Get teacher's name from users table using email
    const teacherQuery = await db.query(
      'SELECT first_name, last_name FROM users WHERE email = $1',
      [req.user.email]
    );
    
    if (teacherQuery.rows.length === 0) {
      console.log('[Controller] Teacher not found in database');
      return res.json({ 
        success: true, 
        data: { 
          total_assigned: 0, 
          pending_validation: 0, 
          validated: 0, 
          rejected: 0 
        } 
      });
    }
    
    const teacher = teacherQuery.rows[0];
    const teacherName = `${teacher.first_name} ${teacher.last_name}`;
    console.log('[Controller] Getting stats for teacher:', teacherName);
    
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE supervisor ILIKE $1 OR co_supervisor ILIKE $1) AS total_assigned,
        COUNT(*) FILTER (WHERE status = 'pending' AND (supervisor ILIKE $1 OR co_supervisor ILIKE $1)) AS pending_validation,
        COUNT(*) FILTER (WHERE status = 'validated' AND (supervisor ILIKE $1 OR co_supervisor ILIKE $1)) AS validated,
        COUNT(*) FILTER (WHERE status = 'rejected' AND (supervisor ILIKE $1 OR co_supervisor ILIKE $1)) AS rejected
      FROM reports
    `, [`%${teacherName}%`]);
    
    const stats = result.rows[0] || {
      total_assigned: '0',
      pending_validation: '0',
      validated: '0',
      rejected: '0'
    };
    
    // Convert to integers
    const formattedStats = {
      total_assigned: parseInt(stats.total_assigned) || 0,
      pending_validation: parseInt(stats.pending_validation) || 0,
      validated: parseInt(stats.validated) || 0,
      rejected: parseInt(stats.rejected) || 0
    };
    
    console.log('[Controller] Stats:', formattedStats);
    res.json({ success: true, data: formattedStats });
  } catch (err) {
    console.error('[Controller] Error in teacherStats:', err);
    next(err);
  }
}

async function assignedToMe(req, res, next) {
  try {
    console.log('[Controller] assignedToMe called');
    console.log('[Controller] User email:', req.user.email);
    
    // Get teacher's name from users table using email
    const teacherQuery = await db.query(
      'SELECT first_name, last_name FROM users WHERE email = $1',
      [req.user.email]
    );
    
    if (teacherQuery.rows.length === 0) {
      console.log('[Controller] Teacher not found in database');
      return res.json({ success: true, data: [] });
    }
    
    const teacher = teacherQuery.rows[0];
    const teacherName = `${teacher.first_name} ${teacher.last_name}`;
    console.log('[Controller] Looking for assigned reports to:', teacherName);
    
    const result = await db.query(`
      SELECT r.*, u.email AS student_email
      FROM reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.supervisor ILIKE $1 OR r.co_supervisor ILIKE $1
      ORDER BY r.submission_date DESC
    `, [`%${teacherName}%`]);
    
    console.log('[Controller] Found assigned reports:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('[Controller] Error in assignedToMe:', err);
    next(err);
  }
}

async function validateReport(req, res, next) {
  try {
    console.log('[Controller] validateReport called for ID:', req.params.id);
    
    const { action, comments } = req.body;
    const newStatus = action === 'validate' ? 'validated' : 'rejected';
    
    console.log('[Controller] Action:', action, '-> New status:', newStatus);
    
    await db.query(
      `UPDATE reports 
       SET status = $1, teacher_comments = $2, validated_at = NOW(), validated_by = $3 
       WHERE id = $4`,
      [newStatus, comments || null, req.user.id, req.params.id]
    );
    
    console.log('[Controller] Report updated successfully');
    res.json({ 
      success: true, 
      message: newStatus === 'validated' ? 'Rapport validé' : 'Rapport rejeté' 
    });
  } catch (err) {
    console.error('[Controller] Error in validateReport:', err);
    next(err);
  }
}

/* ========================
   SHARED FUNCTIONS
======================== */

async function getById(req, res, next) {
  try {
    console.log('[Controller] getById called for ID:', req.params.id);
    
    const result = await db.query(
      `SELECT * FROM reports WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      console.log('[Controller] Report not found');
      return res.status(404).json({ error: "Report not found" });
    }

    console.log('[Controller] Report found:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[Controller] Error in getById:', err);
    next(err);
  }
}

/* ========================
   EXPORTS
======================== */

module.exports = {
  submit,
  mySubmissions,
  pendingForTeacher,
  teacherStats,
  assignedToMe,
  validateReport,
  getById
};