// backend/routes/users.routes.js  ← REMPLACE TOUT LE FICHIER PAR ÇA
const express = require('express');
const router = express.Router();
const db = require('../db');





// ROUTE PUBLIQUE TEMPORAIRE (SANS AUTH) → JUSTE POUR DÉBLOQUER
router.get('/supervisors-public', async (req, res) => {
  try {
    console.log('PUBLIC supervisors route called');

    const result = await db.query(`
      SELECT id, first_name, last_name, email 
      FROM users 
      WHERE role IN ('teacher', 'admin')
      ORDER BY last_name, first_name
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

module.exports = router;