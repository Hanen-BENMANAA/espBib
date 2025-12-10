// backend/routes/reports.js - FIXED SUPERVISOR HANDLING

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const authenticate = require('../middleware/auth.middleware');

// === CONFIG MULTER ===
const uploadDir = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Seul les PDF sont acceptés'));
  }
});

// === ROUTE DE SOUMISSION - FIXED VERSION ===
router.post('/submit', authenticate, upload.single('file'), async (req, res) => {
  try {
    console.log('📝 Submitting new report...');
    console.log('📋 Request body:', req.body);
    
    const userId = req.user.id;

    const {
      title,
      authorFirstName,
      authorLastName,
      studentNumber,
      email,
      specialty,
      academicYear,
      supervisor_id,
      co_supervisor_id,
      hostCompany,
      defenseDate,
      keywords,
      abstract,
      allowPublicAccess,
      isConfidential,
      checklist
    } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Fichier PDF requis'
      });
    }

    // ✅ VALIDATION: Check if supervisor_id is provided
    if (!supervisor_id) {
      return res.status(400).json({
        success: false,
        message: 'L\'encadrant principal est requis'
      });
    }

    // Keywords handling
    const keywordsArray = typeof keywords === 'string' ? JSON.parse(keywords) : keywords;

    // ✅ FIXED: Retrieve supervisor names with error handling
    let supervisorName = null;
    let coSupervisorName = null;

    console.log('🔍 Looking up supervisor_id:', supervisor_id);
    
    if (supervisor_id) {
      const supRes = await db.query(
        'SELECT first_name, last_name FROM users WHERE id = $1 AND role IN (\'teacher\', \'admin\')',
        [supervisor_id]
      );
      
      if (supRes.rows.length === 0) {
        console.error('❌ Supervisor not found with ID:', supervisor_id);
        return res.status(400).json({
          success: false,
          message: `Encadrant avec ID ${supervisor_id} introuvable. Veuillez sélectionner un encadrant valide.`
        });
      }
      
      supervisorName = `${supRes.rows[0].first_name} ${supRes.rows[0].last_name}`;
      console.log('✅ Supervisor found:', supervisorName);
    }

    if (co_supervisor_id) {
      console.log('🔍 Looking up co_supervisor_id:', co_supervisor_id);
      
      const coRes = await db.query(
        'SELECT first_name, last_name FROM users WHERE id = $1 AND role IN (\'teacher\', \'admin\')',
        [co_supervisor_id]
      );
      
      if (coRes.rows.length === 0) {
        console.warn('⚠️ Co-supervisor not found with ID:', co_supervisor_id);
        // Don't fail the request, just set to null
      } else {
        coSupervisorName = `${coRes.rows[0].first_name} ${coRes.rows[0].last_name}`;
        console.log('✅ Co-supervisor found:', coSupervisorName);
      }
    }

    const fileUrl = `/uploads/reports/${file.filename}`;

    // ✅ INSERT WITH GUARANTEED VALUES
    const result = await db.query(
      `INSERT INTO reports (
        user_id, title, author_first_name, author_last_name,
        student_number, email, specialty, academic_year,
        supervisor, co_supervisor, supervisor_id, co_supervisor_id,
        host_company, defense_date, keywords, abstract,
        allow_public_access, is_confidential,
        file_name, file_path, file_size, file_url,
        checklist, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22,
        $23, 'pending_validation'
      ) RETURNING id, title, status, submission_date, supervisor, co_supervisor`,
      [
        userId,
        title,
        authorFirstName,
        authorLastName,
        studentNumber,
        email,
        specialty,
        academicYear,
        supervisorName,
        coSupervisorName,
        supervisor_id,
        co_supervisor_id,
        hostCompany || null,
        defenseDate,
        keywordsArray,
        abstract,
        allowPublicAccess === 'false' ? false : true,
        isConfidential === 'true' ? true : false,
        file.filename,
        file.path,
        file.size,
        fileUrl,
        checklist ? JSON.parse(checklist) : {}
      ]
    );

    console.log('✅ Report submitted successfully:', result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Rapport soumis avec succès !',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error submitting report:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('🗑️ Cleaned up uploaded file after error');
      } catch (unlinkError) {
        console.error('Failed to cleanup file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la soumission',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;