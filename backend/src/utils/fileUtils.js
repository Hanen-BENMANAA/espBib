// backend/src/utils/fileUtils.js - NORMALIZE FILE PATHS

const path = require('path');
const fs = require('fs');

/**
 * Normalize file path to always return a relative URL path
 * Handles both Windows absolute paths and relative paths
 */
function normalizeFilePath(filePath) {
  if (!filePath) return null;

  // Remove any leading/trailing whitespace
  filePath = filePath.trim();

  // If it's already a URL path (starts with /uploads), return as-is
  if (filePath.startsWith('/uploads/')) {
    return filePath;
  }

  // If it's a Windows absolute path, extract the relative part
  if (filePath.includes('\\uploads\\')) {
    const uploadsPart = filePath.split('\\uploads\\')[1];
    return `/uploads/${uploadsPart.replace(/\\/g, '/')}`;
  }

  // If it starts with uploads/ (no leading slash)
  if (filePath.startsWith('uploads/')) {
    return `/${filePath}`;
  }

  // If it's just a filename in /uploads/
  if (!filePath.includes('/') && !filePath.includes('\\')) {
    return `/uploads/${filePath}`;
  }

  // Last resort: assume it's in uploads directory
  const basename = path.basename(filePath);
  return `/uploads/${basename}`;
}

/**
 * Get absolute file path for file system operations
 */
function getAbsoluteFilePath(filePath) {
  const normalized = normalizeFilePath(filePath);
  if (!normalized) return null;

  // Remove leading slash and join with project root
  const relativePath = normalized.substring(1); // Remove leading /
  return path.join(__dirname, '../../', relativePath);
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  try {
    const absolutePath = getAbsoluteFilePath(filePath);
    return fs.existsSync(absolutePath);
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}

/**
 * Fix all report file paths in database (run once as migration)
 */
async function fixReportFilePaths(db) {
  try {
    console.log('🔧 Fixing report file paths...');

    // Get all reports
    const reports = await db.all('SELECT id, file_path, file_url FROM reports');

    let fixed = 0;
    for (const report of reports) {
      const normalizedPath = normalizeFilePath(report.file_path || report.file_url);
      
      if (normalizedPath && (normalizedPath !== report.file_url || normalizedPath !== report.file_path)) {
        await db.run(
          'UPDATE reports SET file_path = ?, file_url = ? WHERE id = ?',
          [normalizedPath, normalizedPath, report.id]
        );
        console.log(`✅ Fixed report ${report.id}: ${normalizedPath}`);
        fixed++;
      }
    }

    console.log(`✨ Fixed ${fixed} report file paths`);
    return { success: true, fixed };
  } catch (error) {
    console.error('❌ Error fixing file paths:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  normalizeFilePath,
  getAbsoluteFilePath,
  fileExists,
  fixReportFilePaths
};