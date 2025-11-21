// Stub - use pdf-lib or pdfkit in production
module.exports = {
  addWatermark: async (inputPath, outputPath, watermarkText) => {
    // Implement with pdf-lib if needed. For now just copy
    const fs = require('fs').promises;
    await fs.copyFile(inputPath, outputPath);
    return outputPath;
  }
};