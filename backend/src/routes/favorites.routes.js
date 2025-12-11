// backend/src/routes/favorites.routes.js
// FIXED VERSION - Returns data as array directly

const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth.middleware');

// TEST ROUTE
router.get('/test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Favorites route is working!',
    user: req.user
  });
});

// GET /api/favorites - Liste des favoris
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📚 Fetching favorites for user:', req.user.id);

    const { rows } = await db.query(`
      SELECT 
        r.id,
        r.title,
        r.file_url,
        r.abstract,
        r.keywords,
        r.academic_year,
        r.specialty,
        r.host_company,
        r.defense_date,
        r.submission_date,
        r.validated_at,
        r.favorite_count,
        r.author_first_name,
        r.author_last_name,
        r.supervisor,
        r.co_supervisor,
        r.email,
        r.student_number,
        uf.created_at as favorited_at,
        CONCAT(r.author_first_name, ' ', r.author_last_name) as author_name,
        r.supervisor as supervisor_name,
        r.co_supervisor as co_supervisor_name
      FROM user_favorites uf
      JOIN reports r ON uf.report_id = r.id
      WHERE uf.user_id = $1
      ORDER BY uf.created_at DESC
    `, [req.user.id]);

    console.log('✅ Found favorites:', rows.length);

    // ✅ FIX: Return array directly in data.favorites
    res.json({
      success: true,
      data: {
        favorites: rows  // ← Array is nested in favorites
      },
      count: rows.length
    });
  } catch (error) {
    console.error('❌ Error fetching favorites:', {
      message: error.message,
      stack: error.stack,
      detail: error.detail
    });
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des favoris',
      error: error.message
    });
  }
});

// POST /api/favorites - Ajouter un favori
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('📥 Add favorite request:', {
      body: req.body,
      userId: req.user?.id,
      userEmail: req.user?.email
    });

    const { reportId } = req.body;
    
    if (!reportId) {
      console.log('❌ Missing reportId');
      return res.status(400).json({ 
        success: false, 
        message: 'reportId est requis' 
      });
    }

    console.log('🔍 Checking if report exists:', reportId);

    // Vérifie que le rapport existe
    const reportCheck = await db.query(
      'SELECT id FROM reports WHERE id = $1',
      [reportId]
    );

    if (reportCheck.rows.length === 0) {
      console.log('❌ Report not found:', reportId);
      return res.status(404).json({ 
        success: false, 
        message: 'Rapport non trouvé' 
      });
    }

    console.log('✅ Report exists');

    // Vérifie si déjà en favori
    console.log('🔍 Checking existing favorite for user:', req.user.id, 'report:', reportId);
    
    const existingFavorite = await db.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND report_id = $2',
      [req.user.id, reportId]
    );

    if (existingFavorite.rows.length > 0) {
      console.log('ℹ️ Already favorited');
      return res.json({ 
        success: true, 
        message: 'Déjà dans les favoris',
        alreadyFavorited: true
      });
    }

    console.log('➕ Adding to favorites...');

    // Ajoute aux favoris
    await db.query(`
      INSERT INTO user_favorites (user_id, report_id)
      VALUES ($1, $2)
    `, [req.user.id, reportId]);

    console.log('✅ Added to favorites');

    // Incrémente le compteur
    console.log('📊 Updating favorite count...');
    
    try {
      await db.query(`
        UPDATE reports 
        SET favorite_count = COALESCE(favorite_count, 0) + 1 
        WHERE id = $1
      `, [reportId]);
      console.log('✅ Favorite count updated');
    } catch (countError) {
      console.warn('⚠️ Could not update favorite count (non-critical):', countError.message);
    }

    res.json({ 
      success: true, 
      message: 'Ajouté aux favoris' 
    });

  } catch (error) {
    console.error('❌ Error adding favorite:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// DELETE /api/favorites/:reportId - Retirer un favori
router.delete('/:reportId', authenticateToken, async (req, res) => {
  try {
    const { reportId } = req.params;

    console.log('🗑️ Removing favorite:', {
      userId: req.user.id,
      reportId: reportId
    });

    const result = await db.query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND report_id = $2 RETURNING id',
      [req.user.id, reportId]
    );

    if (result.rows.length === 0) {
      console.log('❌ Favorite not found');
      return res.status(404).json({
        success: false,
        message: 'Favori non trouvé'
      });
    }

    console.log('✅ Removed from favorites');

    // Décrémente le compteur
    await db.query(`
      UPDATE reports 
      SET favorite_count = GREATEST(COALESCE(favorite_count, 1) - 1, 0)
      WHERE id = $1
    `, [reportId]);

    console.log('✅ Favorite count decremented');

    res.json({
      success: true,
      message: 'Retiré des favoris'
    });

  } catch (error) {
    console.error('❌ Error removing favorite:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
});

// GET /api/favorites/check/:reportId
router.get('/check/:reportId', authenticateToken, async (req, res) => {
  try {
    const { reportId } = req.params;

    console.log('🔍 Checking favorite status:', {
      userId: req.user.id,
      reportId: reportId
    });

    const result = await db.query(
      'SELECT id FROM user_favorites WHERE user_id = $1 AND report_id = $2',
      [req.user.id, reportId]
    );

    const isFavorited = result.rows.length > 0;

    console.log('✅ Favorite status:', isFavorited);

    res.json({
      success: true,
      isFavorited: isFavorited
    });

  } catch (error) {
    console.error('❌ Error checking favorite:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
      isFavorited: false
    });
  }
});

module.exports = router;