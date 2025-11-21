const express = require('express');
const multer = require('multer');
const path = require('path');
const authenticate = require('../middleware/auth.middleware');
const reportController = require('../controllers/report.controller');

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDFs allowed'));
  }
});

const router = express.Router();

router.post('/submit', authenticate, upload.single('file'), reportController.submit);
router.get('/my-submissions', authenticate, reportController.mySubmissions);
router.get('/:id', authenticate, reportController.getById);

module.exports = router;