// middleware/auth.middleware.js  (VERSION CORRIGÉE ET COMPATIBLE 2025)
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, role, ... }
    return next();
  } catch (err) {
    console.log('Token invalide ou expiré:', err.message);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};