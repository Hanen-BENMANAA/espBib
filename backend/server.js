const express = require('express');
const cors = require('cors');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers uploadés
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
app.use('/uploads', express.static(uploadDir));

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadBaseDir = process.env.UPLOAD_DIR || 'uploads';
    const uploadReportsDir = path.join(__dirname, uploadBaseDir, 'reports');
    await fs.mkdir(uploadReportsDir, { recursive: true }).catch(console.error);
    cb(null, uploadReportsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  }
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// ===================================================================
// ROUTES D'AUTHENTIFICATION (UPDATED)
// ===================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password || '');

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is required
    if (user.two_factor_enabled) {
      return res.json({
        requiresTwoFactor: true,
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name
        },
        method: user.two_factor_method
      });
    }

    // Generate token for users without 2FA
    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        firstName: user.first_name,
        lastName: user.last_name
      }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/2fa/setup', async (req, res) => {
  const { userId, method } = req.body;

  try {
    const secret = speakeasy.generateSecret({
      name: 'Bib-Esprim',
      issuer: 'Bib-Esprim'
    });

    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    await db.query(
      'UPDATE users SET two_factor_secret = $1, two_factor_method = $2 WHERE id = $3',
      [secret.base32, method, userId]
    );

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauth_url: secret.otpauth_url
    });

  } catch (err) {
    console.error('2FA setup error:', err.message);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

app.post('/api/auth/2fa/verify', async (req, res) => {
  const { userId, code, method } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (method === 'app') {
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (!verified) {
        return res.status(401).json({ error: 'Invalid 2FA code' });
      }
    } else if (method === 'sms') {
      if (code !== '123456') {
        return res.status(401).json({ error: 'Invalid SMS code' });
      }
    }

    if (!user.two_factor_enabled) {
      await db.query(
        'UPDATE users SET two_factor_enabled = TRUE WHERE id = $1',
        [userId]
      );
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });

  } catch (err) {
    console.error('2FA verification error:', err.message);
    res.status(500).json({ error: '2FA verification failed' });
  }
});

app.post('/api/auth/2fa/send-sms', async (req, res) => {
  const { userId } = req.body;

  try {
    const result = await db.query('SELECT phone FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0 || !result.rows[0].phone) {
      return res.status(400).json({ error: 'No phone number registered' });
    }

    console.log(`SMS code sent to ${result.rows[0].phone}: 123456`);

    res.json({ message: 'SMS code sent successfully' });

  } catch (err) {
    console.error('Send SMS error:', err.message);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// ===================================================================
// ROUTES POUR LES ÉTUDIANTS
// ===================================================================

// SOUMETTRE UN NOUVEAU RAPPORT
app.post('/api/reports/submit', authenticateToken, upload.single('file'), async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      title, authorFirstName, authorLastName, studentNumber,
      email, specialty, academicYear, supervisor, coSupervisor,
      hostCompany, defenseDate, keywords, abstract,
      allowPublicAccess, isConfidential, checklist
    } = req.body;
    
    const file = req.file;
    
    if (!file) {
      throw new Error('Fichier PDF requis');
    }
    
    const insertQuery = `
      INSERT INTO reports (
        user_id, title, author_first_name, author_last_name,
        student_number, email, specialty, academic_year,
        supervisor, co_supervisor, host_company, defense_date,
        keywords, abstract, allow_public_access, is_confidential,
        file_name, file_path, file_size, file_url,
        status, checklist
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING id, submission_date
    `;
    
    const values = [
      req.user.id,
      title, authorFirstName, authorLastName,
      studentNumber, email, specialty, academicYear,
      supervisor, coSupervisor || null, hostCompany || null, defenseDate,
      JSON.parse(keywords || '[]'),
      abstract,
      allowPublicAccess === 'true',
      isConfidential === 'true',
      file.originalname,
      file.path,
      file.size,
      `/uploads/reports/${file.filename}`,
      'pending',
      JSON.parse(checklist || '{}')
    ];
    
    const result = await client.query(insertQuery, values);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Rapport soumis avec succès',
      data: {
        id: result.rows[0].id,
        submissionDate: result.rows[0].submission_date
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Report submission error:', error.message);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la soumission'
    });
  } finally {
    client.release();
  }
});

// RÉCUPÉRER LA SOUMISSION ACTUELLE (UPDATED)
app.get('/api/reports/current-submission', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        id, title, specialty, academic_year, supervisor,
        status, submission_date, defense_date, last_modified
      FROM reports
      WHERE user_id = $1 AND status IN ('pending', 'draft')
      ORDER BY last_modified DESC
      LIMIT 1
    `;
    
    const result = await db.query(query, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }
    
    const report = result.rows[0];
    
    res.json({
      success: true,
      data: {
        id: report.id,
        title: report.title,
        status: report.status,
        submissionDate: report.submission_date,
        specialty: report.specialty,
        supervisor: report.supervisor,
        lastModified: report.last_modified
      }
    });
    
  } catch (error) {
    console.error('Error fetching current submission:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RÉCUPÉRER TOUTES MES SOUMISSIONS (NEW)
app.get('/api/reports/my-submissions', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        id, title, author_first_name, author_last_name,
        student_number, email, specialty, academic_year,
        supervisor, co_supervisor, defense_date, keywords,
        abstract, status, validation_status, submission_date,
        last_modified, version, file_name, file_size
      FROM reports
      WHERE user_id = $1
      ORDER BY submission_date DESC
    `;
    
    const result = await db.query(query, [req.user.id]);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching submissions:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RÉCUPÉRER MES STATISTIQUES (NEW)
app.get('/api/reports/my-stats', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(*) FILTER (WHERE status = 'validated') as validated_reports,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_reports
      FROM reports
      WHERE user_id = $1
    `;
    
    const result = await db.query(query, [req.user.id]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RÉCUPÉRER L'HISTORIQUE (LEGACY - kept for compatibility)
app.get('/api/reports/history', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        id, title, academic_year, submission_date,
        status, specialty
      FROM reports
      WHERE user_id = $1
      ORDER BY submission_date DESC
    `;
    
    const result = await db.query(query, [req.user.id]);
    
    res.json({
      success: true,
      submissions: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RÉCUPÉRER MES RAPPORTS (LEGACY - kept for compatibility)
app.get('/api/reports/my-reports', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM reports
      WHERE user_id = $1
      ORDER BY submission_date DESC
    `;
    
    const result = await db.query(query, [req.user.id]);
    
    res.json({ success: true, reports: result.rows });
    
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================================================
// ROUTES POUR LES ENSEIGNANTS (NEW)
// ===================================================================

// RÉCUPÉRER LES RAPPORTS ASSIGNÉS
app.get('/api/reports/assigned-to-me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux enseignants' 
      });
    }

    const teacherName = `${req.user.first_name} ${req.user.last_name}`;
    
    const query = `
      SELECT 
        r.id, r.title, r.author_first_name, r.author_last_name,
        r.student_number, r.specialty, r.academic_year,
        r.supervisor, r.co_supervisor, r.defense_date,
        r.status, r.validation_status, r.submission_date,
        r.teacher_comments, r.validated_at,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email
      FROM reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.supervisor ILIKE $1 OR r.co_supervisor ILIKE $1
      ORDER BY r.submission_date DESC
    `;
    
    const result = await db.query(query, [`%${teacherName}%`]);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching assigned reports:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RÉCUPÉRER LES RAPPORTS EN ATTENTE DE VALIDATION
app.get('/api/reports/pending-validation', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux enseignants' 
      });
    }

    const teacherName = `${req.user.first_name} ${req.user.last_name}`;
    
    const query = `
      SELECT 
        r.id, r.title, r.author_first_name, r.author_last_name,
        r.student_number, r.specialty, r.academic_year,
        r.supervisor, r.co_supervisor, r.submission_date,
        u.email as student_email
      FROM reports r
      JOIN users u ON r.user_id = u.id
      WHERE (r.supervisor ILIKE $1 OR r.co_supervisor ILIKE $1)
        AND r.status = 'pending'
      ORDER BY r.submission_date ASC
    `;
    
    const result = await db.query(query, [`%${teacherName}%`]);
    
    res.json({
      success: true,
      data: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching pending reports:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// VALIDER OU REJETER UN RAPPORT
app.put('/api/reports/:id/validate', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux enseignants' 
      });
    }

    await client.query('BEGIN');
    
    const reportId = req.params.id;
    const { action, comments, checklist } = req.body;
    const teacherId = req.user.id;
    
    const newStatus = action === 'validate' ? 'validated' : 'rejected';
    
    const query = `
      UPDATE reports 
      SET status = $1,
          validation_status = $2,
          teacher_comments = $3,
          validated_by = $4,
          validated_at = CURRENT_TIMESTAMP,
          checklist = $5
      WHERE id = $6
      RETURNING id, title, status, validation_status
    `;
    
    const result = await client.query(query, [
      newStatus,
      action,
      comments,
      teacherId,
      JSON.stringify(checklist || {}),
      reportId
    ]);
    
    if (result.rows.length === 0) {
      throw new Error('Rapport non trouvé');
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      message: action === 'validate' ? 'Rapport validé avec succès' : 'Rapport rejeté',
      data: result.rows[0]
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Report validation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la validation'
    });
  } finally {
    client.release();
  }
});

// RÉCUPÉRER LES STATISTIQUES DE L'ENSEIGNANT
app.get('/api/reports/teacher-stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ 
        success: false, 
        error: 'Accès réservé aux enseignants' 
      });
    }

    const teacherName = `${req.user.first_name} ${req.user.last_name}`;
    
    const query = `
      SELECT 
        COUNT(*) as total_assigned,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_validation,
        COUNT(*) FILTER (WHERE status = 'validated') as validated,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM reports 
      WHERE supervisor ILIKE $1 OR co_supervisor ILIKE $1
    `;
    
    const result = await db.query(query, [`%${teacherName}%`]);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching teacher stats:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================================================
// ROUTES COMMUNES
// ===================================================================

// RÉCUPÉRER UN RAPPORT PAR ID
app.get('/api/reports/:id', authenticateToken, async (req, res) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query;
    let params;
    
    if (userRole === 'student') {
      // Students can only see their own reports
      query = `SELECT * FROM reports WHERE id = $1 AND user_id = $2`;
      params = [reportId, userId];
    } else if (userRole === 'teacher') {
      // Teachers can see reports they supervise
      const teacherName = `${req.user.first_name} ${req.user.last_name}`;
      query = `SELECT * FROM reports 
               WHERE id = $1 
               AND (supervisor ILIKE $2 OR co_supervisor ILIKE $2)`;
      params = [reportId, `%${teacherName}%`];
    } else {
      // Admins can see all reports
      query = `SELECT * FROM reports WHERE id = $1`;
      params = [reportId];
    }
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Rapport non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching report:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================================================
// ROUTES EXISTANTES (CATALOG, DASHBOARD)
// ===================================================================

app.get('/api/catalog', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM catalog');
    res.json(result.rows);
  } catch (err) {
    console.error('Catalog error:', err.message);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dashboard_stats');
    res.json(result.rows);
  } catch (err) {
    console.error('Dashboard stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});

module.exports = app;