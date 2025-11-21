/**
 * backend/server.js (version améliorée)
 * - sécurités HTTP (helmet), CORS configurable, rate limit
 * - wrapper asyncHandler pour éviter try/catch répétitifs
 * - authenticateToken amélioré
 * - upload: vérification mimetype + extension
 * - parsing JSON sécurisé pour keywords/checklist
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Use centralized database module (assure-toi que backend/db.js exporte pool and query)
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// ---------- Security middlewares ----------
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // restreindre en prod
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

// Serve uploaded files (public)
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads/reports')));

// ---------- Helpers ----------
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const safeJsonParse = (val, fallback) => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      // fallback to returning the string wrapped appropriately (for keywords, expect array)
      return fallback;
    }
  }
  return fallback;
};

const toBool = (v) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
  return Boolean(v);
};

// ---------- Multer config ----------
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads/reports');
    await fs.mkdir(uploadDir, { recursive: true }).catch(err => {
      console.error('Mkdir error:', err);
    });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExt = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if ((file.mimetype === 'application/pdf' || file.mimetype === 'application/octet-stream') && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont acceptés'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_BYTES) || 50 * 1024 * 1024 }, // 50MB par défaut
  fileFilter
});

// ---------- JWT helpers ----------
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (user) => {
  // signer un token minimal, pas de champs sensibles
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    const payload = jwt.verify(token, JWT_SECRET);
    // attacher seulement les champs nécessaires
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      first_name: payload.first_name,
      last_name: payload.last_name
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// ---------- Routes ----------

// Health
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Backend is running' }));

// AUTH: login
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Champs manquants' });

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

  const user = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(401).json({ error: 'Invalid credentials' });

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
}));

// 2FA setup, verify, send-sms (kept similar but wrapped)
app.post('/api/auth/2fa/setup', asyncHandler(async (req, res) => {
  const { userId, method } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const secret = speakeasy.generateSecret({ name: 'Bib-Esprim', issuer: 'Bib-Esprim' });
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  await db.query('UPDATE users SET two_factor_secret = $1, two_factor_method = $2 WHERE id = $3', [secret.base32, method, userId]);
  res.json({ secret: secret.base32, qrCode: qrCodeUrl, otpauth_url: secret.otpauth_url });
}));

app.post('/api/auth/2fa/verify', asyncHandler(async (req, res) => {
  const { userId, code, method } = req.body;
  if (!userId || !code) return res.status(400).json({ error: 'Missing fields' });

  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

  const user = result.rows[0];
  if (method === 'app') {
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 2
    });
    if (!verified) return res.status(401).json({ error: 'Invalid 2FA code' });
  } else if (method === 'sms') {
    if (code !== '123456') return res.status(401).json({ error: 'Invalid SMS code' });
  }

  if (!user.two_factor_enabled) {
    await db.query('UPDATE users SET two_factor_enabled = TRUE WHERE id = $1', [userId]);
  }

  const token = generateToken(user);
  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name }
  });
}));

app.post('/api/auth/2fa/send-sms', asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const result = await db.query('SELECT phone FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0 || !result.rows[0].phone) return res.status(400).json({ error: 'No phone number registered' });

  // Integrate real SMS provider here (Twilio, etc.)
  console.log(`SMS code sent to ${result.rows[0].phone}: 123456`);
  res.json({ message: 'SMS code sent successfully' });
}));

// ---------- Student routes: submit report ----------
app.post('/api/reports/submit', authenticateToken, upload.single('file'), asyncHandler(async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const body = req.body || {};
    const {
      title, authorFirstName, authorLastName, studentNumber,
      email, specialty, academicYear, supervisor, coSupervisor,
      hostCompany, defenseDate, abstract
    } = body;

    if (!title || !authorFirstName || !authorLastName) {
      throw new Error('title and author names are required');
    }

    // Parse JSON safely (keywords can be sent as JSON string or array)
    const keywords = safeJsonParse(body.keywords, []);
    const checklist = safeJsonParse(body.checklist, {});

    const file = req.file;
    if (!file) throw new Error('Fichier PDF requis');

    const insertQuery = `
      INSERT INTO reports (
        user_id, title, author_first_name, author_last_name,
        student_number, email, specialty, academic_year,
        supervisor, co_supervisor, host_company, defense_date,
        keywords, abstract, allow_public_access, is_confidential,
        file_name, file_path, file_size, file_url,
        status, checklist
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
        $13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      ) RETURNING id, submission_date
    `;

    const values = [
      req.user.id,
      title, authorFirstName, authorLastName,
      studentNumber || null, email || null, specialty || null, academicYear || null,
      supervisor || null, coSupervisor || null, hostCompany || null, defenseDate || null,
      keywords,
      abstract || null,
      toBool(body.allowPublicAccess),
      toBool(body.isConfidential),
      file.originalname,
      file.path,
      file.size,
      `/uploads/reports/${file.filename}`,
      'pending',
      checklist
    ];

    const result = await client.query(insertQuery, values);
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Rapport soumis avec succès',
      data: { id: result.rows[0].id, submissionDate: result.rows[0].submission_date }
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Report submission error:', error.message);
    if (req.file) {
      // try remove uploaded file on error
      await fs.unlink(req.file.path).catch(() => {});
    }
    // return more generic message to client
    res.status(500).json({ success: false, error: error.message || 'Erreur lors de la soumission' });
  } finally {
    client.release();
  }
}));

// ---------- Student endpoints (list, stats, history, etc.) ----------
app.get('/api/reports/current-submission', authenticateToken, asyncHandler(async (req, res) => {
  const query = `
    SELECT id, title, specialty, academic_year, supervisor, status, submission_date, defense_date, last_modified
    FROM reports
    WHERE user_id = $1 AND status IN ('pending','draft')
    ORDER BY last_modified DESC
    LIMIT 1
  `;
  const result = await db.query(query, [req.user.id]);
  if (result.rows.length === 0) return res.json({ success: true, data: null });
  const r = result.rows[0];
  res.json({ success: true, data: {
    id: r.id, title: r.title, status: r.status, submissionDate: r.submission_date,
    specialty: r.specialty, supervisor: r.supervisor, lastModified: r.last_modified
  }});
}));

app.get('/api/reports/my-submissions', authenticateToken, asyncHandler(async (req, res) => {
  const q = `
    SELECT id, title, author_first_name, author_last_name, student_number, email, specialty, academic_year,
      supervisor, co_supervisor, defense_date, keywords, abstract, status, validation_status, submission_date,
      last_modified, version, file_name, file_size
    FROM reports
    WHERE user_id = $1
    ORDER BY submission_date DESC
  `;
  const result = await db.query(q, [req.user.id]);
  res.json({ success: true, data: result.rows });
}));

app.get('/api/reports/my-stats', authenticateToken, asyncHandler(async (req, res) => {
  const q = `
    SELECT COUNT(*) as total_submissions,
      COUNT(*) FILTER (WHERE status = 'validated') as validated_reports,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
      COUNT(*) FILTER (WHERE status = 'draft') as draft_reports
    FROM reports
    WHERE user_id = $1
  `;
  const result = await db.query(q, [req.user.id]);
  res.json({ success: true, data: result.rows[0] });
}));

// history & my-reports kept similar (omitted here to shorten, keep your original queries)

// ---------- Teacher routes, validation, stats (unchanged logic but wrapped) ----------
app.get('/api/reports/assigned-to-me', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ success: false, error: 'Accès réservé aux enseignants' });
  const teacherName = `${req.user.first_name} ${req.user.last_name}`;
  const q = `
    SELECT r.id, r.title, r.author_first_name, r.author_last_name, r.student_number, r.specialty, r.academic_year,
      r.supervisor, r.co_supervisor, r.defense_date, r.status, r.validation_status, r.submission_date,
      r.teacher_comments, r.validated_at,
      u.first_name as student_first_name, u.last_name as student_last_name, u.email as student_email
    FROM reports r JOIN users u ON r.user_id = u.id
    WHERE r.supervisor ILIKE $1 OR r.co_supervisor ILIKE $1
    ORDER BY r.submission_date DESC
  `;
  const result = await db.query(q, [`%${teacherName}%`]);
  res.json({ success: true, data: result.rows });
}));

app.get('/api/reports/pending-validation', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ success: false, error: 'Accès réservé aux enseignants' });
  const teacherName = `${req.user.first_name} ${req.user.last_name}`;
  const q = `
    SELECT r.id, r.title, r.author_first_name, r.author_last_name, r.student_number, r.specialty, r.academic_year,
      r.supervisor, r.co_supervisor, r.submission_date, u.email as student_email
    FROM reports r JOIN users u ON r.user_id = u.id
    WHERE (r.supervisor ILIKE $1 OR r.co_supervisor ILIKE $1) AND r.status = 'pending'
    ORDER BY r.submission_date ASC
  `;
  const result = await db.query(q, [`%${teacherName}%`]);
  res.json({ success: true, data: result.rows });
}));

app.put('/api/reports/:id/validate', authenticateToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ success: false, error: 'Accès réservé aux enseignants' });
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const reportId = req.params.id;
    const { action, comments, checklist } = req.body;
    const teacherId = req.user.id;
    const newStatus = action === 'validate' ? 'validated' : 'rejected';
    const q = `
      UPDATE reports SET status = $1, validation_status = $2, teacher_comments = $3,
        validated_by = $4, validated_at = CURRENT_TIMESTAMP, checklist = $5
      WHERE id = $6 RETURNING id, title, status, validation_status
    `;
    const result = await client.query(q, [newStatus, action, comments || null, teacherId, JSON.stringify(checklist || {}), reportId]);
    if (result.rows.length === 0) throw new Error('Rapport non trouvé');
    await client.query('COMMIT');
    res.json({ success: true, message: action === 'validate' ? 'Rapport validé avec succès' : 'Rapport rejeté', data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    throw err;
  } finally {
    client.release();
  }
}));

// ---------- Get report by id with role rules ----------
app.get('/api/reports/:id', authenticateToken, asyncHandler(async (req, res) => {
  const reportId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;

  let query; let params;
  if (userRole === 'student') {
    query = `SELECT * FROM reports WHERE id = $1 AND user_id = $2`;
    params = [reportId, userId];
  } else if (userRole === 'teacher') {
    const teacherName = `${req.user.first_name} ${req.user.last_name}`;
    query = `SELECT * FROM reports WHERE id = $1 AND (supervisor ILIKE $2 OR co_supervisor ILIKE $2)`;
    params = [reportId, `%${teacherName}%`];
  } else {
    query = `SELECT * FROM reports WHERE id = $1`;
    params = [reportId];
  }

  const result = await db.query(query, params);
  if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'Rapport non trouvé' });
  res.json({ success: true, data: result.rows[0] });
}));

// Catalog & Dashboard endpoints (unchanged) kept as-is
app.get('/api/catalog', asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM catalog');
  res.json(result.rows);
}));

app.get('/api/dashboard/stats', asyncHandler(async (req, res) => {
  const result = await db.query('SELECT * FROM dashboard_stats');
  res.json(result.rows);
}));

// Global error handler (last)
app.use((err, req, res, next) => {
  console.error(err && err.stack ? err.stack : err);
  const status = err.status || 500;
  // Avoid exposing stack in production
  const payload = { success: false, error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message };
  res.status(status).json(payload);
});

// Start server & DB check
app.listen(port, async () => {
  // Optionally check DB connectivity
  try {
    if (db.pool && db.query) {
      await db.query('SELECT 1'); // quick ping
      console.log('Database connected');
    } else {
      console.warn('db module not exposing pool/query check backend/db.js');
    }
  } catch (e) {
    console.error('DB ping failed', e.message);
  }
  console.log(`Server running on port ${port}`);
});

module.exports = app;