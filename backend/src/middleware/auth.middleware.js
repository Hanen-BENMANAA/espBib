// backend/src/middleware/auth.js
// Create this file if it doesn't exist

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in .env file!');
  process.exit(1);
}

// Main authenticate function (for most routes)
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    console.log('Token invalide:', err.message);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// authenticateToken - supports both header and query params
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader?.split(' ')[1] || req.query.token;
  
  if (!token) {
    console.error('❌ No token provided');
    return res.status(401).json({ 
      success: false,
      message: 'Authentification requise' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log('✅ Token verified for user:', decoded.email);
    next();
  } catch (error) {
    console.error('❌ Token error:', error.message);
    return res.status(403).json({ 
      success: false,
      message: 'Token invalide' 
    });
  }
}

// Export both functions
module.exports = authenticate;
module.exports.authenticate = authenticate;
module.exports.authenticateToken = authenticateToken;