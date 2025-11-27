// backend/test-pdf-setup.js
// Script pour vérifier que votre configuration PDF est correcte

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration PDF...\n');

// 1. Vérifier que le dossier uploads existe
const uploadsDir = path.join(__dirname, 'uploads');
const reportsDir = path.join(uploadsDir, 'reports');

console.log('📁 Vérification des dossiers:');
console.log(`   uploads: ${fs.existsSync(uploadsDir) ? '✅' : '❌'} ${uploadsDir}`);
console.log(`   reports: ${fs.existsSync(reportsDir) ? '✅' : '❌'} ${reportsDir}`);

// 2. Lister les PDFs disponibles
if (fs.existsSync(reportsDir)) {
  const files = fs.readdirSync(reportsDir);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));
  
  console.log(`\n📄 PDFs trouvés: ${pdfFiles.length}`);
  pdfFiles.forEach((file, i) => {
    const filePath = path.join(reportsDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`   ${i + 1}. ${file} (${sizeMB} MB)`);
  });
} else {
  console.log('\n⚠️  Dossier reports/ n\'existe pas. Création...');
  fs.mkdirSync(reportsDir, { recursive: true });
  console.log('✅ Dossier créé!');
}

// 3. Test de connexion à la DB
const db = require('./db');

async function testDatabase() {
  try {
    console.log('\n🗄️  Test de connexion à la base de données...');
    
    const result = await db.query(`
      SELECT 
        id, 
        title, 
        file_url, 
        file_size,
        author_first_name,
        author_last_name
      FROM reports 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    console.log(`✅ Connexion réussie! ${result.rows.length} rapports trouvés:\n`);
    
    result.rows.forEach((report, i) => {
      console.log(`   ${i + 1}. ID: ${report.id}`);
      console.log(`      Titre: ${report.title}`);
      console.log(`      Auteur: ${report.author_first_name} ${report.author_last_name}`);
      console.log(`      File URL: ${report.file_url || '❌ MANQUANT'}`);
      console.log(`      File Size: ${report.file_size ? (report.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}`);
      
      // Vérifier si le fichier existe physiquement
      if (report.file_url) {
        const filename = report.file_url.replace('/uploads/', '');
        const filePath = path.join(__dirname, 'uploads', filename);
        const exists = fs.existsSync(filePath);
        console.log(`      Fichier existe: ${exists ? '✅' : '❌ INTROUVABLE'} ${filePath}`);
      }
      console.log('');
    });
    
    // Compter les rapports avec/sans PDF
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(file_url) as with_pdf,
        COUNT(*) - COUNT(file_url) as without_pdf
      FROM reports
    `);
    
    const stats = statsResult.rows[0];
    console.log('📊 Statistiques:');
    console.log(`   Total rapports: ${stats.total}`);
    console.log(`   Avec PDF: ${stats.with_pdf}`);
    console.log(`   Sans PDF: ${stats.without_pdf}`);
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    process.exit();
  }
}

testDatabase();

console.log('\n💡 Pour tester l\'accès au PDF:');
console.log('   1. Démarrer le serveur: node server.js');
console.log('   2. Ouvrir dans le navigateur: http://localhost:5000/uploads/reports/votre_fichier.pdf');
console.log('   3. Vérifier la console pour les logs\n');