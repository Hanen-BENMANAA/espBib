// backend/src/routes/secure-pdf.routes.js
// VERSION WITH ENHANCED ERROR HANDLING

const express = require('express');
const router = express.Router();
const path = require('path');
const { PDFDocument, rgb, degrees, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const db = require('../db');

let authenticateToken;
try {
  const auth = require('../middleware/auth.middleware');
  authenticateToken = auth.authenticateToken || auth;
} catch (e) {
  console.error('Auth middleware missing:', e);
}

// Route de test
router.get('/test', (req, res) => {
  res.json({ status: 'Secure PDF route active', watermark: true });
});

// DEBUG ROUTE
router.get('/debug/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT id, title, file_path, status, allow_public_access, user_id, created_at 
       FROM reports 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'Report not found', id });
    }

    const report = result.rows[0];
    return res.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        file_path: report.file_path,
        status: report.status,
        allow_public_access: report.allow_public_access,
        user_id: report.user_id,
        created_at: report.created_at
      },
      access_checks: {
        is_validated: report.status === 'validated',
        is_public: report.allow_public_access === true,
        can_access: report.status === 'validated' && report.allow_public_access === true
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// MAIN ROUTE
router.get('/view/:id', authenticateToken, async (req, res) => {
  const start = Date.now();
  const cleanMode = req.query.clean === 'true';
  
  console.log(`\n🔍 PDF Request:`);
  console.log(`   Report ID: ${req.params.id}`);
  console.log(`   User: ${req.user?.email || 'UNKNOWN'}`);
  console.log(`   Clean mode: ${cleanMode}`);
  console.log(`   User object:`, req.user);

  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(id)) {
      console.error('❌ Invalid report ID:', id);
      return res.status(400).json({ 
        error: 'Invalid report ID',
        received: id 
      });
    }

    console.log(`📊 Querying database for report ${id}...`);
    
    const result = await db.query(
      `SELECT id, title, file_path, user_id, status, allow_public_access 
       FROM reports 
       WHERE id = $1`,
      [id]
    );

    console.log(`   Query result: ${result.rows.length} row(s)`);

    if (result.rows.length === 0) {
      console.error(`❌ Report ${id} not found in database`);
      return res.status(404).send(`
        <div style="font-family:system-ui;text-align:center;padding:100px;background:#f9f9f9;height:100vh">
          <h1 style="font-size:5rem;color:#ddd">404</h1>
          <p>Document introuvable (ID: ${id})</p>
        </div>
      `);
    }

    const report = result.rows[0];
    console.log(`✅ Report found:`, {
      id: report.id,
      title: report.title,
      status: report.status,
      file_path: report.file_path
    });

    // Access control (skip in clean mode for validators)
    if (!cleanMode) {
      console.log(`🔒 Checking access permissions...`);
      
      if (report.status !== 'validated') {
        console.warn(`⚠️ Report not validated: ${report.status}`);
        return res.status(403).send(`
          <div style="font-family:system-ui;text-align:center;padding:100px;background:#f9f9f9;height:100vh">
            <h1 style="font-size:5rem;color:#ddd">403</h1>
            <p>Document non validé</p>
            <p>Status actuel: ${report.status}</p>
          </div>
        `);
      }

      if (!report.allow_public_access) {
        console.warn(`⚠️ Public access not allowed`);
        return res.status(403).send(`
          <div style="font-family:system-ui;text-align:center;padding:100px;background:#f9f9f9;height:100vh">
            <h1 style="font-size:5rem;color:#ddd">403</h1>
            <p>Accès public non autorisé</p>
          </div>
        `);
      }
    } else {
      console.log(`✅ Clean mode: Skipping access checks`);
    }

    // File path resolution
    const filePathFromDb = report.file_path;
    const normalizedPath = filePathFromDb.replace(/^\/+/, '');

    const possiblePaths = [
      path.join(process.cwd(), 'backend', normalizedPath),
      path.join(process.cwd(), normalizedPath),
      path.join(__dirname, '..', normalizedPath),
      path.join(__dirname, '../../', normalizedPath),
    ];

    let fullPath = null;
    console.log(`🔍 Searching for PDF file...`);
    
    for (const p of possiblePaths) {
      console.log(`   Testing: ${p}`);
      try {
        await fs.access(p);
        fullPath = p;
        console.log(`   ✅ Found: ${fullPath}`);
        break;
      } catch (err) {
        console.log(`   ❌ Not found`);
      }
    }

    if (!fullPath) {
      console.error('❌ PDF NOT FOUND ON DISK');
      console.error('   DB path:', filePathFromDb);
      console.error('   Tried paths:', possiblePaths);
      
      return res.status(404).send(`
        <div style="font-family:system-ui;text-align:center;padding:100px;">
          <h1>404 - Fichier PDF introuvable</h1>
          <p>Le fichier n'existe pas sur le serveur</p>
          <p style="color:#666;font-size:0.9em;">Path: ${filePathFromDb}</p>
        </div>
      `);
    }

    // MODE CLEAN = VALIDATEUR → PDF PROPRE SANS WATERMARK
    if (cleanMode) {
      console.log('📄 Serving clean PDF (no watermark)');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.removeHeader('X-Frame-Options');
      res.setHeader('Content-Security-Policy', "frame-ancestors *;");
      
      const stream = require('fs').createReadStream(fullPath);
      stream.on('error', (err) => {
        console.error('❌ Stream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Error reading PDF file');
        }
      });
      
      return stream.pipe(res);
    }

    // MODE NORMAL → avec watermark
    console.log('📄 Serving PDF with watermark');
    
    const pdfBytes = await fs.readFile(fullPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const now = new Date().toLocaleString('fr-FR');

    pages.forEach(page => {
      const { width, height } = page.getSize();

      page.drawText('ESPRIM - DOCUMENT PROTÉGÉ', {
        x: width / 2 - 180,
        y: height / 2,
        size: 40,
        font,
        color: rgb(0.85, 0, 0),
        rotate: degrees(-45),
        opacity: 0.15,
      });

      page.drawText(`${req.user.name || 'Utilisateur'} • ${req.user.email} • ${now}`, {
        x: 60,
        y: height - 100,
        size: 14,
        font,
        color: rgb(0.3, 0.3, 0.3),
        rotate: degrees(-35),
        opacity: 0.4,
      });
    });

    const finalPdfBytes = await pdfDoc.save();

    const origin = req.headers.origin;
    console.log('🌐 Request origin:', origin);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="rapport.pdf"');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.removeHeader('X-Frame-Options');

    let frameAncestors = origin?.match(/^http:\/\/localhost:\d+$/) || origin?.match(/^http:\/\/127\.0\.0\.1:\d+$/) 
      ? origin 
      : "http://localhost:* http://127.0.0.1:*";
    
    const cspHeader = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; object-src 'self'; frame-ancestors ${frameAncestors};`;
    res.setHeader('Content-Security-Policy', cspHeader);

    if (origin?.match(/^http:\/\/localhost:\d+$/) || origin?.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.send(Buffer.from(finalPdfBytes));
    console.log(`✅ PDF delivered in ${Date.now() - start}ms`);

  } catch (error) {
    console.error('❌ ERROR in secure-pdf route:', error);
    console.error('   Stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// OPTIONS
router.options('/view/:id', (req, res) => {
  const origin = req.headers.origin;
  if (origin?.match(/^http:\/\/localhost:\d+$/) || origin?.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  }
  res.sendStatus(200);
});

module.exports = router;