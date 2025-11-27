// backend/scripts/fixFilePaths.js - RUN THIS ONCE TO FIX EXISTING DATA

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Normalize file path function
function normalizeFilePath(filePath) {
  if (!filePath) return null;

  filePath = filePath.trim();

  // Already normalized
  if (filePath.startsWith('/uploads/')) {
    return filePath;
  }

  // Windows absolute path
  if (filePath.includes('\\uploads\\')) {
    const uploadsPart = filePath.split('\\uploads\\')[1];
    return `/uploads/${uploadsPart.replace(/\\/g, '/')}`;
  }

  // Starts with uploads/ (no leading slash)
  if (filePath.startsWith('uploads/')) {
    return `/${filePath}`;
  }

  // Just a filename
  if (!filePath.includes('/') && !filePath.includes('\\')) {
    return `/uploads/reports/${filePath}`;
  }

  // Extract basename and put in reports folder
  const basename = path.basename(filePath);
  return `/uploads/reports/${basename}`;
}

// Main migration function
async function fixAllFilePaths() {
  const dbPath = path.join(__dirname, '../database.sqlite');
  const db = new sqlite3.Database(dbPath);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Get all reports
      db.all('SELECT id, file_path, file_url FROM reports', [], (err, reports) => {
        if (err) {
          console.error('❌ Error reading reports:', err);
          reject(err);
          return;
        }

        console.log(`📊 Found ${reports.length} reports to check`);

        let fixed = 0;
        let promises = [];

        reports.forEach((report) => {
          const normalizedPath = normalizeFilePath(report.file_path || report.file_url);
          
          if (normalizedPath && 
              (normalizedPath !== report.file_url || normalizedPath !== report.file_path)) {
            
            promises.push(new Promise((resolveUpdate, rejectUpdate) => {
              db.run(
                'UPDATE reports SET file_path = ?, file_url = ? WHERE id = ?',
                [normalizedPath, normalizedPath, report.id],
                (updateErr) => {
                  if (updateErr) {
                    console.error(`❌ Error updating report ${report.id}:`, updateErr);
                    rejectUpdate(updateErr);
                  } else {
                    console.log(`✅ Fixed report ${report.id}:`);
                    console.log(`   Old: ${report.file_path || report.file_url}`);
                    console.log(`   New: ${normalizedPath}`);
                    fixed++;
                    resolveUpdate();
                  }
                }
              );
            }));
          }
        });

        Promise.all(promises)
          .then(() => {
            console.log(`\n✨ Migration complete! Fixed ${fixed} report paths.`);
            db.close();
            resolve({ fixed, total: reports.length });
          })
          .catch((error) => {
            console.error('❌ Migration failed:', error);
            db.close();
            reject(error);
          });
      });
    });
  });
}

// Run migration if called directly
if (require.main === module) {
  console.log('🚀 Starting file path migration...\n');
  
  fixAllFilePaths()
    .then(({ fixed, total }) => {
      console.log(`\n✅ Success: ${fixed}/${total} paths normalized`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { fixAllFilePaths, normalizeFilePath };