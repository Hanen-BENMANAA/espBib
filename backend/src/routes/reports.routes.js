// backend/routes/reports.routes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const authenticate = require('../middleware/auth.middleware');
const reportController = require('../reports/report.controller');

// Configuration de multer pour l'upload
const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
    }
  }
});

// SOUMISSION D'UN RAPPORT (POST)
router.post(
  '/submit',
  authenticate,
  upload.single('file'),
  reportController.submit
);

// RÉCUPÉRER TOUS LES RAPPORTS DE L'ÉTUDIANT CONNECTÉ (GET) — C'EST CELLE QUI MANQUAIT !
router.get(
  '/my-submissions',
  authenticate,
  reportController.mySubmissions
);

// RÉCUPÉRER UN RAPPORT PAR SON ID
router.get(
  '/:id',
  authenticate,
  reportController.getById
);

module.exports = router;