const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers uploadés
app.use('/uploads', express.static('uploads'));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/reports');
    await fs.mkdir(uploadDir, { recursive: true }).catch(console.error);
    cb(null, uploadDir);
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
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// ===================================================================
// ROUTES D'AUTHENTIFICATION (EXISTANTES)
// ===================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password (in production, use bcrypt.compare)
    const isValidPassword = password === 'password123'; // Mock validation

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is required
    if (user.two_factor_enabled) {
      return res.json({
        requiresTwoFactor: true,
        user: { id: user.id, email: user.email, role: user.role },
        method: user.two_factor_method
      });
    }

    // Generate token for users without 2FA
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.username }
    });

  } catch (err) {
    console.error(err);
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

    await pool.query(
      'UPDATE users SET two_factor_secret = $1, two_factor_method = $2 WHERE id = $3',
      [secret.base32, method, userId]
    );

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauth_url: secret.otpauth_url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

app.post('/api/auth/2fa/verify', async (req, res) => {
  const { userId, code, method } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

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
      await pool.query(
        'UPDATE users SET two_factor_enabled = TRUE WHERE id = $1',
        [userId]
      );
    }

    const token = generateToken(user);

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.username }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '2FA verification failed' });
  }
});

app.post('/api/auth/2fa/send-sms', async (req, res) => {
  const { userId } = req.body;

  try {
    const result = await pool.query('SELECT phone FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0 || !result.rows[0].phone) {
      return res.status(400).json({ error: 'No phone number registered' });
    }

    console.log(`SMS code sent to ${result.rows[0].phone}: 123456`);

    res.json({ message: 'SMS code sent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// ===================================================================
// NOUVELLES ROUTES POUR LES RAPPORTS
// ===================================================================

// SOUMETTRE UN NOUVEAU RAPPORT
app.post('/api/reports/submit', authenticateToken, upload.single('file'), async (req, res) => {
  const client = await pool.connect();
  
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
      reportId: result.rows[0].id,
      submissionDate: result.rows[0].submission_date
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur soumission:', error);
    
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

// RÉCUPÉRER LA SOUMISSION ACTUELLE
app.get('/api/reports/current-submission', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        id, title, specialty, academic_year, supervisor,
        status, submission_date, defense_date, last_modified
      FROM reports
      WHERE user_id = $1 AND status = 'pending'
      ORDER BY submission_date DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.json({ success: true, currentSubmission: null });
    }
    
    const report = result.rows[0];
    
    res.json({
      success: true,
      currentSubmission: {
        id: report.id,
        title: report.title,
        status: report.status,
        submissionDate: report.submission_date,
        specialty: report.specialty,
        supervisor: report.supervisor,
        progress: 85,
        lastModified: report.last_modified
      }
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RÉCUPÉRER L'HISTORIQUE
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
    
    const result = await pool.query(query, [req.user.id]);
    
    res.json({
      success: true,
      submissions: result.rows
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// RÉCUPÉRER MES RAPPORTS
app.get('/api/reports/my-reports', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM reports
      WHERE user_id = $1
      ORDER BY submission_date DESC
    `;
    
    const result = await pool.query(query, [req.user.id]);
    
    res.json({ success: true, reports: result.rows });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===================================================================
// ROUTES EXISTANTES (CATALOG, DASHBOARD)
// ===================================================================

app.get('/api/catalog', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM catalog');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dashboard_stats');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;