// backend/src/routes/secure-pdf.routes.js
// 🔥 COMPLETE VERSION - Dynamic localhost CORS support

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
  console.error('Auth middleware missing');
}

// Route de test
router.get('/test', (req, res) => {
  res.json({ status: 'Secure PDF route active', watermark: true });
});

// 🔍 DEBUG ROUTE - Check report status (REMOVE IN PRODUCTION)
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
      return res.json({
        success: false,
        message: 'Report not found',
        id
      });
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
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ✅ MAIN ROUTE → /api/secure-pdf/view/5?token=xxx
router.get('/view/:id', authenticateToken, async (req, res) => {
  const start = Date.now();
  console.log(`\n📄 PDF sécurisé demandé → ID: ${req.params.id} | User: ${req.user.email}`);

  try {
    const { id } = req.params;

    // Récupération du rapport - Enhanced debugging
    console.log(`🔍 Searching for report ID: ${id}`);
    
    const result = await db.query(
      `SELECT id, title, file_path, user_id, status, allow_public_access 
       FROM reports 
       WHERE id = $1`,
      [id]
    );

    console.log(`📊 Query result:`, result.rows);

    if (result.rows.length === 0) {
      console.error(`❌ Report ${id} not found in database`);
      return res.status(404).send(`
        <div style="font-family:system-ui;text-align:center;padding:100px;background:#f9f9f9;height:100vh">
          <h1 style="font-size:5rem;color:#ddd">404</h1>
          <p>Document introuvable (ID: ${id})</p>
          <p style="color:#666;font-size:14px;">Le rapport n'existe pas dans la base de données</p>
        </div>
      `);
    }

    const report = result.rows[0];
    
    // Check access permissions
    if (report.status !== 'validated') {
      console.warn(`⚠️ Report ${id} status is '${report.status}', not 'validated'`);
      return res.status(403).send(`
        <div style="font-family:system-ui;text-align:center;padding:100px;background:#f9f9f9;height:100vh">
          <h1 style="font-size:5rem;color:#ddd">403</h1>
          <p>Document non validé</p>
          <p style="color:#666;font-size:14px;">Status actuel: ${report.status}</p>
        </div>
      `);
    }

    if (!report.allow_public_access) {
      console.warn(`⚠️ Report ${id} has allow_public_access = false`);
      return res.status(403).send(`
        <div style="font-family:system-ui;text-align:center;padding:100px;background:#f9f9f9;height:100vh">
          <h1 style="font-size:5rem;color:#ddd">403</h1>
          <p>Accès public non autorisé</p>
          <p style="color:#666;font-size:14px;">Ce document n'est pas accessible publiquement</p>
        </div>
      `);
    }

    // ✅ Extract variables ONCE - no redeclaration
    const filePath = report.file_path;
    const reportTitle = report.title;
    
    // ✅ Build absolute path - try multiple possible locations
    let fullPath;
    let fileFound = false;
    
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    // Try different possible paths
    const possiblePaths = [
      path.join(__dirname, '../../', cleanPath),           // backend/uploads/...
      path.join(__dirname, '../../../', cleanPath),        // root/uploads/...
      path.join(process.cwd(), cleanPath),                 // current working directory
      path.join(process.cwd(), 'backend', cleanPath),      // if running from root
    ];
    
    console.log(`🔍 Trying to locate file...`);
    for (const testPath of possiblePaths) {
      try {
        await fs.access(testPath);
        fullPath = testPath;
        fileFound = true;
        console.log(`✅ File found at: ${fullPath}`);
        break;
      } catch (err) {
        console.log(`❌ Not found at: ${testPath}`);
      }
    }
    
    if (!fileFound) {
      console.error(`❌ File not found in any location. Original path: ${filePath}`);
      console.error(`Tried paths:`, possiblePaths);
      return res.status(404).send(`
        <div style="font-family:system-ui;text-align:center;padding:100px;background:#f9f9f9;height:100vh">
          <h1 style="font-size:5rem;color:#ddd">404</h1>
          <p>Fichier PDF manquant sur le serveur</p>
          <p style="color:#666;font-size:14px;">Chemin recherché: ${filePath}</p>
          <details style="margin-top:20px;text-align:left;max-width:600px;margin-left:auto;margin-right:auto;">
            <summary style="cursor:pointer;color:#666;">Détails techniques</summary>
            <pre style="background:#f5f5f5;padding:10px;border-radius:5px;overflow:auto;font-size:11px;">
__dirname: ${__dirname}
process.cwd(): ${process.cwd()}
Chemins testés:
${possiblePaths.map((p, i) => `${i + 1}. ${p}`).join('\n')}
            </pre>
          </details>
        </div>
      `);
    }

    // Lecture + watermark serveur
    const pdfBytes = await fs.readFile(fullPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pages = pdfDoc.getPages();
    const now = new Date().toLocaleString('fr-FR');

    pages.forEach(page => {
      const { width, height } = page.getSize();

      // Gros watermark central
      page.drawText('ESPRIM - DOCUMENT PROTÉGÉ', {
        x: width / 2 - 180,
        y: height / 2,
        size: 40,
        font,
        color: rgb(0.85, 0, 0),
        rotate: degrees(-45),
        opacity: 0.15,
      });

      // Infos utilisateur en diagonale
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

    // ✅ Extract origin FIRST (before using it)
    const origin = req.headers.origin;
    console.log('📍 Request origin:', origin);

    // ✅ FIXED HEADERS - Allow iframe embedding from any localhost
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="rapport.pdf"');
    
    // ✅ Cache control - prevent caching of sensitive documents
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // ✅ Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // ✅ CRITICAL: Remove X-Frame-Options to allow iframe
    res.removeHeader('X-Frame-Options');
    console.log('🗑️  Removed X-Frame-Options header');
    
    // ✅ FIXED CSP - Allow PDF rendering in iframe from any localhost
    let frameAncestors = "'none'"; // Default to blocking
    
    if (origin) {
      // Check if origin is localhost with any port
      if (origin.match(/^http:\/\/localhost:\d+$/) || origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
        frameAncestors = `${origin}`;
        console.log(`✅ Allowing frame-ancestors: ${frameAncestors}`);
      }
    } else {
      // No origin header - allow any localhost (for direct access)
      frameAncestors = "http://localhost:* http://127.0.0.1:*";
      console.log('⚠️  No origin header, allowing all localhost');
    }
    
    const cspHeader = `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; object-src 'self'; frame-ancestors ${frameAncestors};`;
    res.setHeader('Content-Security-Policy', cspHeader);
    console.log('🔒 CSP Header:', cspHeader);

    // ✅ DYNAMIC CORS - Allow any localhost port
    if (origin) {
      // Check if origin is localhost with any port
      if (origin.match(/^http:\/\/localhost:\d+$/) || 
          origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
        console.log(`✅ CORS allowed for origin: ${origin}`);
      }
    }

    res.send(Buffer.from(finalPdfBytes));

    console.log(`✅ PDF sécurisé envoyé en ${Date.now() - start}ms`);

  } catch (error) {
    console.error('❌ Erreur secure-pdf:', error);
    res.status(500).send(`
      <div style="font-family:system-ui;text-align:center;padding:100px;background:#f9f9f9;height:100vh">
        <h1 style="font-size:5rem;color:#ddd">500</h1>
        <p>Erreur serveur</p>
        <p style="color:#666;font-size:14px;">${error.message}</p>
      </div>
    `);
  }
});

// ✅ Handle OPTIONS preflight requests (CORS) - Accept any localhost
router.options('/view/:id', (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    // Check if origin is localhost with any port
    if (origin.match(/^http:\/\/localhost:\d+$/) || 
        origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
      console.log(`✅ OPTIONS CORS allowed for origin: ${origin}`);
    }
  }
  res.sendStatus(200);
});

module.exports = router;