// backend/routes/auth.routes.js - Complete TOTP Implementation
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth.middleware');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ==================== LOGIN WITH 2FA CHECK ====================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Check if 2FA is required (teachers and admins)
    const requires2FA = (user.role === 'teacher' || user.role === 'admin');

    if (requires2FA) {
      console.log(`🔐 2FA required for ${user.role}:`, user.email);
      
      return res.json({
        requiresTwoFactor: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
        },
        method: user.totp_secret ? 'app' : 'setup', // 'app' if configured, 'setup' if not
        has2FASetup: {
          app: !!user.totp_secret
        }
      });
    }

    // Students login directly without 2FA
    console.log(`✅ Direct login for ${user.role}:`, user.email);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==================== SETUP TOTP (Generate QR Code) ====================
router.post('/2fa/setup', async (req, res) => {
  try {
    const { userId, method } = req.body;
    
    // Find user by email or ID
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1 OR id = $2',
      [userId, userId]
    );

    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = userResult.rows[0];

    if (method === 'app') {
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `ESPRIM Virtual Library (${user.email})`,
        issuer: 'ESPRIM',
        length: 32
      });

      console.log('🔐 Generated TOTP secret for:', user.email);

      // Generate QR code as Data URL
      const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

      // Store temporary secret (will be moved to permanent after verification)
      await db.query(
        'UPDATE users SET totp_secret_temp = $1 WHERE id = $2',
        [secret.base32, user.id]
      );

      return res.json({
        success: true,
        qrCode: qrCodeDataURL,
        secret: secret.base32,
        manualEntryKey: secret.base32, // For manual entry if QR doesn't work
        otpauthUrl: secret.otpauth_url
      });
    }

    res.status(400).json({ error: 'Méthode non supportée' });
  } catch (err) {
    console.error('2FA setup error:', err);
    res.status(500).json({ error: 'Erreur lors de la configuration 2FA' });
  }
});

// ==================== VERIFY SETUP (Confirm TOTP Configuration) ====================
router.post('/2fa/verify-setup', async (req, res) => {
  try {
    const { userId, code, method } = req.body;
    
    const userResult = await db.query(
      'SELECT * FROM users WHERE email = $1 OR id = $2',
      [userId, userId]
    );
    
    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = userResult.rows[0];

    if (method === 'app' && user.totp_secret_temp) {
      // Verify the TOTP code against temporary secret
      const verified = speakeasy.totp.verify({
        secret: user.totp_secret_temp,
        encoding: 'base32',
        token: code,
        window: 2 // Allow ±60 seconds time drift
      });

      if (verified) {
        // Move temporary secret to permanent storage
        await db.query(
          `UPDATE users 
           SET totp_secret = $1, 
               totp_secret_temp = NULL, 
               totp_enabled_at = NOW() 
           WHERE id = $2`,
          [user.totp_secret_temp, user.id]
        );

        console.log(`✅ TOTP successfully enabled for ${user.email}`);

        return res.json({
          success: true,
          message: 'Authenticator app configured successfully',
          user: {
            id: user.id,
            email: user.email,
            role: user.role
          }
        });
      } else {
        return res.status(401).json({
          error: 'Code de vérification incorrect. Veuillez réessayer.'
        });
      }
    }

    res.status(400).json({ error: 'Configuration invalide' });
  } catch (err) {
    console.error('Setup verification error:', err);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// ==================== VERIFY 2FA CODE (During Login) ====================
router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, code, method } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 OR id = $2',
      [userId, userId]
    );
    
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.rows[0];
    let verified = false;

    if (method === 'app') {
      if (!user.totp_secret) {
        return res.status(400).json({ 
          error: 'Authenticator app non configuré. Veuillez le configurer d\'abord.',
          needsSetup: true
        });
      }

      // Verify TOTP code
      verified = speakeasy.totp.verify({
        secret: user.totp_secret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow ±60 seconds time drift
      });

      if (verified) {
        console.log(`✅ TOTP verified successfully for ${user.email}`);
        
        // Update last used timestamp
        await db.query(
          'UPDATE users SET last_totp_used = NOW() WHERE id = $1',
          [user.id]
        );
      } else {
        console.log(`❌ Invalid TOTP code for ${user.email}`);
      }
    }

    if (!verified) {
      return res.status(401).json({ 
        error: 'Code de vérification incorrect',
        attempts: 3 // You could track failed attempts here
      });
    }

    // Generate JWT token after successful verification
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      }
    });
  } catch (err) {
    console.error('2FA verification error:', err);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// ==================== GET 2FA STATUS ====================
router.get('/2fa/status', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    const result = await db.query(
      'SELECT totp_secret, totp_enabled_at FROM users WHERE email = $1',
      [userEmail]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      status: {
        app: {
          enabled: !!user.totp_secret,
          configured: !!user.totp_secret,
          enabledAt: user.totp_enabled_at
        }
      }
    });
  } catch (err) {
    console.error('2FA status error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du statut' });
  }
});

// ==================== DISABLE 2FA ====================
router.post('/2fa/disable', authenticateToken, async (req, res) => {
  try {
    const { method, password } = req.body;
    const userEmail = req.user.email;

    // Verify password before disabling
    const result = await db.query('SELECT password FROM users WHERE email = $1', [userEmail]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    if (method === 'app') {
      await db.query(
        `UPDATE users 
         SET totp_secret = NULL, 
             totp_secret_temp = NULL, 
             totp_enabled_at = NULL 
         WHERE email = $1`,
        [userEmail]
      );
      
      console.log(`🔓 TOTP disabled for ${userEmail}`);
      
      res.json({
        success: true,
        message: 'Authenticator app désactivé avec succès'
      });
    } else {
      res.status(400).json({ error: 'Méthode invalide' });
    }
  } catch (err) {
    console.error('Disable 2FA error:', err);
    res.status(500).json({ error: 'Erreur lors de la désactivation' });
  }
});

// ==================== TEST TOTP (Development Only) ====================
if (process.env.NODE_ENV === 'development') {
  router.post('/2fa/test-totp', async (req, res) => {
    const { secret } = req.body;
    
    // Generate current TOTP token for testing
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32'
    });
    
    res.json({
      token,
      message: 'Use this token within 30 seconds',
      expiresIn: 30
    });
  });
}

module.exports = router;